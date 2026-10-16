"use client";

import { useActionState, useEffect } from "react";
import { CONTACT_KINDS, TRIGGER_TAGS } from "@/lib/reflect";
import { resetStreak, type ResetState } from "./actions";

const chip =
  "inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-border-input px-4 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent-strong has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus";

/**
 * Formulaire Reset & Reflect, utilisé dans la modale du dashboard et sur la page /app/reset (repli sans JS).
 * onDone est appelé après un reset réussi ; onCancel affiche le bouton « Annuler ».
 */
export function ResetForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetStreak, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action} className="space-y-6">
      <fieldset>
        <legend className="label">Qu&apos;est-ce qui s&apos;est passé ?</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_KINDS.map((k) => (
            <label key={k.value} className={chip}>
              <input type="radio" name="contact_kind" value={k.value} required className="sr-only" />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">
          Qu&apos;est-ce qui l&apos;a déclenché ? <span className="font-normal text-text-muted">(facultatif)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_TAGS.map((t) => (
            <label key={t} className={chip}>
              <input type="radio" name="trigger_tag" value={t} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="reflection" className="label">
          Qu&apos;est-ce que tu retiens pour la prochaine fois ?{" "}
          <span className="font-normal text-text-muted">(facultatif, chiffré)</span>
        </label>
        <textarea
          id="reflection"
          name="reflection"
          rows={3}
          maxLength={4000}
          className="field"
          placeholder="Ce que j'espérais, ce que j'ai ressenti après…"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={pending}>
          {pending ? "Un instant…" : "Relancer mon compteur"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-lg">
          Annuler
        </button>
      </div>
    </form>
  );
}
