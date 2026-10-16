import Link from "next/link";
import type { ReactNode } from "react";
import { AlertIcon } from "@/components/icons";
import { NavLinks } from "@/components/nav-links";
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
        <Link
          href="/panic"
          className="halo mt-auto flex items-center justify-center gap-2.5 rounded-pill bg-panic font-bold text-on-panic hover:bg-panic-strong"
          style={{ minHeight: 56 }}
          title="Raccourci clavier : P"
        >
          <AlertIcon width={20} height={20} />
          J&apos;ai besoin d&apos;aide
          <kbd className="rounded-sm border border-on-panic/35 px-1.5 text-xs font-semibold">P</kbd>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>

      <Link
        href="/panic"
        aria-label="J'ai besoin d'aide : ouvrir la Panic Room"
        className="halo fixed right-4 z-[30] grid place-items-center rounded-pill bg-panic text-on-panic lg:hidden"
        style={{
          width: "var(--panic-fab-size)",
          height: "var(--panic-fab-size)",
          bottom: "calc(var(--tabbar-height) + 16px + var(--safe-bottom))",
        }}
      >
        <AlertIcon width={28} height={28} />
      </Link>

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
