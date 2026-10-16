import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Ick List" };

export default function IcksPage() {
  return (
    <ComingSoon title="Ick List" milestone="Jalon M4">
      Tes red flags, dealbreakers et raisons de ne pas revenir, chiffrés, à relire quand la nostalgie embellit le
      passé. La table <code>red_flags</code> est déjà en place.
    </ComingSoon>
  );
}
