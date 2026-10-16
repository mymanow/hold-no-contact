import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { StreakCounter } from "@/components/streak-counter";
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
          <h1 className="mt-2 font-display text-xl">StreakCounter : états</h1>
        </header>
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
      <StreakCounter stats={computeStreak(s.periods, NOW, "UTC")} />
    </section>
  ));
}
