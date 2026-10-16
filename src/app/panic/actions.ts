"use server";

import { createClient } from "@/lib/supabase/server";

export type PanicTool = "breathing" | "icks" | "unsent" | "coach" | "affirmations" | "distraction";
const TOOLS: PanicTool[] = ["breathing", "icks", "unsent", "coach", "affirmations", "distraction"];

/**
 * Enregistre une envie surmontée (journal des envies, table urge_events).
 * La Panic Room est publique : sans session, on n'enregistre rien et on ne bloque rien.
 */
export async function logResistedUrge(tool: PanicTool | null, intensity: number | null): Promise<{ saved: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { saved: false };

    const { error } = await supabase.from("urge_events").insert({
      user_id: user.id,
      tool_used: tool && TOOLS.includes(tool) ? tool : null,
      intensity: intensity !== null && intensity >= 0 && intensity <= 10 ? Math.round(intensity) : null,
      outcome: "resisted",
    });
    return { saved: !error };
  } catch {
    // Supabase injoignable (hors ligne…) : la Panic Room doit continuer de fonctionner.
    return { saved: false };
  }
}
