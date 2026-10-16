import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPeriods, getProfile } from "@/lib/dal";
import { RULE_OPTIONS } from "@/lib/rules";
import { todayInTimeZone } from "@/lib/streak";
import { RulesForm } from "./rules-form";

export const metadata: Metadata = { title: "Tes règles" };

export default function RulesPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 lg:py-16">
      <p className="kicker">Étape 2 sur 2</p>
      <h1 className="mt-2 font-display text-xl">Tes règles, ton rythme.</h1>
      <p className="mt-2 mb-8 text-text-muted">Tu pourras tout changer plus tard.</p>
      <Suspense fallback={<div className="card h-96" aria-busy />}>
        <Gate />
      </Suspense>
    </main>
  );
}

async function Gate() {
  const [profile, periods] = await Promise.all([getProfile(), getPeriods()]);
  if (!profile.onboardedAt) redirect("/onboarding");
  if (periods.some((p) => p.endedAt === null)) redirect("/app");

  return <RulesForm today={todayInTimeZone(profile.timezone)} rules={RULE_OPTIONS} />;
}
