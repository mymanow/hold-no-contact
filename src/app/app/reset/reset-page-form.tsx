"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ResetForm } from "./reset-form";

/** Version page du formulaire (lien direct, ou JavaScript lent à charger). */
export function ResetPageForm() {
  const router = useRouter();
  const back = useCallback(() => router.push("/app"), [router]);
  return <ResetForm onDone={back} onCancel={back} />;
}
