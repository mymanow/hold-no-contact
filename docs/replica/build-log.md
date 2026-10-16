# Build log

Une ligne par écran : ID, date, état, ce qui manque, ce qui a été plus dur que prévu.

| ID | écran | date | état | manque | plus dur que prévu |
| --- | --- | --- | --- | --- | --- |
| S24 | Login (magic link, Google) | 2026-10-16 | fait | Google à configurer côté Supabase | Next 16 : `middleware` renommé `proxy`, lecture des cookies obligatoirement sous `<Suspense>` |
| S01 | Onboarding : profil | 2026-10-16 | partiel | questionnaire plus riche (durée de la relation, ancienneté de la rupture) | fuseau lu au moment de l'envoi pour éviter un écart d'hydratation |
| S02 | Onboarding : règles | 2026-10-16 | fait | édition des règles après coup | — |
| S04 | Accueil : compteur | 2026-10-16 | fait | check-in du jour (M8) | dates interdites au prérendu (Cache Components) : calcul sous Suspense |
| S13 | Reset & Reflect | 2026-10-16 | fait | — | modale en 2 temps (confirmation puis réflexion) sur `<dialog>` natif ; repli `/app/reset` sans JS |
| S22 | Progrès | 2026-10-16 | partiel | courbes humeur et envies (M8) | — |
| S06 | Panic Room | 2026-10-16 | fait | Ick List épinglée dans la page (M4), Sam (M6), hors ligne (M9) | minuteur de respiration réécrit en machine à états pure : la 1re version appelait ses callbacks deux fois en mode strict |
| S07 | Text Your Ex (But Don't) | 2026-10-16 | fait | thèmes visuels (could) | le bouton Panic flottant recouvrait « Envoyer » : masqué sur les écrans de saisie, accès Panic déplacé dans l'en-tête |

Captures pour replica-diff : `docs/replica/clone-screens/` (390 px et 1440 px).

Parité (`parity.py`) au 2026-10-16 : 34,1 / 100, must-haves 7 sur 13. Manquent : Ick List, coach Sam + mode No-BS, check-in quotidien, abonnement, onboarding complet.
