/** Constantes du module « Text Your Ex (But Don't) », partagées entre client et serveur. */
export const MAX_UNSENT_LENGTH = 4000;

/**
 * Questions posées après un « envoi » : elles déplacent l'attention du message vers ce que l'on ressent.
 * Écrites pour l'app, jamais reprises d'ailleurs.
 */
export const AFTER_SEND_PROMPTS = [
  "Message intercepté. Qu'est-ce que tu espérais qu'il ou elle réponde ?",
  "C'est sorti de ta tête, et ça n'est allé nulle part. Comment tu te sens maintenant ?",
  "Rien n'est parti. Si tu l'avais envoyé, où en serais-tu dans une heure ?",
  "Bien gardé. Ce besoin derrière le message, quelqu'un d'autre peut-il y répondre ce soir ?",
  "Intercepté. Relis-le demain : tu verras ce qu'il disait vraiment.",
] as const;

export function promptFor(index: number): string {
  return AFTER_SEND_PROMPTS[index % AFTER_SEND_PROMPTS.length];
}
