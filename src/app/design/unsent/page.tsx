import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { UnsentChat } from "@/app/app/unsent/unsent-chat";
import { demoRemove, demoSend } from "../actions";

export const metadata: Metadata = { title: "Design · Écrire sans envoyer" };

/** Banc d'essai du faux chat, avec des messages fictifs et des actions simulées (rien n'est enregistré).
 * ?long=1 : surnom de 60 caractères et message sans espace, pour tester le débordement. */
const SAMPLE = [
  { id: "d1", body: "Tu me manques ce soir. Je sais que je ne devrais pas.", createdAt: "2026-10-15T14:02:00Z" },
  { id: "d2", body: "Pourquoi tu as like ma story si c'est fini ?", createdAt: "2026-10-15T14:05:00Z" },
  {
    id: "d3",
    body: "En fait non. Tu annulais tout à la dernière minute et c'était toujours de ma faute.",
    createdAt: "2026-10-16T11:40:00Z",
  },
];

export default function DesignUnsentPage({ searchParams }: PageProps<"/design/unsent">) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <DemoChat searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}

async function DemoChat({ searchParams }: { searchParams: PageProps<"/design/unsent">["searchParams"] }) {
  const long = (await searchParams).long === "1";
  return (
    <>
      <UnsentChat
        initial={long ? [...SAMPLE, { id: "d4", body: "a".repeat(320), createdAt: "2026-10-16T12:00:00Z" }] : SAMPLE}
        exLabel={long ? "Quelqu'un avec un surnom vraiment très très long, 60 car." : "M."}
        timeZone="Asia/Bangkok"
        send={demoSend}
        remove={demoRemove}
      />
    </>
  );
}
