"use client";

import { useCallback, useState } from "react";
import { Sheet } from "@/components/sheet";
import { pluralDays } from "@/lib/streak";
import { ResetForm } from "./reset-form";

type Kept = { currentDays: number; recordDays: number; totalCleanDays: number };

/**
 * Bouton « J'ai eu un contact » + modale en deux temps :
 * 1. confirmation (ce que tu gardes, ce qui repart) — on ne remet pas un compteur à zéro sur un clic accidentel ;
 * 2. réflexion (type de contact, déclencheur, ce que tu retiens), puis reset atomique côté serveur.
 * Sans JavaScript, le lien mène à /app/reset, qui propose le même formulaire.
 */
export function ResetDialog({ kept }: { kept: Kept }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "reflect">("confirm");
  const [restarted, setRestarted] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setStep("confirm");
  }, []);
  const done = useCallback(() => {
    close();
    setRestarted(true);
    window.setTimeout(() => setRestarted(false), 6000);
  }, [close]);

  return (
    <>
      <a
        href="/app/reset"
        onClick={(e) => {
          e.preventDefault();
          setRestarted(false);
          setOpen(true);
        }}
        className="whitespace-nowrap underline underline-offset-4 hover:text-text"
      >
        J&apos;ai eu un contact
      </a>

      <p
        role="status"
        className={`fixed inset-x-4 z-[60] mx-auto max-w-md rounded-md bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong shadow-pop transition-opacity bottom-[calc(var(--tabbar-height)+var(--panic-fab-size)+var(--spacing)*8+var(--safe-bottom))] lg:bottom-6 ${
          restarted ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {restarted ? "Compteur relancé. Ton record et ton cumul sont gardés." : ""}
      </p>

      <Sheet
        open={open}
        onClose={close}
        title={step === "confirm" ? "Tu as eu un contact ?" : "Prends une minute pour toi"}
        description={
          step === "confirm"
            ? "Ça arrive. Ce n'est pas un retour à zéro."
            : "Ces réponses t'aideront à repérer ce qui te fait flancher."
        }
      >
        {step === "confirm" ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-surface-raised p-3">
                <dt className="text-xs text-text-muted">Repart à</dt>
                <dd className="mt-1 font-display text-lg font-semibold tabular">0 j</dd>
              </div>
              <div className="rounded-md bg-surface-raised p-3">
                <dt className="text-xs text-text-muted">Record gardé</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-record tabular">
                  {Math.max(kept.recordDays, kept.currentDays)} j
                </dd>
              </div>
              <div className="rounded-md bg-surface-raised p-3">
                <dt className="text-xs text-text-muted">Cumul gardé</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-accent tabular">{kept.totalCleanDays} j</dd>
              </div>
            </dl>
            <p className="text-sm text-text-muted">
              Tes {pluralDays(kept.currentDays)} restent dans ton historique. Seul le compteur du moment repart.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button type="button" className="btn btn-primary btn-lg flex-1" onClick={() => setStep("reflect")}>
                Oui, je repars
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={close} autoFocus>
                Non, fausse alerte
              </button>
            </div>
          </div>
        ) : (
          <ResetForm onDone={done} onCancel={close} />
        )}
      </Sheet>
    </>
  );
}
