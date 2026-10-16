import type { Metadata } from "next";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { getProfile, getUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Profil" };

export default function SettingsPage() {
  return (
    <div className="page">
      <h1 className="mb-6 font-display text-xl">Profil</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-surface" />}>
        <Account />
      </Suspense>
      <p className="mt-6 text-sm text-text-muted">
        Export de tes données, suppression du compte et verrou par code arrivent au jalon M9.
      </p>
    </div>
  );
}

async function Account() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  return (
    <div className="card divide-y divide-border">
      <dl className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-text-muted">Email</dt>
          <dd className="mt-1 break-all">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Fuseau horaire</dt>
          <dd className="mt-1">{profile.timezone}</dd>
        </div>
      </dl>
      <form action={signOut} className="p-5">
        <button type="submit" className="btn btn-secondary">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
