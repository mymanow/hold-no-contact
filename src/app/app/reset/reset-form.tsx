"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CONTACT_KINDS, TRIGGER_TAGS } from "@/lib/reflect";
import { resetStreak, type ResetState } from "./actions";

const chip =
  "inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-border-input px-4 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent-strong has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus";

export function ResetForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetStreak, {});

  return (
    <form action={action} className="space-y-7">
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
          rows={4}
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
          {pending ? "Un instant…" : "Repartir de zéro, sans rien perdre"}
        </button>
        <Link href="/app" className="btn btn-ghost btn-lg">
          Annuler
        </Link>
      </div>
    </form>
  );
}
