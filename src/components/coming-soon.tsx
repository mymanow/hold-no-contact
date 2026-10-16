import Link from "next/link";

/** Écran provisoire pour les modules prévus aux jalons suivants (voir docs/replica/architecture.md). */
export function ComingSoon({ title, milestone, children }: { title: string; milestone: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <p className="kicker">{milestone}</p>
      <h1 className="mt-2 font-display text-xl">{title}</h1>
      <p className="mt-3 max-w-[56ch] text-text-muted">{children}</p>
      <Link href="/panic" className="btn btn-secondary mt-8">
        En attendant : la Panic Room
      </Link>
    </div>
  );
}
