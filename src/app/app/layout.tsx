import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { getPeriods, getProfile } from "@/lib/dal";
import { computeStreak } from "@/lib/streak";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <AppShell
      sidebarExtra={
        <Suspense fallback={null}>
          <MiniStreak />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}

/** Rappel du compteur dans la sidebar desktop. Lit la session, donc sous <Suspense>. */
async function MiniStreak() {
  const [profile, periods] = await Promise.all([getProfile(), getPeriods()]);
  if (!periods.length) return null;
  const s = computeStreak(periods, new Date(), profile.timezone);
  return (
    <div className="mx-1.5 mt-4 rounded-lg bg-surface-raised p-3.5">
      <p className="font-display text-2xl leading-none font-semibold tabular">J{s.currentDays}</p>
      {s.recordDays > 0 ? <p className="mt-1 text-xs text-text-muted">record {s.recordDays} j</p> : null}
    </div>
  );
}
