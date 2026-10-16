import type { ReactNode } from "react";

/**
 * IckCard — spec : docs/replica/components.md.
 * Le sens ne repose jamais sur la couleur seule : l'étiquette texte de la catégorie est toujours affichée.
 * Le texte arrive déjà déchiffré (côté serveur) ; le composant ne connaît rien du chiffrement.
 */
export type IckCategory = "red_flag" | "dealbreaker" | "ick" | "reason";

export const ICK_CATEGORIES: Record<IckCategory, { label: string; text: string; soft: string; bar: string }> = {
  red_flag: { label: "Red flag", text: "text-cat-red-flag", soft: "bg-cat-red-flag-soft", bar: "bg-cat-red-flag" },
  dealbreaker: {
    label: "Dealbreaker",
    text: "text-cat-dealbreaker",
    soft: "bg-cat-dealbreaker-soft",
    bar: "bg-cat-dealbreaker",
  },
  ick: { label: "Ick", text: "text-cat-ick", soft: "bg-cat-ick-soft", bar: "bg-cat-ick" },
  reason: { label: "Raison", text: "text-cat-reason", soft: "bg-cat-reason-soft", bar: "bg-cat-reason" },
};

type Props = {
  category: IckCategory;
  body: string;
  meta?: string;
  pinned?: boolean;
  /** Actions (épingler, menu) : fournies par l'écran, absentes dans la Panic Room. */
  actions?: ReactNode;
  variant?: "list" | "compact";
};

export function IckCard({ category, body, meta, pinned = false, actions, variant = "list" }: Props) {
  const c = ICK_CATEGORIES[category];
  const compact = variant === "compact";

  return (
    <article className={`relative overflow-hidden rounded-lg border border-border bg-surface ${compact ? "p-3.5 pl-4.5" : "p-4 pl-5"}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${c.bar}`} />
      <h3 className="sr-only">
        {c.label}
        {pinned ? ", épinglé" : ""}
      </h3>
      <div className="mb-2 flex min-h-9 items-center justify-between gap-2">
        <span
          aria-hidden
          className={`inline-flex items-center rounded-pill px-2.5 py-1.5 text-xs leading-none font-bold tracking-[0.06em] uppercase ${c.text} ${c.soft}`}
        >
          {c.label}
        </span>
        {actions ? <div className="flex items-center gap-1 text-text-muted">{actions}</div> : null}
      </div>
      <p className={compact ? "line-clamp-2" : "line-clamp-4"}>{body}</p>
      {meta ? <p className="mt-2 text-xs text-text-subtle">{meta}</p> : null}
    </article>
  );
}

/** État vide de l'Ick List : invite à écrire une première ligne, sans culpabiliser. */
export function IckListEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border-input p-6 text-center">
      <p className="font-semibold">Ta liste est vide.</p>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-sm text-text-muted">
        Note une chose qui t&apos;a fait mal, même petite. Tu la reliras quand cette personne te manquera.
      </p>
      {children}
    </div>
  );
}
