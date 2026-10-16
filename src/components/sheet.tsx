"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sheet — feuille modale accessible, basée sur <dialog> natif :
 * piège de focus, Échap pour fermer, retour du focus au déclencheur et fond inerte fournis par le navigateur.
 * Mobile : bottom sheet collée en bas. Desktop (≥ md) : modale centrée, 480 px max.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clic sur le fond (hors du contenu) : ferme
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="sheet-title"
      aria-describedby={description ? "sheet-description" : undefined}
      className="sheet m-0 mt-auto w-full max-w-none overscroll-contain rounded-t-xl border border-border bg-surface p-0 text-text shadow-pop backdrop:bg-bg/75 md:m-auto md:max-w-[480px] md:rounded-xl"
      style={{ maxHeight: "92dvh" }}
    >
      <div className="px-5 pt-3 pb-[calc(24px+var(--safe-bottom))] md:px-7 md:pt-7 md:pb-7">
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-pill bg-border-input md:hidden" />
        <h2 id="sheet-title" className="font-display text-lg font-semibold">
          {title}
        </h2>
        {description ? (
          <p id="sheet-description" className="mt-1.5 text-sm text-text-muted">
            {description}
          </p>
        ) : null}
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
