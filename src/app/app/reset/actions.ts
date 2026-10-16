"use server";

import { redirect } from "next/navigation";
import { encryptField } from "@/lib/crypto";
import { getUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_KINDS, TRIGGER_TAGS } from "@/lib/reflect";

export type ResetState = { error?: string };

/**
 * Reset & Reflect (S13). La réflexion libre est chiffrée ici, puis la fonction SQL reset_streak()
 * clôt la période, enregistre la réflexion et ouvre la suivante dans une seule transaction.
 */
export async function resetStreak(_prev: ResetState, formData: FormData): Promise<ResetState> {
  await getUser();

  const contactKind = String(formData.get("contact_kind") ?? "");
  const triggerTag = String(formData.get("trigger_tag") ?? "") || null;
  const reflection = String(formData.get("reflection") ?? "").trim().slice(0, 4000);

  if (!CONTACT_KINDS.some((k) => k.value === contactKind)) return { error: "Dis-nous quel type de contact." };
  if (triggerTag && !TRIGGER_TAGS.includes(triggerTag)) return { error: "Déclencheur inconnu." };

  const encrypted = reflection ? encryptField(reflection) : null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_streak", {
    p_contact_kind: contactKind,
    p_trigger_tag: triggerTag,
    p_reflection_enc: encrypted?.value ?? null,
    p_key_version: encrypted?.keyVersion ?? 1,
  });

  if (error) return { error: "Le compteur n'a pas pu être relancé. Réessaie dans un instant." };
  redirect("/app");
}
