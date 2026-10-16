import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { IckCard, IckListEmpty } from "@/components/ick-card";
import { PanicButton } from "@/components/panic-button";
import { StreakCounter } from "@/components/streak-counter";
import { ResetDialog } from "@/app/app/reset/reset-dialog";
import { computeStreak, type Period } from "@/lib/streak";

export const metadata: Metadata = { title: "Design system" };

/**
 * Banc d'essai du design system (données fictives, aucune lecture de session).
 * Sert à vérifier les composants et leurs états sur mobile et desktop avant de les brancher.
 */
const NOW = new Date("2026-10-16T12:00:00Z");
const p = (startedAt: string, endedAt: string | null, targetDays = 60): Period => ({
  id: startedAt,
  startedAt,
  endedAt,
  endReason: endedAt ? "relapse" : null,
  targetDays,
});

const STATES: { title: string; periods: Period[] }[] = [
  { title: "Jour 0", periods: [p("2026-10-16T08:00:00Z", null)] },
  {
    title: "En cours, après deux rechutes",
    periods: [
      p("2026-08-01T08:00:00Z", "2026-09-22T08:00:00Z"),
      p("2026-09-22T09:00:00Z", "2026-09-30T08:00:00Z"),
      p("2026-09-30T09:00:00Z", null),
    ],
  },
  { title: "Objectif atteint", periods: [p("2026-08-10T08:00:00Z", null, 60)] },
];

export default function DesignPage() {
  return (
    <AppShell>
      <div className="page space-y-10">
        <header>
          <p className="kicker">Design system</p>
          <h1 className="mt-2 font-display text-xl">Banc d&apos;essai des composants</h1>
          <p className="mt-2 text-sm text-text-muted">
            Données fictives. Le bouton Panic flottant (mobile) et celui de la sidebar (desktop) sont visibles dans le
            shell autour de cette page.
          </p>
        </header>

        <section aria-label="PanicButton">
          <h2 className="mb-3 text-sm font-semibold text-text-muted">PanicButton · variante inline (landing, Ick List)</h2>
          <PanicButton variant="inline" className="w-full sm:w-auto" />
        </section>

        <section aria-label="IckCard">
          <h2 className="mb-3 text-sm font-semibold text-text-muted">IckCard · 4 catégories</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <IckCard
              category="red_flag"
              pinned
              body="Il annulait toujours à la dernière minute, et c'était ma faute."
              meta="épinglé"
              actions={<span className="text-xs">📌</span>}
            />
            <IckCard category="dealbreaker" body="Ne voulait pas d'enfants, puis « on verra », puis plus jamais." meta="ajouté il y a 2 sem." />
            <IckCard category="ick" body="Répondait « ok. » à tout ce qui comptait pour moi." meta="ajouté il y a 6 j" />
            <IckCard category="reason" body="Je dors enfin la nuit sans vérifier son statut." meta="ajouté hier" />
          </div>
          <h2 className="mt-6 mb-3 text-sm font-semibold text-text-muted">IckCard · compacte (Panic Room)</h2>
          <IckCard variant="compact" category="red_flag" body="Il annulait toujours à la dernière minute, et c'était ma faute." />
          <h2 className="mt-6 mb-3 text-sm font-semibold text-text-muted">Ick List · état vide</h2>
          <IckListEmpty />
        </section>

        <h2 className="font-display text-lg">StreakCounter : états</h2>
        <Suspense fallback={null}>
          <CounterStates />
        </Suspense>
        <section aria-label="Boutons">
          <h2 className="mb-3 text-sm font-semibold text-text-muted">Boutons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary">Primaire</button>
            <button className="btn btn-secondary">Secondaire</button>
            <button className="btn btn-ghost">Discret</button>
            <button className="btn btn-primary" disabled>
              Désactivé
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

/** Le calcul de dates s'exécute à la requête (Cache Components refuse les dates au prerender). */
async function CounterStates() {
  await connection();
  return STATES.map((s) => (
    <section key={s.title} aria-label={s.title}>
      <h2 className="mb-3 text-sm font-semibold text-text-muted">{s.title}</h2>
      <StreakCounter
        stats={computeStreak(s.periods, NOW, "UTC")}
        resetSlot={<ResetDialog kept={{ currentDays: 16, recordDays: 52, totalCleanDays: 76 }} />}
      />
    </section>
  ));
}
