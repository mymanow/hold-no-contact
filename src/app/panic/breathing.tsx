"use client";

import { useEffect, useState } from "react";
import { BREATH_CYCLES, BREATH_PHASES, INITIAL_BREATH, tickBreath, type BreathState } from "@/lib/breath";

/**
 * Respiration guidée 4-4-6 : inspirer 4 s, retenir 4 s, expirer 6 s, quatre cycles (≈ 1 minute).
 * L'expiration plus longue que l'inspiration aide à faire redescendre la tension.
 * Le cercle grandit et se rétracte au rythme des phases. Avec prefers-reduced-motion,
 * les transitions sont coupées globalement : le texte et le compte à rebours suffisent.
 */
export function Breathing({ onStart }: { onStart?: () => void }) {
  const [state, setState] = useState<BreathState>(INITIAL_BREATH);

  useEffect(() => {
    if (state.status !== "running") return;
    const id = window.setTimeout(() => {
      setState((s) => tickBreath(s));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [state]);

  const running = state.status === "running";
  const phase = BREATH_PHASES[state.phase];

  function toggle() {
    if (running) {
      setState((s) => ({ ...s, status: "paused" }));
      return;
    }
    if (state.status === "paused") {
      setState((s) => ({ ...s, status: "running" }));
      return;
    }
    setState({ ...INITIAL_BREATH, status: "running" });
    onStart?.();
  }

  const scale = running ? phase.scale : 0.82;

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={running}
        aria-describedby="breath-status"
        className={`relative my-6 grid place-items-center rounded-pill text-on-panic focus-visible:outline-offset-8 ${running ? "" : "halo"}`}
        style={{ width: "var(--panic-hero-size)", height: "var(--panic-hero-size)" }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-pill"
          style={{
            background: "radial-gradient(circle at 50% 45%, var(--color-panic-strong), var(--color-panic) 62%)",
            boxShadow: "0 0 0 18px rgb(255 122 89 / 0.10), 0 0 0 40px rgb(255 122 89 / 0.05)",
            transform: `scale(${scale})`,
            transition: `transform ${running ? phase.seconds : 0.4}s var(--ease-calm)`,
          }}
        />
        <span className="relative flex flex-col items-center gap-1 px-6">
          {running ? (
            <>
              <span className="font-display text-[26px] leading-tight font-semibold">{phase.label}</span>
              <span className="text-2xl font-bold tabular" aria-hidden>
                {state.left}
              </span>
            </>
          ) : (
            <span className="font-display text-[22px] leading-tight font-semibold">
              {state.status === "paused"
                ? "Reprendre"
                : state.status === "finished"
                  ? "Encore un tour"
                  : "Respire avec moi"}
            </span>
          )}
        </span>
      </button>

      <p id="breath-status" className="min-h-6 text-sm text-text-muted" aria-live="polite">
        {running
          ? `${phase.label} · cycle ${state.cycle} sur ${BREATH_CYCLES} · touche le cercle pour faire une pause`
          : state.status === "paused"
            ? "En pause. Touche le cercle pour reprendre."
            : state.status === "finished"
              ? "Une minute de respiration. La vague redescend."
              : "Touche le cercle : une minute, quatre respirations."}
      </p>
    </div>
  );
}
