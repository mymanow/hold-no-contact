"use client";

import { useState } from "react";

/** Ancrage 5-4-3-2-1 : ramener l'attention dans le présent, par les sens, une étape à la fois. */
const STEPS = [
  { n: 5, text: "choses que tu vois autour de toi" },
  { n: 4, text: "choses que tu peux toucher" },
  { n: 3, text: "sons que tu entends" },
  { n: 2, text: "odeurs que tu sens (ou que tu aimes)" },
  { n: 1, text: "chose que tu peux goûter, ou une gorgée d'eau" },
];

export function Grounding({ onUse }: { onUse?: () => void }) {
  const [step, setStep] = useState<number | null>(null);

  if (step === null) {
    return (
      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={() => {
          setStep(0);
          onUse?.();
        }}
      >
        Commencer l&apos;ancrage
      </button>
    );
  }

  const done = step >= STEPS.length;
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <div aria-live="polite">
      {done ? (
        <p className="text-text-muted">Tu es ici, maintenant. L&apos;envie est une vague : elle monte, puis elle passe.</p>
      ) : (
        <>
          <p className="text-lg">
            Nomme <span className="font-display text-2xl font-semibold text-accent tabular">{current.n}</span>{" "}
            {current.text}.
          </p>
          <ol className="mt-3 flex gap-1.5" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <li key={s.n} aria-hidden className={`h-1.5 flex-1 rounded-pill ${i <= step ? "bg-accent" : "bg-border"}`} />
            ))}
          </ol>
        </>
      )}
      <div className="mt-4 flex gap-3">
        {done ? (
          <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
            Recommencer
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {step === STEPS.length - 1 ? "Terminer" : "Suivant"}
          </button>
        )}
      </div>
    </div>
  );
}
