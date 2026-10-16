"use client";

import { useEffect, useState } from "react";

/**
 * « Attends 10 minutes » : on ne décide rien pendant le pic de l'envie.
 * Basé sur l'heure de fin (pas sur un compteur décrémenté) pour rester juste si l'onglet passe en arrière-plan.
 */
const DURATION_MS = 10 * 60 * 1000;

export function DelayTimer({ onUse }: { onUse?: () => void }) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (endsAt === null) {
    return (
      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={() => {
          const t = Date.now();
          setNow(t);
          setEndsAt(t + DURATION_MS);
          onUse?.();
        }}
      >
        Lancer 10 minutes
      </button>
    );
  }

  const left = Math.max(0, endsAt - now);
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div className="flex items-center justify-between gap-4" aria-live="polite">
      {left > 0 ? (
        <>
          <p className="font-display text-3xl font-semibold tabular" role="timer" aria-label={`${mm} minutes ${ss} secondes restantes`}>
            {mm}:{String(ss).padStart(2, "0")}
          </p>
          <p className="text-sm text-text-muted">Bouge, bois un verre d&apos;eau, change de pièce. Tu décideras après.</p>
        </>
      ) : (
        <p className="text-text-muted">10 minutes. L&apos;envie a-t-elle baissé ? Tu viens de prouver que tu peux attendre.</p>
      )}
    </div>
  );
}
