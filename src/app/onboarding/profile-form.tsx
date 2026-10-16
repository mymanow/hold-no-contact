"use client";

import { useActionState } from "react";
import { saveProfile, type FormState } from "./actions";

export function ProfileForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});

  // Le fuseau est lu dans le navigateur au moment de l'envoi : c'est lui qui définit « aujourd'hui » pour le compteur.
  function submit(formData: FormData) {
    formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    action(formData);
  }

  return (
    <form action={submit} className="space-y-7">
      <fieldset>
        <legend className="label">C&apos;était…</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "ex", label: "Une relation" },
            { value: "situationship", label: "Une situationship" },
          ].map((o) => (
            <label
              key={o.value}
              className="card flex min-h-14 cursor-pointer items-center gap-3 px-4 has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus"
            >
              <input type="radio" name="relationship_type" value={o.value} required className="accent-accent" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="display_name" className="label">
          Comment veux-tu qu&apos;on t&apos;appelle ? <span className="font-normal text-text-muted">(facultatif)</span>
        </label>
        <input id="display_name" name="display_name" className="field" maxLength={60} autoComplete="given-name" />
      </div>

      <div>
        <label htmlFor="ex_label" className="label">
          Un surnom pour cette personne <span className="font-normal text-text-muted">(facultatif)</span>
        </label>
        <input id="ex_label" name="ex_label" className="field" maxLength={40} placeholder="ex. « M. »" />
        <p className="mt-2 text-sm text-text-muted">Pas besoin de son vrai nom. Une initiale suffit.</p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 size-5 accent-accent" />
        <span className="text-text-muted">
          J&apos;accepte que mes notes (réflexions, listes) soient stockées pour moi. Elles sont chiffrées et je peux les
          exporter ou les supprimer à tout moment.
        </span>
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Continuer"}
      </button>
    </form>
  );
}
