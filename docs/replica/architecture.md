# Architecture : web app No Contact (reconstruction des features cœur de "No Contact – Breakup Recovery")

Lit : `replica/recon.md`, `replica/features.csv`. SQL complet : `replica/schema.sql` (première migration, validé sur PostgreSQL 16).

## Stack

| couche | choix | pourquoi |
| --- | --- | --- |
| web | Next.js (App Router) + TypeScript | Server Components et Server Actions : la logique sensible (chiffrement, IA, Stripe) reste côté serveur |
| styles | Tailwind CSS, mobile-first | breakpoints `md` (768) et `lg` (1024) pour bottom tabs ↔ sidebar ; tokens issus de replica-design |
| base de données | Supabase PostgreSQL | une seule base, RLS native, migrations versionnées |
| accès données | `@supabase/ssr` + types générés (`supabase gen types`) | pas d'ORM : la RLS fait déjà le contrôle d'accès, les types suffisent |
| auth | Supabase Auth : magic link + Google OAuth | pas de mot de passe à retenir en pleine crise ; session en cookie http-only |
| chiffrement | AES-256-GCM applicatif (Node `crypto`) dans le code serveur | voir § Chiffrement |
| fichiers | Supabase Storage, bucket privé + URLs signées | pour le Vault (photos, captures) ; plus tard |
| IA | OpenAI, `gpt-4o-mini`, **nom du modèle en variable d'env** | rapide et peu cher, mais **arrêt prévu le 14 janvier 2027** : voir § Les parties qui mordent |
| modération | OpenAI Moderation API | détection de détresse avant chaque réponse de Sam |
| paiements | Stripe Checkout (`subscription` mensuel, `payment` à vie) + Customer Portal | pas de commission store |
| email | Resend | rappels et repli des Web Push |
| SMS | Twilio, **reporté après la v1** | coût par SMS, et un SMS « ton no contact… » sur un écran verrouillé n'est pas discret |
| push | Web Push (VAPID, lib `web-push`) + service worker | iOS : seulement si la PWA est installée |
| jobs | Vercel Cron → route handlers protégés par `CRON_SECRET` | une tâche horaire suffit pour la v1 |
| hébergement | Vercel (région proche de Supabase) | intégration Next.js, previews par PR |

Variables d'env (`.env.example`, sans valeurs) : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATA_ENCRYPTION_KEYS` (JSON `{ "1": "<base64 32 octets>" }`), `DATA_ENCRYPTION_KEY_CURRENT=1`, `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o-mini`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_LIFETIME`, `RESEND_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.

## Chiffrement des données sensibles

- **Ce qui est chiffré** : Ick List (`red_flags.body_enc`), Text Your Ex (`unsent_messages.body_enc`), messages du coach (`chat_messages.content_enc`), mémoire du coach, réflexions de rechute, notes de check-in. Ce sont les colonnes `*_enc bytea`.
- **Comment** : AES-256-GCM dans `lib/crypto.ts`, côté serveur uniquement. Format stocké : `iv(12) | tag(16) | ciphertext`. `key_version` sur chaque ligne permet la rotation : on ajoute une clé, on rechiffre en tâche de fond.
- **Pourquoi pas pgsodium ni Vault** : pgsodium est déprécié chez Supabase, et Vault sert aux secrets, pas aux données utilisateurs. Le chiffrement applicatif marche partout et garde le texte clair hors de la base, des sauvegardes et du dashboard Supabase.
- **Limite à assumer honnêtement** : ce n'est **pas** du chiffrement de bout en bout. Le serveur détient la clé, et il le faut, puisque Sam doit lire l'Ick List et l'historique. Formulation juste pour le marketing : « chiffré au repos, illisible même depuis notre base de données ».
- **Conséquence** : aucune recherche SQL dans ces textes. Les catégories filtrables (`category`, `trigger_tag`, `mood`) restent en clair.
- Le client ne lit jamais les colonnes `*_enc`. Le déchiffrement se fait dans des Server Components ou Server Actions.

## Schéma

Tables : 15. Accès : **RLS Postgres** sur toutes les tables ; écritures sensibles par le serveur (service role).

| table | rôle | points clés |
| --- | --- | --- |
| `profiles` | profil 1-1 avec `auth.users` | fuseau IANA, mode coach, plan dénormalisé ; seules les colonnes éditables sont accordées à `authenticated` |
| `nc_periods` | **streaks** : une période de no contact | **index unique partiel : une seule période active par utilisateur** ; `started_at` peut être dans le passé |
| `relapse_reflections` | Reset & Reflect | 1-1 avec la période close ; texte chiffré, `trigger_tag` en clair |
| `check_ins` | check-in quotidien | `unique (user_id, local_date)` : un par jour local |
| `urge_events` | passages en Panic Room | outil utilisé, issue ; alimente les stats |
| `red_flags` | **Ick List** | catégorie (red flag, dealbreaker, ick, raison), épinglage, ordre ; texte chiffré |
| `unsent_messages` | **Text Your Ex (But Don't)** | chiffré ; lié à l'envie qui l'a provoqué |
| `chat_threads` / `chat_messages` | **historique du coach Sam** | mode par message, drapeau de modération, modèle et tokens tracés |
| `coach_memory` | résumé long terme par utilisateur | régénéré par job, chiffré |
| `ai_usage` | quota mensuel IA | indispensable avec l'accès à vie |
| `subscriptions` | Stripe : mensuel ou à vie | montants en centimes + devise |
| `stripe_events` | idempotence des webhooks | clé = `evt_…` |
| `push_subscriptions` | abonnements Web Push | un par navigateur |
| `notification_log` | anti-doublon des rappels | `unique (user_id, kind, dedupe_key)` |

Extrait du cœur (le reste est dans `schema.sql`) :

```sql
create table public.nc_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  end_reason text check (end_reason in ('relapse','goal_reached','manual')),
  target_days integer check (target_days > 0),
  rules jsonb not null default '[]',
  constraint reason_iff_ended check ((ended_at is null) = (end_reason is null))
);
create unique index nc_periods_one_active on public.nc_periods (user_id) where ended_at is null;
```

Le **reset** passe par la fonction `reset_streak()`. Elle clôt la période, enregistre la réflexion et ouvre la suivante dans une seule transaction, en reprenant l'objectif et les règles. Aucun état intermédiaire possible.

**Calcul du streak** (jamais stocké, toujours dérivé) :
- jours courants = jours calendaires entre `started_at` et maintenant, **dans le fuseau du profil** (`date-fns-tz`) ;
- record = max des durées des périodes closes ;
- cumul « clean » = somme de toutes les périodes. On l'affiche à côté du compteur pour adoucir l'effet « tout recommencer » relevé dans les avis.

`on delete cascade` partout depuis `auth.users` : supprimer le compte efface tout (RGPD).

## API

Server Actions sauf mention contraire. « user » = session Supabase valide, RLS appliquée.

### Auth et onboarding (F01)
| méthode / chemin | fait | qui | entrée | sortie | flow |
| --- | --- | --- | --- | --- | --- |
| `signInWithOtp` | envoie le magic link | public | email | état envoyé | F01 |
| `GET /auth/callback` | échange le code, pose le cookie, redirige vers `/onboarding` ou `/app` | public | code | redirect | F01 |
| `signInWithOAuth('google')` | Google | public | — | redirect | F01 |
| `saveOnboarding` | profil (type de relation, surnom, fuseau détecté) | user | form | profil | F01 |
| `startPeriod` | crée la période active (date de dernier contact, objectif, règles) | user | started_at, target_days, rules | période | F01 |
| middleware | protège `/app/*`, redirige vers `/onboarding` si non onboardé | — | — | — | — |

### Streaks (F02, F06)
| `getStreak` (Server Component) | jours courants, record, cumul, prochain palier | user | — | stats | F02 |
| `checkIn` | upsert du check-in du jour local | user | mood, urge, triggers, note | check-in | F02 |
| `resetStreak` | chiffre la réflexion puis appelle `reset_streak()` | user | contact_kind, trigger_tag, reflection | nouvelle période | F06 |
| `updatePeriodRules` | modifie l'objectif et les règles | user | target_days, rules | période | F01 |

### Panic Room, Ick List, Text Your Ex (F03, F04)
| `logUrge` | enregistre l'entrée en Panic Room | user | intensity | urge_event | F03 |
| `closeUrge` | issue (résisté / rechute) + outil utilisé | user | id, outcome, tool | — | F03 |
| `addRedFlag` / `updateRedFlag` / `deleteRedFlag` / `reorderRedFlags` | CRUD de l'Ick List (chiffre) | user | body, category, pinned | red_flag | F04 |
| `listRedFlags` (Server Component) | déchiffre pour l'affichage | user | — | liste | F03, F04 |
| `sendUnsent` | « envoie » : chiffre et archive, **aucun appel externe** | user | body, urge_event_id? | message | F03 |

### Coach Sam (F07)
| `POST /api/coach` (route handler, SSE) | modération → contexte → OpenAI en streaming → chiffre et stocke les deux messages → incrémente le quota | user + plan actif | thread_id?, message, mode | flux de tokens | F07 |
| `setCoachMode` | gentle ↔ no_bs | user | mode | profil | F07 |
| `listThreads` / `getThread` | historique déchiffré | user | — | messages | F07 |

Contexte envoyé au modèle, borné à environ 3k tokens :
- le prompt système du mode actif ;
- `coach_memory` ;
- le streak du jour ;
- les 5 red flags épinglés ;
- les 3 derniers check-ins ;
- les 20 derniers messages du fil.

**Prompts système**, versionnés dans `lib/coach/prompts.ts`. Socle commun aux deux modes :
- Sam ne pousse jamais à recontacter l'ex.
- Il ne diagnostique pas.
- Il ne se présente pas comme thérapeute.
- Il renvoie vers des ressources d'aide en cas de détresse.
- Il refuse d'aider à surveiller l'ex.
- Il répond dans la langue de l'utilisateur.

Ce qui distingue les deux modes :
- **Classique** : chaleureux, valide l'émotion, propose une action concrète.
- **No-BS** : direct, sans détours, met l'utilisateur face à ses rationalisations (« tu cherches une excuse pour lui écrire »). Il reste dur sur le comportement, jamais humiliant pour la personne. Le mode est désactivé automatiquement si la modération signale une détresse.

**Si la modération signale un risque** (self-harm, violence) : réponse sûre fixe, ressources d'aide selon la langue ou le pays, `flagged` renseigné, et pas de mode No-BS sur ce tour.

### Paiements
| `createCheckout` | session Stripe : `subscription` (mensuel) ou `payment` (à vie) | user | plan | URL Checkout | F01 |
| `createPortal` | Customer Portal | user | — | URL | — |
| `POST /api/stripe/webhook` | vérifie la signature, dédoublonne via `stripe_events`, met à jour `subscriptions` puis `profiles.plan/plan_active` | Stripe | événement | 200 | — |

Événements traités : `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`, `charge.refunded`.

### Notifications, compte
| `savePushSubscription` / `deletePushSubscription` | abonnement Web Push du navigateur | user | endpoint, keys | — | — |
| `exportData` | JSON de toutes les données, déchiffrées | user | — | fichier | — |
| `deleteAccount` | marque `deleted_at`, annule Stripe, purge par job | user | confirmation | — | — |
| `setLockPin` | hash côté serveur | user | pin | — | — |

**Webhooks entrants** : Stripe. **Sortants** : aucun.

**Jobs (Vercel Cron)** :

| job | fréquence | ce qu'il fait |
| --- | --- | --- |
| `reminders` | toutes les heures | rappelle les utilisateurs dont l'heure locale = `reminder_hour` et sans check-in du jour. Push d'abord ; email Resend si aucun push valide. Dédoublonné par `notification_log`. Textes neutres (« Ton check-in du jour t'attend »), jamais le nom de l'ex. |
| `milestones` | toutes les heures | paliers J7, J14, J30, J60, J90 franchis → notification |
| `coach-memory` | toutes les nuits | résume les nouveaux messages dans `coach_memory` |
| `purge` | toutes les nuits | supprime les comptes `deleted_at` + 7 jours ; nettoie les abonnements push morts (410) |

## Les parties qui mordent

- **Fin de vie du modèle** : `gpt-4o-mini` a une date d'arrêt annoncée par OpenAI, le **14 janvier 2027**, soit dans 3 mois. Le modèle se lit dans `OPENAI_MODEL`, les prompts sont testés sur un jeu de cas (crise, envie de recontacter, No-BS), et on prévoit de basculer vers le remplaçant indiqué par OpenAI avant le lancement.
- **Fuseaux et heure d'été** : le jour du streak et du check-in dépend du fuseau du profil (détecté à l'onboarding, modifiable), pas de celui du serveur. `local_date` est calculée côté serveur avec ce fuseau. Si l'utilisateur voyage, le streak ne perd ni ne gagne de jour : seul l'affichage change.
- **Idempotence** : les webhooks Stripe sont dédoublonnés par `stripe_events`. Les rappels sont dédoublonnés par `notification_log`. Le double clic sur « envoyer » dans Text Your Ex est géré par un bouton désactivé et une clé client.
- **Concurrence** : deux onglets qui font un reset en même temps se heurtent au `for update` et à l'index unique partiel, donc une seule période active. Le check-in se fait par upsert sur `(user_id, local_date)`.
- **Coût IA et accès à vie** : chaque utilisateur à vie coûte en tokens indéfiniment. Il faut un quota mensuel (`ai_usage`, par exemple 300 messages par mois), un rate limit par minute et un historique tronqué. Fixer le prix à vie en conséquence.
- **Données envoyées à OpenAI** : l'API ne s'entraîne pas sur les données par défaut, mais l'utilisateur doit le savoir. Le mentionner dans la politique de confidentialité, n'envoyer que le contexte nécessaire, et jamais l'email.
- **Hors ligne** : le service worker met en cache `/panic` (respiration, affirmations) et le dernier état du compteur. L'Ick List hors ligne voudrait dire du texte clair dans le cache du navigateur : à proposer en option seulement, avec le verrou par code.
- **Web Push sur iOS** : ne fonctionne que si la PWA est installée (iOS 16.4+). Afficher un guide d'installation, et basculer sur l'email sinon.
- **RGPD** : export et suppression en libre-service, cascade complète, purge des médias Storage. Données sensibles au sens large (santé mentale) : consentement explicite à l'onboarding.
- **Sécurité** :
  - `SUPABASE_SERVICE_ROLE_KEY` et les clés de chiffrement restent côté serveur.
  - Le client n'a aucun accès en écriture à `chat_messages` ni à `subscriptions`.
  - Les colonnes de plan du profil ne sont pas modifiables par l'utilisateur ; c'est testé.
- **Discrétion** : titre d'onglet et notifications neutres, verrou par code, pas de prévisualisation du contenu dans les emails.

## Ordre de build

Chaque jalon liste ses écrans (S-ID), ses tables et ses routes. Le code est neuf, écrit à partir de la recon, sans rien reprendre de l'original.

**M0 — Socle** (½ jour)
Projet Next.js + Tailwind + TypeScript, Supabase local (`supabase init`), migration `0001_init.sql`, types générés, `lib/crypto.ts` + tests, `.env.example`, layout shell : bottom tabs en mobile, sidebar en desktop.

**M1 — Tunnel d'authentification** (1 à 2 jours)
- S24 `/login` : magic link, Google, états envoyé / erreur / lien expiré.
- `/auth/callback`, middleware de protection de `/app`.
- S01 `/onboarding` : type de relation, surnom, fuseau auto-détecté, consentement.
- S02 `/onboarding/rules` : date du dernier contact, objectif, règles → `startPeriod`.
- Tables : `profiles`, `nc_periods`.
- Terminé quand : un nouvel utilisateur arrive sur `/app` avec un compteur à J0 (ou J-n), sur mobile comme sur desktop.

**M2 — Streak tracker + Reset & Reflect** (2 jours) — *vertical slice*
- S04 `/app` : compteur de jours, record, cumul « clean », jauge vers l'objectif, prochain palier.
- S13 `/app/reset` : formulaire de réflexion → `resetStreak`. Message de reprise non culpabilisant.
- S22 `/app/progress` (version simple) : historique des périodes.
- Tables : `nc_periods`, `relapse_reflections`.
- Terminé quand : inscription → compteur → rechute → reset → historique conservé fonctionne de bout en bout, avec des tests e2e sur fuseau et double reset.

**M3 — Panic Room** (1 à 2 jours)
- S06 `/panic` : respiration animée (`prefers-reduced-motion`), red flags épinglés, liens vers le faux chat et Sam, bouton « j'ai tenu ».
- FAB mobile, raccourci clavier desktop. Tables : `urge_events`.

**M4 — Ick List** (1 jour)
- S11 `/app/vault/icks` : ajout rapide, catégories, épinglage, réordonnancement, mode relecture plein écran. Tables : `red_flags` (chiffrée).

**M5 — Text Your Ex (But Don't)** (1 jour)
- S07 `/app/unsent` : UI de messagerie générique, faux « envoyé », intervention après envoi, historique. Tables : `unsent_messages` (chiffrée).

**M6 — Coach Sam** (3 à 4 jours)
- S09 `/app/coach` : streaming SSE, toggle de mode, fils, modération, quota, mémoire. Jeu de tests de prompts.
- Tables : `chat_threads`, `chat_messages`, `coach_memory`, `ai_usage`.

**M7 — Paiements** (1 à 2 jours)
- S00 landing + S03 `/pricing` → Checkout (mensuel / à vie), webhook, Customer Portal, verrouillage du coach et de la synchro selon le plan.
- Tables : `subscriptions`, `stripe_events`.

**M8 — Check-in + notifications** (2 jours)
- S05 check-in (bottom sheet ou modale), jobs `reminders` et `milestones`, Web Push + repli Resend.
- Tables : `check_ins`, `push_subscriptions`, `notification_log`.

**M9 — PWA et confiance** (1 à 2 jours)
- Manifest + raccourcis vers `/panic` et `/checkin`, service worker hors ligne.
- S23 `/settings` : export, suppression, verrou par code. Politique de confidentialité, i18n FR/EN.

→ **Fin des must-haves : environ 3 à 4 semaines** pour un développeur seul.

**Ensuite** (should puis could, d'après `features.csv`) : Evidence Vault médias (S10), affirmations et journal (S17), Toolkit (S15), Roadmap (S21), insights (S22 complet), Abuse Awareness (S19), puis les could : thèmes du faux chat, Conversation Analyzer, Challenges, Learn, coach vocal. SMS Twilio seulement si la demande le justifie.

**Puis** : les correctifs trouvés par replica-entrepreneur dans les avis de l'original.
