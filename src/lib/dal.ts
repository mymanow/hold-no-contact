import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Period } from "@/lib/streak";

/**
 * Data Access Layer : toute lecture de session ou de données utilisateur passe par ici.
 * Chaque fonction lit les cookies, donc doit être appelée sous un <Suspense>
 * (exigence de Cache Components dans Next.js 16).
 */

export type Profile = {
  id: string;
  displayName: string | null;
  timezone: string;
  relationshipType: "ex" | "situationship" | null;
  exLabel: string | null;
  onboardedAt: string | null;
};

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { id: user.id, email: user.email ?? null };
});

export const getProfile = cache(async (): Promise<Profile> => {
  const user = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, timezone, relationship_type, ex_label, onboarded_at")
    .eq("id", user.id)
    .single();
  if (error || !data) throw new Error(`Profil introuvable : ${error?.message ?? "aucune ligne"}`);
  return {
    id: data.id,
    displayName: data.display_name,
    timezone: data.timezone,
    relationshipType: data.relationship_type,
    exLabel: data.ex_label,
    onboardedAt: data.onboarded_at,
  };
});

export const getPeriods = cache(async (): Promise<Period[]> => {
  const user = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nc_periods")
    .select("id, started_at, ended_at, end_reason, target_days, rules")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });
  if (error) throw new Error(`Lecture des périodes impossible : ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    startedAt: p.started_at,
    endedAt: p.ended_at,
    endReason: p.end_reason,
    targetDays: p.target_days,
    rules: Array.isArray(p.rules) ? (p.rules as string[]) : [],
  }));
});

/** Garantit un utilisateur onboardé avec une période active, sinon le renvoie au bon écran. */
export async function requireActiveUser() {
  const [profile, periods] = await Promise.all([getProfile(), getPeriods()]);
  if (!profile.onboardedAt) redirect("/onboarding");
  if (!periods.some((p) => p.endedAt === null)) redirect("/onboarding/rules");
  return { profile, periods };
}
