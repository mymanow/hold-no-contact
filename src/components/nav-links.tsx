"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/nav";

export function NavLinks({ variant }: { variant: "sidebar" | "tabbar" }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  if (variant === "tabbar") {
    return (
      <ul className="grid grid-cols-5" style={{ height: "var(--tabbar-height)" }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? "text-accent" : "text-text-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                active ? "bg-accent-soft text-accent-strong" : "text-text-muted hover:bg-surface-raised hover:text-text"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {"soon" in item && item.soon ? <span className="text-xs text-text-subtle">bientôt</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
