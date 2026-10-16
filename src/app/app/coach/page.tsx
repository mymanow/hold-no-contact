import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sam" };

export default function CoachPage() {
  return (
    <ComingSoon title="Sam, ton coach" milestone="Jalon M6">
      Un coach qui connaît ton histoire, en mode doux ou en mode No-BS. Il ne te poussera jamais à reprendre contact.
    </ComingSoon>
  );
}
