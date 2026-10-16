"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { logResistedUrge, type PanicTool } from "./actions";
import { Breathing } from "./breathing";
import { DelayTimer } from "./delay-timer";
import { Grounding } from "./grounding";

/**
 * Panic Room (S06). Ordre pensé pour la crise :
 * 1. une seule action évidente (respirer) ;
 * 2. puis des alternatives immédiates au message qu'on s'apprête à envoyer ;
 * 3. « J'ai tenu » pour clore, et des ressources d'aide si c'est plus qu'une envie.
 */
export function PanicRoom() {
  const [intensity, setIntensity] = useState<number | null>(null);
  const [lastTool, setLastTool] = useState<PanicTool | null>(null);
  const [held, setHeld] = useState<null | { saved: boolean }>(null);
  const [pending, startTransition] = useTransition();

  if (held) {
    return (
      <section className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 text-center" aria-live="polite">
        <p className="kicker text-accent">Tu as tenu</p>
        <h1 className="font-display text-2xl">Cette vague-là est passée.</h1>
        <p className="text-text-muted">
          Chaque envie que tu laisses passer rend la suivante un peu plus facile.
          {held.saved ? " C'est noté dans ton journal." : ""}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/app" className="btn btn-primary btn-lg">
            Retour à mon compteur
          </Link>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => setHeld(null)}>
            Rester encore un peu
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <header className="text-center">
        <p className="kicker">Panic Room</p>
        <h1 className="mt-2 font-display text-2xl">Ça va passer.</h1>
        <p className="mx-auto mt-2 max-w-[40ch] text-text-muted">
          Une envie dure rarement plus de quelques minutes. Commence par respirer, on décide après.
        </p>
      </header>

      <Breathing onStart={() => setLastTool("breathing")} />

      <fieldset className="mt-4">
        <legend className="mb-2 w-full text-center text-sm text-text-muted">À combien est l&apos;envie, là, maintenant ?</legend>
        <div className="flex justify-center gap-1.5">
          {[2, 4, 6, 8, 10].map((n) => (
            <label
              key={n}
              className="grid size-11 cursor-pointer place-items-center rounded-pill border border-border-input text-sm font-semibold tabular has-[:checked]:border-panic has-[:checked]:bg-panic-soft has-[:checked]:text-panic-strong has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus"
            >
              <input
                type="radio"
                name="intensity"
                value={n}
                className="sr-only"
                checked={intensity === n}
                onChange={() => setIntensity(n)}
              />
              {n}
            </label>
          ))}
        </div>
      </fieldset>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Et au lieu de lui écrire…</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Alt
          title="Écris-lui, sans envoyer"
          text="Vide ton sac dans le faux chat. Rien ne part, jamais."
          href="/app/unsent"
          onClick={() => setLastTool("unsent")}
        />
        <Alt
          title="Relis tes raisons"
          text="Ce qui t'a fait mal. La nostalgie oublie, ta liste non."
          href="/app/icks"
          onClick={() => setLastTool("icks")}
        />
        <Alt title="Ancre-toi : 5-4-3-2-1" text="Reviens dans le présent par tes sens.">
          <Grounding onUse={() => setLastTool("distraction")} />
        </Alt>
        <Alt title="Attends 10 minutes" text="Ne décide rien pendant le pic. Le minuteur s'en charge.">
          <DelayTimer onUse={() => setLastTool("distraction")} />
        </Alt>
        <Alt
          title="Appelle quelqu'un de confiance"
          text="Un ami, un frère, une sœur. Pas pour parler de cette personne : juste pour ne pas être seul·e."
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          type="button"
          className="btn btn-primary btn-lg w-full sm:w-auto"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await logResistedUrge(lastTool, intensity);
              setHeld(result);
            })
          }
        >
          {pending ? "Un instant…" : "J'ai tenu"}
        </button>
      </div>

      <aside className="mt-10 rounded-lg border border-border p-4 text-sm text-text-muted">
        <p>
          <strong className="text-text">Si c&apos;est plus qu&apos;une envie</strong> et que tu te sens en danger ou
          penses à te faire du mal : appelle le <strong className="text-text">3114</strong> (prévention du suicide,
          France, 24 h/24) ou le <strong className="text-text">112</strong> en urgence. Ailleurs, contacte les urgences
          de ton pays.
        </p>
      </aside>
    </div>
  );
}

function Alt({
  title,
  text,
  href,
  onClick,
  children,
}: {
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const body = (
    <>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{text}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="card block p-4 transition-colors hover:bg-surface-raised"
        style={{ minHeight: "var(--touch-min)" }}
      >
        {body}
        <span aria-hidden className="mt-3 inline-block text-sm font-semibold text-accent">
          Ouvrir →
        </span>
      </Link>
    );
  }

  return (
    <div className="card p-4">
      {body}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
