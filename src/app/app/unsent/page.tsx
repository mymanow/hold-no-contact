import type { Metadata } from "next";
import { Suspense } from "react";
import { getProfile, getUnsentMessages } from "@/lib/dal";
import { UnsentChat } from "./unsent-chat";

export const metadata: Metadata = { title: "Écrire sans envoyer" };

export default function UnsentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-var(--tabbar-height))] flex-col lg:h-dvh" aria-busy>
          <div className="h-16 border-b border-border bg-surface" />
          <div className="flex-1" />
          <div className="h-[var(--composer-height)] border-t border-border bg-surface" />
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}

async function Chat() {
  const [profile, messages] = await Promise.all([getProfile(), getUnsentMessages()]);
  return <UnsentChat initial={messages} exLabel={profile.exLabel} timeZone={profile.timezone} />;
}
