"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * État d'erreur de l'espace connecté (base injoignable, déchiffrement impossible…).
 * Le message ne révèle rien de technique, et la Panic Room reste accessible : c'est elle qui compte en crise.
 */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page" role="alert">
      <p className="kicker">Petit souci</p>
      <h1 className="mt-2 font-display text-xl">On n&apos;arrive pas à charger cette page.</h1>
      <p className="mt-3 max-w-[56ch] text-text-muted">
        Ton compteur et tes notes ne sont pas perdus. Réessaie dans un instant. Si tu as besoin d&apos;aide tout de
        suite, la Panic Room fonctionne même sans connexion à ton compte.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={() => retry()}>
          Réessayer
        </button>
        <Link href="/panic" className="btn btn-secondary btn-lg">
          Ouvrir la Panic Room
        </Link>
      </div>
    </div>
  );
}
