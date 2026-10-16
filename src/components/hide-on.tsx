"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Masque son contenu sur certaines routes (ex. le bouton Panic flottant au-dessus d'un champ de saisie). */
export function HideOn({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  return paths.some((p) => pathname.startsWith(p)) ? null : children;
}
