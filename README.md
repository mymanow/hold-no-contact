# Hold — no contact, un jour après l'autre

Web app SaaS (mobile d'abord, desktop ensuite) pour tenir un **no contact** après une rupture ou une situationship : un compteur qui garde ta progression même après un faux pas, une Panic Room pour les moments de crise, ton Ick List, un faux chat pour écrire sans envoyer, et Sam, un coach IA avec un mode No-BS.

> « Hold » est un nom de travail, tiré du nom du dépôt. Le vrai nom et la marque viendront à l'étape branding.

## État d'avancement

| jalon | contenu | état |
| --- | --- | --- |
| M0 — Socle | Next.js 16, Tailwind v4 + tokens, schéma Supabase (RLS), chiffrement applicatif, shell responsive | ✅ |
| M1 — Tunnel d'auth | magic link + Google, callback, proxy de protection, onboarding en 2 étapes | ✅ |
| M2 — Streak tracker | compteur (fuseau de l'utilisateur), record, cumul, paliers, Reset & Reflect en modale de confirmation, historique | ✅ |
| M3 — Panic Room | respiration guidée 4-4-6, intensité de l'envie, ancrage 5-4-3-2-1, minuteur 10 min, alternatives, « J'ai tenu » journalisé, ressources d'aide — reste : Ick List épinglée, Sam | ✅ |
| M4 — Ick List | table et composant `IckCard` prêts, écran à venir | ⏳ |
| M5 — Text Your Ex (But Don't) | faux chat, messages interceptés et chiffrés, suppression, réessai, question après envoi | ✅ |
| M6 — Coach Sam (OpenAI) | tables prêtes | ⏳ |
| M7 — Paiements Stripe | tables prêtes | ⏳ |
| M8 — Check-in + notifications | tables prêtes | ⏳ |
| M9 — PWA, export, suppression, verrou | — | ⏳ |

Le détail de chaque jalon est dans [`docs/replica/architecture.md`](docs/replica/architecture.md).

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components, Partial Prefetching) + **TypeScript**
- **Tailwind CSS v4**, thème généré depuis `design/tokens.json` (dark mode « eau de nuit », WCAG AA partout)
- **Supabase** : PostgreSQL, Auth (magic link, Google), Row Level Security sur toutes les tables
- Polices auto-hébergées (`@fontsource-variable`) : aucune requête vers Google depuis le navigateur
- Tests : **Vitest**
- Prévu : OpenAI (Sam), Stripe (mensuel + à vie), Resend (emails), Web Push

## Démarrer en local

Prérequis : Node.js ≥ 20.9, Docker (pour Supabase en local), Python 3 (pour régénérer les tokens).

```bash
npm install
cp .env.example .env.local

# Supabase local : démarre Postgres + Auth + Inbucket, applique la migration
npm run db:start
# → copier "API URL" dans NEXT_PUBLIC_SUPABASE_URL et "Publishable key" dans NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Clé de chiffrement des champs sensibles
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# → DATA_ENCRYPTION_KEYS={"1":"<la clé>"}

npm run dev
```

Ouvre http://localhost:3000. Les emails de connexion locaux arrivent dans l'interface Inbucket/Mailpit affichée par `npm run db:start` (en général http://127.0.0.1:54324).

Google OAuth en local : créer un client OAuth dans Google Cloud, puis activer `[auth.external.google]` dans `supabase/config.toml` avec ses identifiants.

## Scripts

| commande | rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` / `npm start` | build et serveur de production |
| `npm run lint` · `npm run typecheck` · `npm test` | qualité |
| `npm run db:start` · `npm run db:reset` | Supabase local, réapplique les migrations |
| `npm run db:types` | génère les types TypeScript de la base (`src/lib/supabase/database.types.ts`) |
| `npm run tokens` | régénère `src/app/tokens.css` depuis `design/tokens.json` |

## Structure

```
src/
  proxy.ts                 rafraîchit la session, protège /app et /onboarding (ex-middleware)
  app/
    page.tsx               landing
    login/                 magic link + Google
    auth/                  callback OAuth / magic link, déconnexion
    onboarding/            S01 profil · S02 règles et date du dernier contact
    app/                   espace connecté : accueil (compteur + modale de reset), reset, unsent (faux chat), progrès, profil
    panic/                 Panic Room, publique et statique (s'ouvre même déconnecté)
    design/                banc d'essai des composants et du faux chat (données et actions fictives)
  components/              shell responsive, compteur, icônes
  lib/
    dal.ts                 accès aux données (session, profil, périodes)
    streak.ts              calcul du streak dans le fuseau de l'utilisateur (testé)
    crypto.ts              AES-256-GCM des champs sensibles (testé)
    supabase/              client serveur
supabase/
  migrations/              schéma complet : 15 tables, RLS, reset_streak() atomique
design/
  tokens.json              source de vérité du design system
  gen-tokens-css.py        tokens.json → src/app/tokens.css
docs/replica/              recon, matrice de features, architecture, specs composants, aperçu
```

## Choix importants

- **Le streak n'est jamais stocké.** Il est recalculé depuis les périodes de no contact (`nc_periods`), en jours calendaires dans le fuseau de l'utilisateur. Un index unique partiel garantit une seule période active par personne.
- **Un reset ne fait rien perdre.** `reset_streak()` clôt la période, enregistre la réflexion et ouvre la suivante en une transaction. Record et cumul restent affichés.
- **Chiffrement applicatif** des textes sensibles (réflexions, Ick List, messages, coach) : le texte clair ne touche jamais la base ni les sauvegardes. Ce n'est pas du bout en bout, puisque le serveur détient la clé (Sam doit pouvoir lire). `key_version` permet la rotation.
- **La Panic Room ne dépend de rien** : page statique, publique, sans lecture de session.
- **Discrétion** : titre d'onglet neutre, pas d'indexation, et jamais le nom de l'ex en notification.

## Vérifications faites

- Migration exécutée sur PostgreSQL 16 : reset atomique OK ; isolation RLS entre deux utilisateurs OK ; un utilisateur ne peut pas modifier son propre plan.
- `npm run lint`, `npm run typecheck`, `npm test` (16 tests) et `npm run build` passent.
- Parcours testés dans un navigateur headless à 390 et 1440 px, sans erreur console : respiration, ancrage, « J'ai tenu », envoi intercepté, échec et réessai, suppression, modale de reset (focus, Échap). Captures dans `docs/replica/clone-screens/`, journal dans `docs/replica/build-log.md`.
- À faire avec Supabase lancé : le parcours complet inscription → onboarding → compteur → reset.

## Avertissements

- `gpt-4o-mini`, prévu pour Sam, a une date d'arrêt annoncée par OpenAI au 14 janvier 2027. Le modèle sera lu dans `OPENAI_MODEL`.
- L'app touche à la santé émotionnelle : la Panic Room affiche des ressources d'aide (112, 3114 en France). Sam aura des garde-fous de crise obligatoires.
