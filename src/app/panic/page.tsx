import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { PanicRoom } from "./panic-room";

export const metadata: Metadata = { title: "Respire" };

/**
 * Panic Room (S06). Publique et sans lecture de session : la page est prérendue en statique
 * et s'ouvre instantanément, même déconnecté·e ou avec une session expirée.
 */
export default function PanicPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-surface-sunken px-4 pt-3 pb-12 lg:px-8">
      <Link href="/app" className="btn btn-ghost self-start">
        <ArrowLeftIcon width={18} height={18} />
        Retour
      </Link>
      <div className="flex flex-1 flex-col pt-2 lg:pt-6">
        <PanicRoom />
      </div>
    </main>
  );
}
