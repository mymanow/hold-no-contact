import type { Metadata, Viewport } from "next";
import tokens from "../../design/tokens.json";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Hold", template: "%s · Hold" },
  description: "Tiens ton no contact, un jour après l'autre.",
  applicationName: "Hold",
  // Titre neutre : rien dans l'onglet ne trahit le sujet de l'app.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: tokens.color.bg,
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
