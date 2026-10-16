import type { Metadata } from "next";
import { Suspense } from "react";
import { requireActiveUser } from "@/lib/dal";
import { computeStreak, periodLength, pluralDays } from "@/lib/streak";

export const metadata: Metadata = { title: "Progrès" };

export default function ProgressPage() {
  return (
    <div className="page">
      <h1 className="mb-6 font-display text-xl">Ton chemin</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-surface" />}>
        <History />
      </Suspense>
    </div>
  );
}

async function History() {
  const { profile, periods } = await requireActiveUser();
  const now = new Date();
  const s = computeStreak(periods, now, profile.timezone);
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: profile.timezone });
  const longest = Math.max(...periods.map((p) => periodLength(p, now, profile.timezone)), 1);

  return (
    <>
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "En cours", value: s.currentDays, cls: "text-text" },
          { label: "Record", value: s.recordDays, cls: "text-record" },
          { label: "Cumulés", value: s.totalCleanDays, cls: "text-accent" },
        ].map((x) => (
          <div key={x.label} className="card p-4">
            <dt className="text-xs text-text-muted">{x.label}</dt>
            <dd className={`mt-1 font-display text-xl font-semibold tabular ${x.cls}`}>{x.value} j</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Périodes</h2>
      <ol className="space-y-2">
        {periods.map((p) => {
          const len = periodLength(p, now, profile.timezone);
          const active = p.endedAt === null;
          return (
            <li key={p.id} className="card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{active ? "En cours" : pluralDays(len)}</span>
                <span className="text-xs text-text-subtle">
                  {fmt.format(new Date(p.startedAt))} → {p.endedAt ? fmt.format(new Date(p.endedAt)) : "aujourd'hui"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-pill bg-border" aria-hidden>
                <div
                  className={`h-full rounded-pill ${active ? "bg-accent" : "bg-text-subtle"}`}
                  style={{ width: `${Math.max(4, (len / longest) * 100)}%` }}
                />
              </div>
              {active ? <p className="mt-2 text-sm text-text-muted">{pluralDays(len)} pour l&apos;instant</p> : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
