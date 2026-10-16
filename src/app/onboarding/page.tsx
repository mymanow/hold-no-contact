import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getProfile } from "@/lib/dal";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Bienvenue" };

export default function OnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 lg:py-16">
      <p className="kicker">Étape 1 sur 2</p>
      <h1 className="mt-2 font-display text-xl">On commence doucement.</h1>
      <p className="mt-2 mb-8 text-text-muted">Trois questions pour adapter l&apos;app à ta situation.</p>
      <Suspense fallback={<div className="card h-96" aria-busy />}>
        <Gate />
      </Suspense>
    </main>
  );
}

async function Gate() {
  const profile = await getProfile();
  if (profile.onboardedAt) redirect("/onboarding/rules");
  return <ProfileForm />;
}
