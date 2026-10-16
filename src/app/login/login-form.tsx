"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLink, signInWithGoogle, type LoginState } from "./actions";

const ERRORS: Record<string, string> = {
  oauth: "La connexion avec Google n'a pas abouti. Réessaie ou utilise ton email.",
  link: "Ce lien a expiré ou a déjà servi. Demande-en un nouveau.",
};

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });
  const callbackError = useSearchParams().get("error");

  if (state.status === "sent") {
    return (
      <div className="card p-6" role="status">
        <h2 className="text-lg font-semibold">Regarde tes emails</h2>
        <p className="mt-2 text-text-muted">
          On a envoyé un lien de connexion à <strong className="text-text">{state.email}</strong>. Il est valable une
          heure. Pense à vérifier les spams.
        </p>
      </div>
    );
  }

  const error = state.status === "error" ? state.message : callbackError ? ERRORS[callbackError] : undefined;

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={state.email}
            placeholder="toi@exemple.com"
            className="field"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        {error ? (
          <p id="login-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
          {pending ? "Envoi…" : "Recevoir un lien de connexion"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-subtle" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogle}>
        <button type="submit" className="btn btn-secondary btn-lg w-full">
          Continuer avec Google
        </button>
      </form>
    </div>
  );
}
