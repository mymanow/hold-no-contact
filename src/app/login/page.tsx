import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <Link href="/" className="font-display text-xl font-semibold">
        Hold
      </Link>
      <h1 className="mt-8 font-display text-xl">Content de te voir ici.</h1>
      <p className="mt-2 mb-8 text-text-muted">
        Pas de mot de passe à retenir : on t&apos;envoie un lien. Tout ce que tu notes reste privé et chiffré.
      </p>
      <Suspense fallback={<div className="card h-56" aria-busy />}>
        <LoginForm />
      </Suspense>
      <p className="mt-10 text-sm text-text-muted">
        Besoin d&apos;aide tout de suite ?{" "}
        <Link href="/panic" className="font-semibold text-panic-strong underline underline-offset-4">
          Ouvrir la Panic Room
        </Link>
      </p>
    </main>
  );
}
