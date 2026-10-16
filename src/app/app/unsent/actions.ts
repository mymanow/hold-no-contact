"use server";

import { encryptField } from "@/lib/crypto";
import { getUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { MAX_UNSENT_LENGTH } from "@/lib/unsent";

export type SendResult = { ok: true; id: string; createdAt: string } | { ok: false; error: string };

/**
 * « Envoie » un message à l'ex : il est intercepté, chiffré et archivé pour l'utilisateur seul.
 * Aucun appel externe, aucun accès aux contacts, SMS ou messageries. Rien ne part, jamais.
 */
export async function sendUnsent(body: string): Promise<SendResult> {
  const user = await getUser();
  const text = body.trim();
  if (!text) return { ok: false, error: "Le message est vide." };
  if (text.length > MAX_UNSENT_LENGTH) return { ok: false, error: "Message trop long (4 000 caractères maximum)." };

  const { value, keyVersion } = encryptField(text);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unsent_messages")
    .insert({ user_id: user.id, body_enc: value, key_version: keyVersion })
    .select("id, created_at")
    .single();

  if (error || !data) return { ok: false, error: "Pas pu l'archiver. Il n'est pas parti pour autant." };
  return { ok: true, id: data.id, createdAt: data.created_at };
}

export async function deleteUnsent(id: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  const supabase = await createClient();
  const { error } = await supabase.from("unsent_messages").delete().eq("id", id).eq("user_id", user.id);
  return { ok: !error };
}
