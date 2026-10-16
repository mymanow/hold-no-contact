/** Choix proposés dans Reset & Reflect. Les valeurs de contact_kind suivent la contrainte SQL. */
export const CONTACT_KINDS = [
  { value: "texted", label: "Je lui ai écrit" },
  { value: "replied", label: "J'ai répondu" },
  { value: "called", label: "Appel" },
  { value: "met", label: "On s'est vus" },
  { value: "social_media", label: "Réseaux (like, story…)" },
  { value: "other", label: "Autre" },
] as const;

/** Déclencheurs : stockés en clair pour les statistiques, donc jamais de texte libre ici. */
export const TRIGGER_TAGS = [
  "Solitude",
  "Soirée, alcool",
  "Nuit, insomnie",
  "Date ou lieu symbolique",
  "Il ou elle m'a écrit",
  "Ennui",
  "Jalousie",
] as string[];
