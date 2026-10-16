import { ChartIcon, ChatIcon, HomeIcon, ListIcon, UserIcon } from "@/components/icons";

/** Entrées de navigation, partagées par la sidebar et la tab bar. */
export const NAV = [
  { href: "/app", label: "Accueil", icon: <HomeIcon /> },
  { href: "/app/icks", label: "Ick List", icon: <ListIcon />, soon: true },
  { href: "/app/coach", label: "Sam", icon: <ChatIcon />, soon: true },
  { href: "/app/progress", label: "Progrès", icon: <ChartIcon /> },
  { href: "/app/settings", label: "Profil", icon: <UserIcon /> },
] as const;
