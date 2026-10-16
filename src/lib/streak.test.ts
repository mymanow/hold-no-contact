import { describe, expect, it } from "vitest";
import { computeStreak, daysBetween, todayInTimeZone, type Period } from "./streak";

const period = (p: Partial<Period>): Period => ({
  id: crypto.randomUUID(),
  startedAt: "2026-10-01T10:00:00Z",
  endedAt: null,
  endReason: null,
  targetDays: 60,
  ...p,
});

describe("daysBetween", () => {
  it("compte en jours calendaires dans le fuseau de l'utilisateur", () => {
    // 23:30 à Bangkok le 15, puis 00:30 le 16 : un jour est passé, même si une heure seulement
    const start = "2026-10-15T16:30:00Z"; // 23:30 Asia/Bangkok
    const now = new Date("2026-10-15T17:30:00Z"); // 00:30 Asia/Bangkok, le 16
    expect(daysBetween(start, now, "Asia/Bangkok")).toBe(1);
    expect(daysBetween(start, now, "Europe/Paris")).toBe(0);
  });

  it("ne perd pas de jour au passage à l'heure d'hiver", () => {
    // Paris passe à l'heure d'hiver le 25 octobre 2026
    const start = "2026-10-24T08:00:00Z";
    const now = new Date("2026-10-26T08:00:00Z");
    expect(daysBetween(start, now, "Europe/Paris")).toBe(2);
  });

  it("ne renvoie jamais de nombre négatif", () => {
    expect(daysBetween("2026-10-20T00:00:00Z", new Date("2026-10-16T00:00:00Z"), "UTC")).toBe(0);
  });
});

describe("computeStreak", () => {
  const now = new Date("2026-10-16T12:00:00Z");

  it("J0 sans historique", () => {
    const s = computeStreak([period({ startedAt: "2026-10-16T08:00:00Z" })], now, "UTC");
    expect(s).toMatchObject({ currentDays: 0, recordDays: 0, totalCleanDays: 0, nextMilestone: 3, relapses: 0 });
  });

  it("garde le record et le cumul après un reset", () => {
    const s = computeStreak(
      [
        period({ startedAt: "2026-08-01T08:00:00Z", endedAt: "2026-09-22T08:00:00Z", endReason: "relapse" }), // 52 j
        period({ startedAt: "2026-09-22T09:00:00Z", endedAt: "2026-09-30T08:00:00Z", endReason: "relapse" }), // 8 j
        period({ startedAt: "2026-09-30T09:00:00Z" }), // 16 j
      ],
      now,
      "UTC",
    );
    expect(s.currentDays).toBe(16);
    expect(s.recordDays).toBe(52);
    expect(s.totalCleanDays).toBe(52 + 8 + 16);
    expect(s.relapses).toBe(2);
    expect(s.isNewRecord).toBe(false);
    expect(s.nextMilestone).toBe(30);
    expect(s.daysToNextMilestone).toBe(14);
  });

  it("signale un nouveau record et l'objectif atteint", () => {
    const s = computeStreak(
      [
        period({ startedAt: "2026-06-01T08:00:00Z", endedAt: "2026-06-11T08:00:00Z", endReason: "relapse" }),
        period({ startedAt: "2026-08-10T08:00:00Z", targetDays: 60 }),
      ],
      now,
      "UTC",
    );
    expect(s.currentDays).toBe(67);
    expect(s.isNewRecord).toBe(true);
    expect(s.goalReached).toBe(true);
  });
});

describe("todayInTimeZone", () => {
  it("donne la date locale, pas la date UTC", () => {
    const now = new Date("2026-10-16T20:00:00Z"); // 03:00 le 17 à Bangkok
    expect(todayInTimeZone("Asia/Bangkok", now)).toBe("2026-10-17");
    expect(todayInTimeZone("Europe/Paris", now)).toBe("2026-10-16");
  });
});
