import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Chiffrement applicatif des champs sensibles (colonnes *_enc en bytea).
 * AES-256-GCM, format stocké : iv (12 octets) | tag (16 octets) | texte chiffré.
 * key_version accompagne chaque ligne pour permettre la rotation des clés.
 *
 * Ce n'est PAS du chiffrement de bout en bout : le serveur détient la clé
 * (le coach doit pouvoir lire l'Ick List). Le texte clair ne touche jamais la base.
 */

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

type KeyRing = Map<number, Buffer>;

export function parseKeyRing(json: string): KeyRing {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('DATA_ENCRYPTION_KEYS doit être un JSON : {"1":"<base64 de 32 octets>"}');
  }
  const ring: KeyRing = new Map();
  for (const [version, b64] of Object.entries(parsed as Record<string, string>)) {
    const key = Buffer.from(b64, "base64");
    if (key.length !== 32) {
      throw new Error(`Clé de chiffrement v${version} : 32 octets attendus, ${key.length} reçus`);
    }
    ring.set(Number(version), key);
  }
  return ring;
}

let cachedRing: KeyRing | null = null;
function ring(): KeyRing {
  cachedRing ??= parseKeyRing(env.encryptionKeys());
  return cachedRing;
}

function keyFor(version: number, keys: KeyRing): Buffer {
  const key = keys.get(version);
  if (!key) throw new Error(`Clé de chiffrement v${version} introuvable`);
  return key;
}

export function encryptWith(plaintext: string, key: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

export function decryptWith(payload: Buffer, key: Buffer): string {
  if (payload.length < IV_LENGTH + TAG_LENGTH) throw new Error("Donnée chiffrée invalide");
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(payload.subarray(IV_LENGTH + TAG_LENGTH)), decipher.final()]).toString("utf8");
}

/** bytea <-> PostgREST : Postgres échange le bytea sous forme hexadécimale "\x…". */
export function toPgBytea(buf: Buffer): string {
  return `\\x${buf.toString("hex")}`;
}

export function fromPgBytea(value: string): Buffer {
  return Buffer.from(value.startsWith("\\x") ? value.slice(2) : value, "hex");
}

/** Chiffre un texte pour une colonne *_enc. Renvoie la valeur à envoyer et la version de clé. */
export function encryptField(plaintext: string): { value: string; keyVersion: number } {
  const version = env.encryptionKeyCurrent();
  return { value: toPgBytea(encryptWith(plaintext, keyFor(version, ring()))), keyVersion: version };
}

export function decryptField(value: string, keyVersion: number): string {
  return decryptWith(fromPgBytea(value), keyFor(keyVersion, ring()));
}
