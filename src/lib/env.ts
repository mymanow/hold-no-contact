/**
 * Lecture des variables d'environnement, avec une erreur claire si l'une manque.
 * Les fonctions sont paresseuses : rien ne casse au build si une variable serveur est absente.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir .env.example)`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseKey: () =>
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  encryptionKeys: () => required("DATA_ENCRYPTION_KEYS", process.env.DATA_ENCRYPTION_KEYS),
  encryptionKeyCurrent: () => Number(process.env.DATA_ENCRYPTION_KEY_CURRENT ?? "1"),
};
