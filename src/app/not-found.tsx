import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <p className="kicker">Page introuvable</p>
      <h1 className="mt-2 font-display text-xl">Ce chemin ne mène nulle part.</h1>
      <p className="mt-3 text-text-muted">Le lien est peut-être ancien. Tout le reste est là où tu l&apos;as laissé.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/app" className="btn btn-primary btn-lg">
          Retour à l&apos;accueil
        </Link>
        <Link href="/panic" className="btn btn-secondary btn-lg">
          J&apos;ai besoin d&apos;aide
        </Link>
      </div>
    </main>
  );
}
