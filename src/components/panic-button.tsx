import Link from "next/link";
import { AlertIcon } from "@/components/icons";

/**
 * PanicButton — spec : docs/replica/components.md.
 * Un vrai lien vers /panic : fonctionne sans JavaScript, depuis l'historique et en raccourci PWA.
 * La couleur `panic` n'est utilisée nulle part ailleurs dans l'app.
 */
type Variant = "fab" | "sidebar" | "inline";

const LABEL = "J'ai besoin d'aide";

export function PanicButton({ variant, className = "" }: { variant: Variant; className?: string }) {
  if (variant === "fab") {
    return (
      <Link
        href="/panic"
        aria-label={`${LABEL} : ouvrir la Panic Room`}
        className={`halo fixed right-4 z-[30] grid place-items-center rounded-pill bg-panic text-on-panic hover:bg-panic-strong active:scale-95 ${className}`}
        style={{
          width: "var(--panic-fab-size)",
          height: "var(--panic-fab-size)",
          bottom: "calc(var(--tabbar-height) + 16px + var(--safe-bottom))",
        }}
      >
        <AlertIcon width={28} height={28} />
      </Link>
    );
  }

  return (
    <Link
      href="/panic"
      title={variant === "sidebar" ? "Raccourci clavier : P" : undefined}
      className={`halo flex items-center justify-center gap-2.5 rounded-pill bg-panic font-bold whitespace-nowrap text-on-panic hover:bg-panic-strong active:scale-[0.98] ${variant === "sidebar" ? "px-3" : "px-6"} ${className}`}
      style={{ minHeight: 56 }}
    >
      <AlertIcon width={20} height={20} />
      {LABEL}
      {variant === "sidebar" ? (
        <kbd className="rounded-sm border border-on-panic/35 px-1.5 text-xs font-semibold">P</kbd>
      ) : null}
    </Link>
  );
}
