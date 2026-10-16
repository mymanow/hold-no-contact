"use server";

import { TZDate } from "@date-fns/tz";
import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/dal";
import { RULE_OPTIONS } from "@/lib/rules";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

function isTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("fr", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Étape 1 (S01) : qui tu es, quelle relation, ton fuseau. */
export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  const relationship = String(formData.get("relationship_type") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 60) || null;
  const exLabel = String(formData.get("ex_label") ?? "").trim().slice(0, 40) || null;
  const timezone = String(formData.get("timezone") ?? "");
  const consent = formData.get("consent") === "on";

  if (!["ex", "situationship"].includes(relationship)) return { error: "Choisis le type de relation." };
  if (!consent) return { error: "Il faut accepter que tes notes soient stockées (chiffrées) pour continuer." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      relationship_type: relationship,
      display_name: displayName,
      ex_label: exLabel,
      timezone: isTimeZone(timezone) ? timezone : "Europe/Paris",
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: "Enregistrement impossible. Réessaie dans un instant." };
  redirect("/onboarding/rules");
}

/** Étape 2 (S02) : date du dernier contact, objectif, règles → crée la période active. */
export async function startPeriod(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  const profile = await getProfile();
  const tz = profile.timezone;

  const lastContact = String(formData.get("last_contact") ?? "");
  const target = Number(formData.get("target_days"));
  const rules = formData
    .getAll("rules")
    .map(String)
    .filter((r) => (RULE_OPTIONS as readonly string[]).includes(r));

  if (![30, 60, 90].includes(target)) return { error: "Choisis un objectif." };

  const now = new Date();
  let startedAt = now;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastContact);
  if (match) {
    const [, y, m, d] = match.map(Number);
    const startOfDay = new TZDate(y, m - 1, d, 0, 0, 0, tz);
    if (startOfDay.getTime() > now.getTime()) return { error: "La date ne peut pas être dans le futur." };
    const today = new TZDate(now.getTime(), tz);
    const isToday = today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d;
    startedAt = isToday ? now : new Date(startOfDay.getTime());
  }

  const supabase = await createClient();
  const { error } = await supabase.from("nc_periods").insert({
    user_id: user.id,
    started_at: startedAt.toISOString(),
    target_days: target,
    rules,
  });

  // 23505 : une période est déjà active (index unique partiel) — on continue simplement.
  if (error && error.code !== "23505") return { error: "Impossible de démarrer ton compteur. Réessaie." };
  redirect("/app");
}
