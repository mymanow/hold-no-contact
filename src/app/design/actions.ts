"use server";

import type { SendResult } from "@/app/app/unsent/actions";

/** Fausses actions du banc d'essai : rien n'est écrit en base. */
export async function demoSend(body: string): Promise<SendResult> {
  await new Promise((r) => setTimeout(r, 400));
  if (body.toLowerCase().includes("échec")) return { ok: false, error: "Démo : échec simulé" };
  return { ok: true, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}

export async function demoRemove(): Promise<{ ok: boolean }> {
  return { ok: true };
}
