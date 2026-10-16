# Recon map : No Contact – Breakup Recovery (original : iOS/Android → clone : web app SaaS responsive)

Éditeur : Ember Labs Ltd — site gonocontact.com (Framer, design Deserve Studio)
Plateforme cible du clone : **web app SaaS**, mobile-first et adaptative (mobile 360 px → desktop 1440 px), installable en PWA. Pas d'app native.
Scope : la boucle cœur — compteur de no contact avec Reset & Reflect, Panic Room, Ick List, faux chat "Text Your Ex (But Don't)", coach IA "Sam" avec mode No-BS, check-ins quotidiens et abonnement. Communauté et contenus éditoriaux en périphérie.
Pour : benchmark concurrentiel de l'app No Contact de Marc (repo mymanow/no-contact)
Date : 2026-10-16
Méthode : sources publiques uniquement (site, pricing, blog, fiche App Store + changelog). Aucun compte, aucun accès derrière le paywall. Les captures d'écran de la fiche n'étaient pas lisibles en texte : l'inventaire des écrans est **déduit** des features décrites (confiance indiquée). À valider en installant l'app sur ton propre téléphone.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | site marketing | https://gonocontact.com/ | features, FAQ, 4 témoignages, fausses citations presse assumées ("probably") |
| 2 | page pricing | https://gonocontact.com/pricing | un seul plan affiché "No contact essentials" à 19,99 $, période non précisée |
| 3 | fiche App Store | https://apps.apple.com/us/app/no-contact-breakup-recovery/id6746055015 | 4,7★ / 2,3K notes, 16+, Health & Fitness, EN seulement, v1.0.40 |
| 4 | changelog App Store | (onglet Version History de #3) | 1.0.4 (juin 2025) → 1.0.40 (août 2026) |
| 5 | blog | https://gonocontact.com/blog | 8 articles SEO (juin–juil. 2026), aucune info produit |
| 6 | Discord support | https://discord.gg/cfXsSFJUVg | non consulté |
| 7 | Google Play | lien cassé sur le site (pointe vers la home du Play Store) | fiche Android non trouvée — à confirmer |

Remarques sur les sources : le lien "Privacy Policy" pointe vers l'EULA standard d'Apple (pas de politique propre), et les boutons "For Android / For iPhone" du blog pointent vers une page légale Apple. Deux noms App Store pour le même ID : "Breakup Recovery" et "Resist the Urge" (test de nom / ASO).

## Core loop

Je tiens mon no contact jour après jour : le compteur monte, et quand l'envie de recontacter arrive, j'ouvre la Panic Room ou je parle au coach IA au lieu d'écrire à mon ex.

## Les 5 features clés (détail)

Nom du coach : **"Sam"** sur le site, **"Kai"** sur la fiche App Store (renommé, ou test). Dans le clone, prends un nom à toi.

### 1. Streak tracker + Reset & Reflect (S04, S13)
- Compteur de jours depuis le dernier contact, avec un objectif de durée et des règles personnalisées (ajoutés en v1.0.23). Le site recommande 30 jours minimum, idéalement 60.
- Paliers et badges : la v1.0.26 ajoute les Streaks. Une streak de check-ins existe en plus du compteur de no contact.
- Reset & Reflect : après une rechute, une courte réflexion (ce qui s'est passé, le déclencheur, la leçon), puis le compteur repart de J0. L'historique, le record et les insights sont conservés.
- Point faible remonté dans les avis : le reset donne l'impression de "tout recommencer". Pour le clone : afficher le cumul de jours "clean" et le record à côté du compteur courant.
- Web : calcul du compteur sur le **fuseau horaire de l'utilisateur**, stocké côté serveur (pas en localStorage, pour éviter le bug de perte de progression).

### 2. Panic Room (S06)
- Un bouton toujours accessible ouvre un écran plein écran sans distraction.
- Contenu (Reality Check, v1.0.4) : respiration guidée, affirmations, vidéos de distraction, rappel des red flags, bouton "rescue". Depuis la Panic Room, on peut aller au faux chat ou au coach.
- But : tenir les quelques minutes que dure le pic d'envie.
- Web : FAB fixe sur mobile, bouton dans la sidebar et raccourci clavier sur desktop. Route dédiée `/panic` pour pouvoir l'ajouter en raccourci PWA (manifest `shortcuts`). Animation de respiration en CSS, en respectant `prefers-reduced-motion`. Fonctionne hors ligne via le service worker.
- Garde-fou : si l'utilisateur exprime une détresse grave, afficher des ressources d'aide.

### 3. Ick List (S10, S11)
- Liste des red flags, dealbreakers, "icks" et raisons de ne pas revenir. On la relit quand la nostalgie embellit le passé.
- Rattachée à l'Evidence Vault, qui stocke aussi captures, photos, vidéos et notes vocales (refonte v1.0.31).
- Web : saisie rapide d'une ligne (Entrée = ajouter), tri et catégories, mode "relire" plein écran une carte à la fois. Upload par glisser-déposer sur desktop et via l'appareil photo ou la galerie sur mobile (`<input type=file accept capture>`). Médias en bucket privé avec URLs signées.

### 4. "Text Your Ex (But Don't)" (S07, S08)
- Une fausse messagerie : on écrit à l'ex, le message "part" mais **rien n'est envoyé**. Il est intercepté et archivé.
- La v1.0.28 ajoute des skins (look iMessage, WhatsApp…). Pour le clone : des thèmes génériques **à toi**, pas de copie des UI d'Apple ou de Meta (marques et trade dress).
- Version enrichie possible : après l'envoi, une intervention ("Qu'espérais-tu en envoyant ça ?") ou une réponse du coach. Les brouillons sont relisibles plus tard.
- Web : aucun accès aux contacts ni aux SMS, aucune intégration de messagerie. C'est un argument de confiance à afficher clairement. Bulles avec indicateur "lu" fictif, champ de saisie collé en bas (gérer le clavier virtuel mobile avec `dvh` / `visualViewport`).

### 5. Coach IA "Sam" + mode No-BS (S09)
- Chat personnalisé avec le contexte de la relation, des check-ins, des envies et des rechutes. D'après la FAQ, il "apprend" du journal.
- Deux tons : bienveillant, ou No-BS (cash, "tough love"). Il sert aussi d'espace pour vider son sac. La fiche pricing mentionne aussi un coaching vocal.
- Web : réponses en streaming (SSE), toggle de ton visible dans l'en-tête du chat, mémoire résumée côté serveur. Voix possible plus tard via Web Speech API ou STT/TTS serveur.
- Garde-fous **obligatoires** : détection de crise avec ressources d'aide, le coach ne doit jamais pousser à recontacter, et le mode No-BS reste dur sur le comportement, jamais humiliant pour la personne. Les clés API restent côté serveur, avec un quota par plan.

## Spécificités web app (mobile & desktop)

| sujet | mobile (< 768 px) | desktop (≥ 1024 px) |
| --- | --- | --- |
| navigation | bottom tab bar : Home · Vault · Coach · Outils · Profil | sidebar gauche + contenu centré (max ~720 px) |
| Panic | FAB rouge fixe au-dessus de la tab bar | bouton dans la sidebar + raccourci clavier (ex. `P`) |
| Coach / faux chat | plein écran, saisie collée en bas | split view : liste des conversations / chat, ou chat + panneau contexte |
| Ick List / Vault | liste + feuille modale | grille de cartes, glisser-déposer des médias |
| check-in | bottom sheet | modale centrée |

- **PWA** : manifest, icône, écran d'accueil, `shortcuts` vers `/panic` et `/checkin`. Le hors-ligne couvre au minimum la Panic Room et le compteur.
- **Notifications** : Web Push (rappel de check-in, paliers de streak). Sur iOS, elles ne fonctionnent que si la PWA est installée (iOS 16.4+). Prévoir l'email en repli.
- **Confidentialité** (c'est l'argument clé face à l'original) : bucket privé, chiffrement au repos, export et suppression de compte en libre-service, aucun tracker publicitaire, une vraie politique de confidentialité. Option "écran discret" : titre d'onglet neutre et verrou par code. Pas de données sensibles en localStorage.
- **Paiement** : Stripe Checkout + Customer Portal. Le web évite la commission des stores, ce qui permet des prix plus bas que l'original.
- **Auth** : magic link ou Google. Session persistante, l'app s'ouvre en état de crise et doit être immédiate.
- **i18n** dès le départ (l'original est en anglais seulement) : FR, EN, puis TH ou ES.
- **Accessibilité** : contraste AA, focus visible, `prefers-reduced-motion`, cibles tactiles de 44 px.

## Monétisation

Free + abonnement (hard paywall probable vu la page pricing "un plan tout inclus"). IAP observés, plusieurs prix par période = tests A/B de prix :

| période | prix vus (USD) |
| --- | --- |
| Hebdo | 6,99 |
| Mensuel | 12,99 |
| Trimestriel | 24,99 / 29,99 / 34,99 / 39,99 |
| Annuel | 49,99 / 59,99 / 79,99 |

Essai gratuit existant (mention "unused free trial forfeited"). Le site affiche 19,99 $ sans période.

## Screens

Routes web proposées pour le clone. "Confiance" porte sur l'existence et la forme de l'écran dans l'original.

| ID | écran | route web | rôle | composants clés | confiance |
| --- | --- | --- | --- | --- | --- |
| S00 | Landing marketing | `/` | pitch, pricing, CTA | hero, features, FAQ | high |
| S01 | Onboarding / questionnaire | `/onboarding` | qualifier la rupture (durée, type, ex vs situationship), nourrir le coach | question cards, progress bar | guess |
| S02 | Règles & durée du no contact | `/onboarding/rules`, `/settings/rules` | fixer règles perso + objectif de durée (ajouté v1.0.23) | sélecteur de durée, liste de règles | medium |
| S03 | Paywall | `/pricing` → Stripe Checkout | abonnement, essai | plan cards, CTA | high (IAP) |
| S04 | Home / dashboard | `/app` | compteur de jours, streak, check-in du jour, raccourci Panic | streak counter, cards, panic FAB | high |
| S05 | Check-in quotidien | `/app/checkin` (sheet / modale) | humeur, envies, déclencheurs (refondu v1.0.33) | mood picker, sliders, notes | high |
| S06 | **Panic Room** / Reality Check | `/panic` (plein écran) | casser la spirale : respiration, affirmations, distraction, bouton "rescue" | timer respiration, carrousel, gros bouton | high |
| S07 | **Text Your Ex (But Don't)** | `/app/unsent` | écrire à l'ex, intercepté, jamais envoyé | bulles chat, faux "envoyé", historique | high |
| S08 | Skins du faux chat | `/app/unsent?theme=` | thèmes visuels de messagerie (génériques dans le clone) | sélecteur de thème | medium |
| S09 | **Coach IA "Sam"** | `/app/coach` | conseil personnalisé, vent, mode No-BS | chat streaming, toggle ton, voix (plus tard) | high |
| S10 | Evidence Vault | `/app/vault` | captures, photos, vidéos, notes vocales | grille média, upload | high |
| S11 | **Ick List** | `/app/vault/icks` | red flags, dealbreakers, icks à relire | liste éditable, mode relecture | medium |
| S12 | Conversation Analyzer | `/app/analyze` | analyser captures / messages collés : patterns, sous-texte | upload, résultat structuré | high |
| S13 | **Reset & Reflect** | `/app/reset` | redémarrer le compteur en gardant l'historique + réflexion | formulaire, stats passées | high |
| S14 | Challenges | `/app/challenges` | programmes multi-sessions | liste, progression | high |
| S15 | Toolkit | `/app/tools` | outils par besoin (grounding, breathwork, tension), favoris | catégories, favoris | high |
| S16 | Learn | `/app/learn` | articles courts (trauma bond, deuil…), reco selon patterns | liste, lecteur | high |
| S17 | Journal guidé + affirmations + visualisations | `/app/journal` | journaling, sessions audio | éditeur, lecteur audio | medium |
| S18 | Growth feed | `/app/feed` | fil de contenu qui remplace les réseaux sociaux | feed vertical | medium |
| S19 | Abuse Awareness | `/app/learn/abuse` | éducation manipulation / contrôle coercitif | articles | high |
| S20 | Communauté | — (skip v1) | se connecter aux autres | forme inconnue | guess |
| S21 | Roadmap personnalisée | `/app/roadmap` | plan par étape de guérison | timeline | medium |
| S22 | Insights / progrès | `/app/progress` | courbes d'humeur et d'envies, paliers, historique des périodes | graphes, cartes | medium |
| S23 | Compte & réglages | `/settings` | email, abonnement (Stripe Portal), notifications, export, suppression, verrou | liste réglages | guess |
| S24 | Auth | `/login` | magic link / Google | form, états envoyé / erreur | — (spécifique web) |

États à vérifier sur l'app réelle : compteur à J0, première rechute, streak cassée, Vault vide, coach hors ligne, paywall refusé.

## Flows

```
F01 Démarrer un no contact
    S00 landing -> S24 login -> S01 onboarding -> S02 règles & durée -> S03 pricing/Stripe -> S04 /app (J0)
    happy path clicks : ~8-12 (estimé) — objectif web : compteur visible avant le paywall
    edge : refus du paywall, retour de Stripe annulé, magic link ouvert sur un autre appareil, rupture déjà ancienne (démarrer à J>0), situationship vs relation

F02 Check-in du jour
    notif -> S04 -> S05 check-in -> S04 (streak +1)
    happy path clicks : ~4
    edge : check-in oublié, streak hebdo cassée (plainte d'avis), fuseau horaire

F03 Résister à une envie
    S04 bouton panic (ou raccourci PWA / touche P) -> S06 /panic -> (S07 faux chat | S09 coach | S11 Ick List) -> S04
    happy path clicks : 1 pour entrer, c'est l'argument central — /panic doit charger en < 1 s, même hors ligne
    edge : session expirée (la Panic Room reste accessible sans re-login), envie la nuit, envie répétée en peu de temps, user qui envoie quand même

F04 Contrer la nostalgie
    S04 -> S10 Evidence Vault -> S11 Ick List / médias
    edge : Vault vide (le premier jour), upload vidéo lourd

F05 Analyser une conversation
    S12 -> upload capture / coller texte -> résultat
    edge : capture illisible, contenu sensible, langue non anglaise

F06 Rechute
    S04 -> S13 Reset & Reflect -> S04 (J0, historique gardé)
    edge : rechute "partielle" (a répondu mais pas écrit), perte de motivation

F07 Se faire coacher
    S09 coach -> toggle No-BS -> conversation
    edge : signes de détresse / idées noires (garde-fou de crise obligatoire), coach qui "valide" un retour vers l'ex

F08 Suivre un programme
    S14 challenge -> session du jour -> progression
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Streak counter | jours NC, streak check-in | J0, en cours, cassé, record | S04, S13, S22 |
| Panic button | FAB, plein écran | default, pressed | S04, S06 |
| Breathing timer | inspire/expire, durées | idle, running, done | S06, S15 |
| Mood picker | emoji / échelle | vide, sélectionné | S05 |
| Chat | coach, simulateur (skins), brouillon | typing, streaming, erreur, voix | S07, S08, S09 |
| Media upload | photo, vidéo, audio, capture | empty, uploading, error | S10, S12 |
| Content card | article, outil, challenge, affirmation | default, favori, lu | S14–S18 |
| Pricing plan card | mensuel, annuel (hebdo optionnel) | selected, trial | S00, S03 |
| Layout shell | bottom tab bar (mobile), sidebar (desktop) | active, badge | toutes les pages /app |
| Sheet / Modal | bottom sheet (mobile), modale centrée (desktop) | open, closing | S05, S11 |
| Toggle ton | doux / No-BS | on/off | S09 |

## Inferred data model

```
User            id, email, name, created_at, locale
                evidence : privacy labels (email, user ID) ; confidence : high

NoContactPeriod id, user_id, ex_label, relationship_type (ex | situationship), started_at,
                ended_at, target_days, rules (json), end_reason (relapse | goal | manual)
                evidence : S02, S13, v1.0.23 "custom rules and duration" ; confidence : high

CheckIn         id, user_id, date, mood, urge_level, triggers[], note
                evidence : S05, "mood logging", v1.0.33 ; confidence : high

Urge / Relapse  id, user_id, at, intensity, outcome (resisted | relapsed), tool_used, reflection
                evidence : S06, S13, FAQ "cravings and slip-ups" ; confidence : medium

VaultItem       id, user_id, kind (red_flag | dealbreaker | ick | photo | video | voice | screenshot | note),
                text, media_url, created_at
                evidence : S10, S11, privacy "Photos or Videos" ; confidence : high

UnsentMessage   id, user_id, body, created_at
                evidence : S07 ; confidence : high

CoachThread     id, user_id, persona (Kai), tone (gentle | no_bs), messages[] (role, content, at), memory (json)
                evidence : S09, FAQ "learns from journal, cravings, slip-ups" ; confidence : medium

Analysis        id, user_id, input (images | text), result (json)
                evidence : S12 ; confidence : medium

JournalEntry    id, user_id, prompt_id, body, created_at ; confidence : high
Challenge / ChallengeProgress, Content (article | tool | affirmation | audio), Favorite ; confidence : medium
Subscription    id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, trial_end, current_period_end
                (web : Stripe au lieu des IAP) ; confidence : high
PushSubscription id, user_id, endpoint, keys, created_at (Web Push) ; spécifique web
```

Relations : User 1-n NoContactPeriod, User 1-n CheckIn, NoContactPeriod 1-n Urge, User 1-n VaultItem, User 1-1 CoachThread (probable), User 1-n ChallengeProgress.

## Feature matrix

Voir `features.csv`. Must : 14, should : 14, could : 8, skip : 3. Les lignes `original=no` sont propres à la version web.

## Out of scope (ne peut pas ou ne doit pas être cloné)

- Le persona "Kai"/"Sam", le nom "No Contact" de leur fiche, leurs textes, affirmations, articles et contenus audio : à écrire toi-même.
- Leur communauté Discord et ses membres.
- Leurs témoignages et leurs fausses citations presse : ne pas reproduire le procédé.
- Leurs claims santé non sourcés ("60 % de pensées obsessionnelles en moins en 30 jours", "rewire your brain") : risque de rejet App Store et de pub mensongère.

## Faiblesses repérées (pour /replica-entrepreneur)

- **Perte de données** : un utilisateur a perdu ~300 jours de progression après une mise à jour (avis du 23 août). → sync robuste + export.
- **Streak hebdo qui culpabilise** à chaque reset (avis du 21 mai). → mécanique qui ne repart pas de zéro psychologiquement.
- **Anglais seulement** → ouverture FR / TH / ES.
- **Pas de vraie politique de confidentialité** alors que l'app stocke photos, captures et confidences, et que les données d'usage servent au tracking pub. → argument "privé par défaut".
- **Pricing opaque** (10 prix en test, 19,99 $ sans période sur le site).
- **App lourde** : 341,5 Mo.

## Size

Écrans 25 (dont landing et auth web), flows 8, entités ~13.
Parties difficiles : (1) coach IA avec mémoire, streaming et garde-fous de crise ; (2) Panic Room instantanée et hors ligne (PWA, service worker) + Web Push, limité sur iOS ; (3) Conversation Analyzer (vision + analyse de captures) ; (4) volume de contenu éditorial ; (5) stockage média privé et chiffré.
Taille : **M** pour la boucle cœur (compteur, check-in, Panic, Vault, coach, paywall) ; **L** avec tout le contenu et l'Analyzer.
