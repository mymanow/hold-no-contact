import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { UnsentChat } from "@/app/app/unsent/unsent-chat";
import { demoRemove, demoSend } from "../actions";

export const metadata: Metadata = { title: "Design · Écrire sans envoyer" };

/** Banc d'essai du faux chat, avec des messages fictifs et des actions simulées (rien n'est enregistré). */
const SAMPLE = [
  { id: "d1", body: "Tu me manques ce soir. Je sais que je ne devrais pas.", createdAt: "2026-10-15T14:02:00Z" },
  { id: "d2", body: "Pourquoi tu as like ma story si c'est fini ?", createdAt: "2026-10-15T14:05:00Z" },
  {
    id: "d3",
    body: "En fait non. Tu annulais tout à la dernière minute et c'était toujours de ma faute.",
    createdAt: "2026-10-16T11:40:00Z",
  },
];

export default function DesignUnsentPage() {
  return (
    <AppShell>
      <UnsentChat initial={SAMPLE} exLabel="M." timeZone="Asia/Bangkok" send={demoSend} remove={demoRemove} />
    </AppShell>
  );
}
