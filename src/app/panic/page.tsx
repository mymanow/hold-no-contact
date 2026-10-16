import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Respire" };

/**
 * Panic Room (S06), version statique du jalon M3.
 * Publique et sans lecture de session : elle s'ouvre instantanément, même déconnecté ou avec une session expirée.
 * À venir : red flags épinglés, faux chat, Sam, journal des envies.
 */
export default function PanicPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-surface-sunken px-4 pt-4 pb-10">
      <Link href="/app" className="btn btn-ghost self-start">
        <ArrowLeftIcon width={18} height={18} />
        Retour
      </Link>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 text-center">
        <p className="kicker">Panic Room</p>
        <div
          className="breath my-9 grid place-items-center rounded-pill font-display text-[22px] font-semibold text-on-panic"
          style={{
            width: "var(--panic-hero-size)",
            height: "var(--panic-hero-size)",
            background: "radial-gradient(circle at 50% 45%, var(--color-panic-strong), var(--color-panic) 62%)",
            boxShadow: "0 0 0 18px rgb(255 122 89 / 0.10), 0 0 0 40px rgb(255 122 89 / 0.05)",
          }}
          aria-hidden
        >
          Respire
        </div>
        <h1 className="font-display text-2xl">Ça va passer.</h1>
        <p className="text-text-muted">
          Inspire 4 secondes, retiens 4 secondes, expire 6 secondes. Suis le cercle. Une envie dure rarement plus de
          quelques minutes.
        </p>
        <p className="text-sm text-text-muted">
          Si tu te sens en danger ou si tu penses à te faire du mal, appelle les urgences (112) ou le 3114 en France.
        </p>
        <Link href="/app" className="btn btn-primary btn-lg mt-2">
          J&apos;ai tenu
        </Link>
      </div>
    </main>
  );
}
