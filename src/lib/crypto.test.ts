import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptWith, encryptWith, fromPgBytea, parseKeyRing, toPgBytea } from "./crypto";

describe("crypto", () => {
  const key = randomBytes(32);

  it("chiffre puis déchiffre, accents et emojis compris", () => {
    const text = "Il disait « on verra » 🙃 — encore et encore.";
    expect(decryptWith(encryptWith(text, key), key)).toBe(text);
  });

  it("produit un chiffré différent à chaque fois (IV aléatoire)", () => {
    expect(encryptWith("même texte", key).equals(encryptWith("même texte", key))).toBe(false);
  });

  it("refuse un chiffré altéré", () => {
    const payload = encryptWith("secret", key);
    payload[payload.length - 1] ^= 0xff;
    expect(() => decryptWith(payload, key)).toThrow();
  });

  it("refuse une mauvaise clé", () => {
    expect(() => decryptWith(encryptWith("secret", key), randomBytes(32))).toThrow();
  });

  it("aller-retour au format bytea de Postgres", () => {
    const payload = encryptWith("x", key);
    expect(toPgBytea(payload).startsWith("\\x")).toBe(true);
    expect(fromPgBytea(toPgBytea(payload)).equals(payload)).toBe(true);
  });

  it("valide le trousseau de clés", () => {
    expect(parseKeyRing(JSON.stringify({ 1: key.toString("base64") })).get(1)?.equals(key)).toBe(true);
    expect(() => parseKeyRing(JSON.stringify({ 1: randomBytes(16).toString("base64") }))).toThrow(/32 octets/);
    expect(() => parseKeyRing("pas du json")).toThrow(/JSON/);
  });
});
