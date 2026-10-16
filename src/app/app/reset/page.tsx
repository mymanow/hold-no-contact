import type { Metadata } from "next";
import { Suspense } from "react";
import { requireActiveUser } from "@/lib/dal";
import { computeStreak, pluralDays } from "@/lib/streak";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset & Reflect" };

/** Le ton reste celui du soin : une rechute n'est pas une erreur (pas de rouge, pas de « danger »). */
export default function ResetPage() {
  return (
    <div className="page">
      <p className="kicker">Reset &amp; Reflect</p>
      <h1 className="mt-2 font-display text-xl">Ça arrive. Ce n&apos;est pas un retour à zéro.</h1>
      <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-lg bg-surface" />}>
        <Kept />
      </Suspense>
      <div className="mt-8">
        <ResetForm />
      </div>
    </div>
  );
}

async function Kept() {
  const { profile, periods } = await requireActiveUser();
  const s = computeStreak(periods, new Date(), profile.timezone);
  return (
    <p className="mt-6 rounded-lg bg-accent-soft p-4 text-accent-strong">
      Tu gardes tout : {pluralDays(s.totalCleanDays)} sans contact au total
      {s.recordDays > 0 ? `, ton record de ${pluralDays(s.recordDays)}` : ""}. Le compteur repart, ton chemin reste.
    </p>
  );
}
