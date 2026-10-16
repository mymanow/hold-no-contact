import Link from "next/link";
import type { ReactNode } from "react";
import { HideOn } from "@/components/hide-on";
import { NavLinks } from "@/components/nav-links";
import { PanicButton } from "@/components/panic-button";
import { PanicShortcut } from "@/components/panic-shortcut";

/**
 * Shell responsive :
 * - < lg : contenu + bottom tab bar + bouton Panic flottant (FAB)
 * - ≥ lg : sidebar à gauche avec le bouton Panic pleine largeur en bas
 * Aucune lecture de session ici : le shell part dans le rendu statique, le contenu stream.
 */
export function AppShell({ children, sidebarExtra }: { children: ReactNode; sidebarExtra?: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside
        className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface px-3.5 py-5 lg:flex"
        style={{ width: "var(--sidebar-width)" }}
      >
        <Link href="/app" className="px-2.5 pb-5 font-display text-xl font-semibold">
          Hold
        </Link>
        <nav aria-label="Navigation principale">
          <NavLinks variant="sidebar" />
        </nav>
        {sidebarExtra}
        <PanicButton variant="sidebar" className="mt-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>

      {/* Sur les écrans avec un champ de saisie en bas, le FAB couvrirait le bouton Envoyer :
          ces écrans ont leur propre accès à la Panic Room dans l'en-tête. */}
      <HideOn paths={["/app/unsent", "/app/coach", "/design/unsent"]}>
        <PanicButton variant="fab" className="lg:hidden" />
      </HideOn>

      <nav
        aria-label="Navigation"
        className="fixed inset-x-0 bottom-0 z-[20] border-t border-border bg-surface lg:hidden"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <NavLinks variant="tabbar" />
      </nav>

      <PanicShortcut />
    </div>
  );
}
