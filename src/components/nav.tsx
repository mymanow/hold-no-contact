import { ChartIcon, ChatIcon, HomeIcon, ListIcon, PenIcon, UserIcon } from "@/components/icons";

/** Entrées de navigation, partagées par la sidebar et la tab bar (5 entrées max dans la tab bar). */
export const NAV = [
  { href: "/app", label: "Accueil", icon: <HomeIcon /> },
  { href: "/app/unsent", label: "Écrire", icon: <PenIcon /> },
  { href: "/app/icks", label: "Ick List", icon: <ListIcon />, soon: true },
  { href: "/app/coach", label: "Sam", icon: <ChatIcon />, soon: true },
  { href: "/app/progress", label: "Progrès", icon: <ChartIcon />, sidebarOnly: true },
  { href: "/app/settings", label: "Profil", icon: <UserIcon /> },
] as const;
