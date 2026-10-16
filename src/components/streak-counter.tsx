import type { ReactNode } from "react";
import { pluralDays, type StreakStats } from "@/lib/streak";

/**
 * StreakCounter (S04) — spec : docs/replica/components.md.
 * Le cumul et le record restent visibles après un reset : la progression n'est jamais « perdue ».
 */
export function StreakCounter({ stats, resetSlot }: { stats: StreakStats; resetSlot?: ReactNode }) {
  const { currentDays, targetDays, recordDays, totalCleanDays, nextMilestone, daysToNextMilestone, goalReached } =
    stats;
  const label = [
    `${pluralDays(currentDays)} sans contact`,
    targetDays ? `objectif ${targetDays}` : null,
    recordDays ? `record ${recordDays}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      role="group"
      aria-label={label}
      className="rounded-xl bg-surface p-6 lg:p-8"
      style={{ boxShadow: "var(--shadow-accent-glow)" }}
    >
      <p className="kicker">Jour</p>
      <p className="counter mt-1.5 mb-1">{currentDays}</p>
      <p className="text-sm text-text-muted">
        {currentDays === 0 ? "Le jour 1 commence maintenant." : "sans contact"}
      </p>

      {targetDays ? (
        <div className="mt-5 mb-2 flex items-center gap-3">
          <progress
            value={Math.min(currentDays, targetDays)}
            max={targetDays}
            aria-label={`Progression vers l'objectif de ${targetDays} jours`}
            className="h-2 flex-1 appearance-none overflow-hidden rounded-pill bg-border [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-border [&::-webkit-progress-value]:rounded-pill [&::-webkit-progress-value]:bg-accent"
          />
          <span className="text-xs font-semibold text-text-muted tabular">
            {Math.min(currentDays, targetDays)}/{targetDays}
          </span>
        </div>
      ) : null}

      <p className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-text-muted">
        {recordDays > 0 ? (
          <span className="font-semibold text-record">
            <span aria-hidden>★ </span>Record {recordDays} j
          </span>
        ) : null}
        {totalCleanDays > currentDays ? (
          <span>
            <span aria-hidden>∑ </span>
            {totalCleanDays} j cumulés
          </span>
        ) : null}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-border pt-4 text-sm text-text-muted">
        <span className="whitespace-nowrap">
          {goalReached
            ? "Objectif atteint. Bravo."
            : nextMilestone
              ? `Prochain palier : ${nextMilestone} j (dans ${pluralDays(daysToNextMilestone ?? 0)})`
              : "Tu as dépassé tous les paliers."}
        </span>
        {resetSlot ?? (
          <a href="/app/reset" className="whitespace-nowrap underline underline-offset-4 hover:text-text">
            J&apos;ai eu un contact
          </a>
        )}
      </div>
    </section>
  );
}

export function StreakCounterSkeleton() {
  return <div className="h-80 animate-pulse rounded-xl bg-surface" aria-busy aria-label="Chargement du compteur" />;
}
