"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { AlertIcon } from "@/components/icons";
import type { UnsentMessage } from "@/lib/dal";
import { MAX_UNSENT_LENGTH, promptFor } from "@/lib/unsent";
import { deleteUnsent, sendUnsent, type SendResult } from "./actions";

type Status = "sending" | "intercepted" | "failed";
type Bubble = { key: string; id?: string; body: string; createdAt: string; status: Status; prompt?: string };

type Props = {
  initial: UnsentMessage[];
  exLabel: string | null;
  timeZone: string;
  /** Remplaçables pour le banc d'essai /design ; par défaut, les vraies Server Actions. */
  send?: (body: string) => Promise<SendResult>;
  remove?: (id: string) => Promise<{ ok: boolean }>;
};

/**
 * « Text Your Ex (But Don't) » (S07). Une messagerie qui ressemble à une vraie, sans en copier aucune,
 * où le bouton Envoyer intercepte tout. Les messages sont chiffrés côté serveur et ne quittent jamais l'app.
 * Rien n'est gardé dans le navigateur (localStorage) : sur un appareil partagé, ce serait lisible.
 */
export function UnsentChat({ initial, exLabel, timeZone, send = sendUnsent, remove = deleteUnsent }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    initial.map((m) => ({ key: m.id, id: m.id, body: m.body, createdAt: m.createdAt, status: "intercepted" })),
  );
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sentCount = useRef(initial.length);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const name = exLabel?.trim() || "Ton ex";
  const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone });
  const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone });

  // Défile à chaque changement (nouveau message, puis confirmation d'interception et question d'accompagnement).
  const lastKey = bubbles.at(-1)?.key;
  const lastPrompt = bubbles.at(-1)?.prompt;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [bubbles.length, lastKey, lastPrompt]);

  function deliver(bubble: Bubble) {
    startTransition(async () => {
      let result: SendResult;
      try {
        result = await send(bubble.body);
      } catch {
        result = { ok: false, error: "Pas de connexion." };
      }
      const prompt = result.ok ? promptFor(sentCount.current++) : undefined;
      setBubbles((list) =>
        list.map((b) => {
          if (b.key !== bubble.key) return b;
          if (!result.ok) return { ...b, status: "failed" };
          return { ...b, id: result.id, createdAt: result.createdAt, status: "intercepted", prompt };
        }),
      );
    });
  }

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const bubble: Bubble = {
      key: `local-${crypto.randomUUID()}`,
      body: body.slice(0, MAX_UNSENT_LENGTH),
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    // Une seule question d'accompagnement à l'écran : celle du dernier message.
    setBubbles((list) => [...list.map((b) => ({ ...b, prompt: undefined })), bubble]);
    setDraft("");
    inputRef.current?.focus();
    deliver(bubble);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Entrée envoie, Maj+Entrée va à la ligne. Ignoré pendant une composition (accents, IME).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function onDelete(b: Bubble) {
    if (!b.id) return;
    if (confirmDelete !== b.key) {
      setConfirmDelete(b.key);
      return;
    }
    setConfirmDelete(null);
    const removed = b;
    setBubbles((list) => list.filter((x) => x.key !== b.key));
    startTransition(async () => {
      const { ok } = await remove(removed.id as string);
      if (!ok) setBubbles((list) => [...list, removed].sort((x, y) => x.createdAt.localeCompare(y.createdAt)));
    });
  }

  const days = bubbles.map((b) => dayFmt.format(new Date(b.createdAt)));

  return (
    <div className="flex h-[calc(100dvh-var(--tabbar-height)-var(--safe-bottom))] flex-col lg:h-dvh">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:px-8">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-pill bg-surface-raised font-display text-lg font-semibold"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{name}</h1>
          <p className="flex items-center gap-1.5 text-xs text-accent-strong">
            <span aria-hidden>🔒</span> Rien de ce que tu écris ici ne sera envoyé
          </p>
        </div>
        <Link
          href="/panic"
          className="grid size-11 shrink-0 place-items-center rounded-pill bg-panic-soft text-panic-strong lg:hidden"
          aria-label="J'ai besoin d'aide : ouvrir la Panic Room"
        >
          <AlertIcon width={22} height={22} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 lg:px-8" role="log" aria-label="Messages interceptés" aria-live="polite">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-3">
          {bubbles.length === 0 ? (
            <div className="mx-auto my-10 max-w-sm text-center">
              <p className="font-semibold">Écris tout ce que tu as envie de lui dire.</p>
              <p className="mt-2 text-sm text-text-muted">
                La colère, le manque, les « et si ». Appuie sur Envoyer : le message est intercepté, chiffré, et gardé
                pour toi seul·e. Il n&apos;arrivera jamais.
              </p>
            </div>
          ) : null}

          {bubbles.map((b, i) => {
            const day = days[i];
            const showDay = i === 0 || day !== days[i - 1];
            return (
              <div key={b.key} className="flex flex-col">
                {showDay ? (
                  <p className="my-2 self-center rounded-pill bg-surface px-3 py-1 text-xs text-text-muted first-letter:uppercase">
                    {day}
                  </p>
                ) : null}

                <div className="flex flex-col items-end">
                  <p className="max-w-[85%] rounded-xl rounded-br-sm bg-accent-soft px-4 py-2.5 break-words whitespace-pre-wrap text-text sm:max-w-[70%]">
                    {b.body}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-text-subtle">
                    <time dateTime={b.createdAt}>{timeFmt.format(new Date(b.createdAt))}</time>
                    <span aria-hidden>·</span>
                    {b.status === "sending" ? (
                      <span>Interception…</span>
                    ) : b.status === "failed" ? (
                      <button
                        type="button"
                        className="font-semibold text-danger underline underline-offset-2"
                        onClick={() => {
                          setBubbles((list) => list.map((x) => (x.key === b.key ? { ...x, status: "sending" } : x)));
                          deliver(b);
                        }}
                      >
                        Non archivé, réessayer
                      </button>
                    ) : (
                      <span className="text-accent">Intercepté, jamais envoyé</span>
                    )}
                    {b.id ? (
                      <>
                        <span aria-hidden>·</span>
                        <button
                          type="button"
                          onClick={() => onDelete(b)}
                          onBlur={() => setConfirmDelete((k) => (k === b.key ? null : k))}
                          className={`underline-offset-2 hover:underline ${confirmDelete === b.key ? "font-semibold text-danger" : ""}`}
                        >
                          {confirmDelete === b.key ? "Confirmer la suppression" : "Supprimer"}
                        </button>
                      </>
                    ) : null}
                  </p>
                </div>

                {b.prompt ? (
                  <div className="mt-3 max-w-[85%] self-start rounded-xl rounded-bl-sm border border-border bg-surface px-4 py-3 text-sm sm:max-w-[70%]">
                    <p className="text-xs font-semibold text-accent">Hold</p>
                    <p className="mt-1 text-text-muted">{b.prompt}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-border bg-surface px-3 py-3 lg:px-8">
        <div className="mx-auto flex max-w-[var(--content-max)] items-end gap-2">
          <label htmlFor="unsent-input" className="sr-only">
            Ton message (il ne sera pas envoyé)
          </label>
          <textarea
            id="unsent-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_UNSENT_LENGTH}
            // Surnom long : texte indicatif générique, sinon le champ (dimensionné sur son contenu) gonfle sur 3 lignes
            placeholder={name.length <= 16 ? `Écris à ${name}…` : "Écris ton message…"}
            className="field max-h-40 min-h-12 flex-1 resize-none py-3 field-sizing-content"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="btn btn-primary min-h-12 shrink-0" disabled={!draft.trim()}>
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
