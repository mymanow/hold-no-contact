# Design system — web app No Contact

Tokens : `design/tokens.json` (source de vérité) → `src/app/tokens.css` (généré : `npm run tokens`).
Contraste : `python3 contrast.py design/tokens.json` → 36 paires, 0 échec AA, toutes en AAA sauf `text-subtle` (AA, réservé aux métadonnées non essentielles).

## Direction visuelle : « eau de nuit »

Un fond très sombre bleu-vert, presque noir, plutôt qu'un noir pur ou un violet néon. Il fatigue moins les yeux la nuit et évite l'effet halo du blanc pur sur du noir pur ; le texte est un blanc cassé (`#E6EDF0`). Deux accents seulement, avec des rôles qui ne se mélangent jamais :

| rôle | couleur | sens | où |
| --- | --- | --- | --- |
| `accent` | jade `#5FD3A6` | guérison, progrès, « tu tiens » | compteur, jauge d'objectif, CTA principaux, Sam |
| `panic` | braise `#FF7A59` | urgence, mais chaude et sûre, pas une alarme rouge | **uniquement** la Panic Room et son bouton |
| `record` | sable `#F2CC86` | fierté, record personnel | record, paliers |
| `danger` | rose-rouge `#FF8E8E` | actions destructives, erreurs | supprimer, erreurs de formulaire |

Règle : `panic` n'apparaît nulle part ailleurs. Si l'utilisateur voit de l'orange braise, c'est que l'aide est là.

Typographie :
- **Atkinson Hyperlegible Next** pour toute l'interface. Elle a été dessinée pour la basse vision, et chaque caractère y reste distinct, même sous stress.
- **Fraunces** pour les titres et le chiffre du compteur : une serif chaleureuse, qui donne de l'humanité au nombre de jours.
- Corps de texte en 17 px (au lieu de 16) pour la lecture nocturne au téléphone, et jamais moins de 13 px.

## Layout shell

```
< md (mobile, cas principal)            ≥ lg (desktop)
┌────────────────────────┐              ┌──────────┬──────────────────────────┐
│ header 56 · titre      │              │ logo     │                          │
├────────────────────────┤              │ Accueil  │     contenu centré       │
│                        │              │ Ick List │     max 720 px           │
│   contenu, gouttière 16 │              │ Sam      │     gouttière 32         │
│                        │              │ Outils   │                          │
│                  ( ! ) │ ← FAB Panic  │ Profil   │                          │
├────────────────────────┤   64 px      │          │                          │
│ ⌂   ☰   ◎   ✦   ○      │ tab bar 64   │ [ PANIC ]│ ← bouton pleine largeur  │
└────────────────────────┘ + safe area  └──────────┴──────────────────────────┘
                                         sidebar 264 (72 en icônes entre md et lg)
```

- Tab bar : 5 entrées. L'onglet actif est en `accent` avec un label toujours visible : jamais d'icône seule.
- Feuilles et modales : bottom sheet sur mobile, modale centrée de 480 px max sur desktop.
- `100dvh` et `env(safe-area-inset-bottom)` pour l'iPhone en PWA.

---

## PanicButton

Deux formes, un seul comportement : ouvrir `/panic` instantanément.

```
PanicButton
  variants  fab (mobile, fixe au-dessus de la tab bar)
            sidebar (desktop, pleine largeur en bas de la sidebar)
            hero (dans /panic : grand cercle de respiration, 200 px)
  sizes     fab 64×64 · sidebar hauteur 56 · hero 200×200
  tokens    bg panic · text/icon on-panic · radius pill · shadow panic-glow · z fab (70 dans /panic)
  label     icône + « J'ai besoin d'aide » (sidebar) ; FAB : icône + aria-label identique,
            avec une infobulle au premier usage
  states    default · hover (bg panic-strong) · active (scale .96) ·
            focus-visible (anneau focus 2px, offset 3px) · hors ligne (fonctionne quand même, /panic est en cache)
  motion    au repos, halo qui « respire » lentement (opacité 16 % → 28 %, cycle de 6 s, ease-calm).
            Aucun clignotement. Avec prefers-reduced-motion : halo fixe.
  a11y      vrai <a href="/panic"> stylé en bouton : ça marche sans JS, depuis l'historique et en raccourci PWA.
            Raccourci clavier desktop « P », annoncé dans le title. Cible de 64 px ≥ 48 minimum.
  position  FAB : à droite, 16 px du bord, 16 px au-dessus de la tab bar + safe area.
            Masqué sur /panic et pendant la saisie au clavier (sinon il couvre le champ).
  used on   S04 et toutes les pages /app ; S06 (variante hero)
```

La Panic Room elle-même (S06) :
- plein écran sur fond `surface-sunken`, sans tab bar ni sidebar ;
- en haut, une seule action « Retour » ;
- au centre, le cercle hero qui grandit sur l'inspiration (4 s), tient (4 s) et se rétracte sur l'expiration (6 s), avec le texte « Inspire… » ;
- en dessous, trois sorties : « Relire mon Ick List », « Écrire sans envoyer », « Parler à Sam » ;
- tout en bas, « J'ai tenu » en `accent`.

## StreakCounter

```
StreakCounter
  anatomy   ┌─────────────────────────────────────┐
            │  Jour                                │ ← xs, text-muted, uppercase, tracking .08em
            │  47                                  │ ← counter (Fraunces, clamp 72→112 px), text, tabular-nums
            │  sans contact                        │ ← sm, text-muted
            │  ━━━━━━━━━━━━━━━━━━━━━━──────── 47/60  │ ← jauge objectif : piste border, remplissage accent
            │  ★ Record 52 j   ·   ∑ 118 j cumulés │ ← record en `record`, cumul en text-muted
            │  Prochain palier : 60 j (dans 13 j)  │
            └─────────────────────────────────────┘
  variants  hero (S04, carte surface + shadow accent-glow) · compact (sidebar desktop, header mobile : « J47 »)
  states    J0 (« Jour 1 commence maintenant », jauge vide, pas de record affiché si aucun)
            en cours · palier atteint (anneau accent + confetti sobre, une fois)
            objectif atteint (« Objectif atteint », CTA « Fixer un nouvel objectif »)
            après reset (cumul et record bien visibles : la progression n'est pas perdue)
            chargement (skeleton, jamais « 0 »)
  tokens    bg surface · radius xl · padding 24 (mobile) / 32 (desktop) · jauge hauteur 8 radius pill
  a11y      role="group", aria-label « 47 jours sans contact, objectif 60, record 52 ».
            La jauge est un <progress> natif ou role=progressbar avec aria-valuenow, pas un div muet.
            Le chiffre ne s'anime pas (pas de compteur qui défile) avec reduced motion.
  data      calculé côté serveur dans le fuseau du profil (cf. architecture.md)
  used on   S04 (hero), shell (compact), S13 (après reset), S22
```

Reset & Reflect (S13) : le bouton d'entrée est un lien discret « J'ai eu un contact », en `text-muted`, jamais rouge. L'écran garde le ton de `accent-soft`, sans `danger` : une rechute n'est pas une erreur.

## IckCard (Ick List)

```
IckCard
  anatomy   ┌▌────────────────────────────────────┐
            │▌ RED FLAG                      📌  ⋯ │ ← tag catégorie (xs/600, couleur cat-*, sur fond cat-*-soft)
            │▌ Il annulait toujours à la         │ ← base, text, max 4 lignes puis « Lire plus »
            │▌ dernière minute.                   │
            │▌ ajouté il y a 3 j                  │ ← xs, text-subtle
            └▌────────────────────────────────────┘
             ▲ liseré gauche 4 px dans la couleur de la catégorie (le sens n'est jamais porté par la couleur seule : le tag texte est toujours là)
  categories red_flag (braise douce cat-red-flag) · dealbreaker (rose cat-dealbreaker)
             ick (ambre cat-ick) · reason (lavande cat-reason, « raison de ne pas revenir »)
  variants  list (S11, empilées, gap 12) · grid (desktop ≥ lg, 2 colonnes)
            reread (mode relecture plein écran : une carte à la fois, texte en lg, swipe/flèches)
            panic (S06 : les épinglées, compactes, non éditables)
  states    default · hover/focus (bg surface-raised) · épinglée (icône pleine, triée en tête)
            édition (inline, textarea autosize, Entrée = enregistrer, Échap = annuler)
            suppression (confirmation en bottom sheet ; toast « Supprimé · Annuler » 6 s)
            glisser (réordonner : poignée visible au focus, et flèches haut/bas au clavier)
  empty     « Ta liste est vide. Note une chose qui t'a fait mal, même petite. Tu la reliras quand il ou elle te manquera. »
            + champ d'ajout rapide déjà focus
  tokens    bg surface · radius lg · padding 16 · border 1px border · liseré cat-*
  a11y      <article> avec un titre caché pour le lecteur d'écran (« Red flag : … »). Le menu ⋯ est un vrai
            menu (Radix DropdownMenu). Toutes les actions sont faisables au clavier.
  privacy   texte déchiffré côté serveur ; floutable via le « mode discret » (filter blur jusqu'au tap)
  used on   S11, S06, S09 (contexte de Sam)
```

Ajout rapide (en tête de S11) :
- un input de 48 px de haut avec le placeholder « Ajoute un red flag… » ;
- un sélecteur de catégorie en chips, à défilement horizontal sur mobile ;
- la touche Entrée ajoute la ligne, et le focus reste dans le champ pour enchaîner.

---

## Primitives (base : Radix / shadcn/ui, restylés avec les tokens)

Déjà construits dans `src/components/` et visibles sur la route `/design` :
- `PanicButton` : variantes fab, sidebar et inline ;
- `StreakCounter` : états J0, en cours et objectif atteint ;
- `IckCard` : 4 catégories, variante compacte et état vide ;
- les boutons.

Radix arrivera avec les menus et les feuilles de l'Ick List (M4). Rapport de contraste : `docs/replica/contrast-report.txt`.

| composant | variants | états obligatoires | notes |
| --- | --- | --- | --- |
| Button | primary (accent), secondary (surface-raised + border), ghost, danger | default, hover, active, focus-visible, disabled, loading | sm 36 · md 44 · lg 52 ; garde son label pendant le chargement |
| Input / Textarea | — | default, focus (bordure focus), error (bordure danger + message), disabled | bordure `border-input` (3,5:1) ; label toujours visible |
| Chip | catégorie, filtre | selected, focus | 36 px de haut, scroll horizontal sur mobile |
| Sheet / Modal | bottom sheet ↔ modale centrée | open, closing | piège de focus, Échap ferme, retour du focus |
| Toast | info, succès, annuler | — | `aria-live="polite"`, 6 s, au-dessus de la tab bar |
| TabBar / Sidebar | — | actif, focus, badge | `aria-current="page"` |
| ChatBubble | user, Sam, Sam No-BS, message intercepté | streaming, erreur, envoyé (faux) | No-BS : liseré `accent-strong` + étiquette « No-BS » (le mode ne doit jamais être implicite) |

## À valider à l'étape build

- Construire ces primitives une seule fois sur une route `/design`, avant le premier écran.
- Tester les écrans de nuit, luminosité au minimum, en iPhone SE (375 px) et en desktop 1440.
- Relancer `contrast.py` après tout changement de palette, notamment après replica-brand.
