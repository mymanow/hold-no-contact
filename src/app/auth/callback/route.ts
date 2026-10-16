import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Retour du magic link ou de Google : échange le code contre une session, puis direction l'app. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/app`);
  }

  const kind = searchParams.get("error") ? "oauth" : "link";
  return NextResponse.redirect(`${origin}/login?error=${kind}`);
}
