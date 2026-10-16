"use client";

import { useActionState } from "react";
import { startPeriod, type FormState } from "../actions";

export function RulesForm({ today, rules }: { today: string; rules: readonly string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startPeriod, {});

  return (
    <form action={action} className="space-y-7">
      <div>
        <label htmlFor="last_contact" className="label">
          Votre dernier contact remonte au…
        </label>
        <input id="last_contact" name="last_contact" type="date" max={today} defaultValue={today} className="field" />
        <p className="mt-2 text-sm text-text-muted">Si c&apos;était il y a quelques jours, ces jours comptent déjà.</p>
      </div>

      <fieldset>
        <legend className="label">Ton objectif</legend>
        <div className="grid grid-cols-3 gap-3">
          {[30, 60, 90].map((d) => (
            <label
              key={d}
              className="card flex min-h-14 cursor-pointer flex-col items-center justify-center has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus"
            >
              <input type="radio" name="target_days" value={d} defaultChecked={d === 60} className="sr-only" />
              <span className="font-display text-lg font-semibold">{d}</span>
              <span className="text-xs text-text-muted">jours</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-text-muted">60 jours, c&apos;est l&apos;objectif le plus courant.</p>
      </fieldset>

      <fieldset>
        <legend className="label">Mes règles</legend>
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <label key={rule} className="card flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3 text-sm">
              <input type="checkbox" name="rules" value={rule} defaultChecked={i < 3} className="size-5 accent-accent" />
              {rule}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
        {pending ? "Démarrage…" : "Démarrer mon compteur"}
      </button>
    </form>
  );
}
