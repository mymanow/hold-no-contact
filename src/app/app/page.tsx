import type { Metadata } from "next";
import { Suspense } from "react";
import { StreakCounter, StreakCounterSkeleton } from "@/components/streak-counter";
import { requireActiveUser } from "@/lib/dal";
import { computeStreak } from "@/lib/streak";

export const metadata: Metadata = { title: "Accueil" };

export default function DashboardPage() {
  return (
    <div className="page">
      <Suspense
        fallback={
          <>
            <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-surface" />
            <StreakCounterSkeleton />
          </>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const { profile, periods } = await requireActiveUser();
  const stats = computeStreak(periods, new Date(), profile.timezone);
  const active = periods.find((p) => p.endedAt === null);

  return (
    <>
      <h1 className="mb-6 font-display text-xl">
        {profile.displayName ? `Salut ${profile.displayName}.` : "Salut."}
      </h1>

      {stats.isNewRecord ? (
        <p role="status" className="mb-4 rounded-md bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">
          Nouveau record personnel. Tu n&apos;as jamais tenu aussi longtemps.
        </p>
      ) : null}

      <StreakCounter stats={stats} />

      {active?.rules?.length ? <RulesCard rules={active.rules} /> : null}
    </>
  );
}

function RulesCard({ rules }: { rules: string[] }) {
  return (
    <section className="card mt-6 p-5" aria-labelledby="rules-title">
      <h2 id="rules-title" className="text-lg font-semibold">
        Mes règles
      </h2>
      <ul className="mt-3 space-y-2 text-text-muted">
        {rules.map((r) => (
          <li key={r} className="flex gap-2.5">
            <span aria-hidden className="text-accent">
              ✓
            </span>
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}
