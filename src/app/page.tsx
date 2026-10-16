import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 lg:px-8">
      <p className="kicker">No contact, un jour après l&apos;autre</p>
      <h1 className="mt-3 font-display text-2xl lg:text-[44px] lg:leading-[52px]">
        Arrête de lui écrire.
        <br />
        Commence à guérir.
      </h1>
      <p className="mt-5 max-w-[56ch] text-text-muted">
        Un compteur qui garde ta progression même après un faux pas, une Panic Room pour les moments où l&apos;envie
        devient trop forte, et tes raisons de ne pas revenir, toujours à portée de main. Privé par défaut : tes notes
        sont chiffrées.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="btn btn-primary btn-lg">
          Commencer
        </Link>
        <Link href="/panic" className="btn btn-secondary btn-lg">
          J&apos;ai besoin d&apos;aide maintenant
        </Link>
      </div>
    </main>
  );
}
