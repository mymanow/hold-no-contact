import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays } from "date-fns";

/**
 * Calcul du streak. Jamais stocké, toujours dérivé des périodes de no contact,
 * en jours calendaires dans le fuseau de l'utilisateur (pas celui du serveur).
 */

export type Period = {
  id: string;
  startedAt: string; // ISO
  endedAt: string | null; // ISO, null = période active
  endReason: "relapse" | "goal_reached" | "manual" | null;
  targetDays: number | null;
  rules?: string[];
};

export const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365] as const;

export function daysBetween(fromIso: string, to: Date, timeZone: string): number {
  const from = new TZDate(fromIso, timeZone);
  const end = new TZDate(to.getTime(), timeZone);
  return Math.max(0, differenceInCalendarDays(end, from));
}

export type StreakStats = {
  currentDays: number;
  targetDays: number | null;
  recordDays: number; // meilleure période, en comptant la période en cours
  totalCleanDays: number; // cumul de toutes les périodes : ne baisse jamais après un reset
  nextMilestone: number | null;
  daysToNextMilestone: number | null;
  goalReached: boolean;
  isNewRecord: boolean;
  relapses: number;
};

export function computeStreak(periods: Period[], now: Date, timeZone: string): StreakStats {
  const active = periods.find((p) => p.endedAt === null) ?? null;
  const closed = periods.filter((p) => p.endedAt !== null);

  const currentDays = active ? daysBetween(active.startedAt, now, timeZone) : 0;
  const closedLengths = closed.map((p) => daysBetween(p.startedAt, new Date(p.endedAt as string), timeZone));
  const bestClosed = closedLengths.length ? Math.max(...closedLengths) : 0;
  const totalCleanDays = closedLengths.reduce((sum, d) => sum + d, 0) + currentDays;

  const targetDays = active?.targetDays ?? null;
  const nextMilestone = MILESTONES.find((m) => m > currentDays) ?? null;

  return {
    currentDays,
    targetDays,
    recordDays: Math.max(bestClosed, currentDays),
    totalCleanDays,
    nextMilestone,
    daysToNextMilestone: nextMilestone === null ? null : nextMilestone - currentDays,
    goalReached: targetDays !== null && currentDays >= targetDays,
    isNewRecord: closed.length > 0 && currentDays > bestClosed,
    relapses: closed.filter((p) => p.endReason === "relapse").length,
  };
}

/** Durée d'une période (close ou active) pour l'historique. */
export function periodLength(p: Period, now: Date, timeZone: string): number {
  return daysBetween(p.startedAt, p.endedAt ? new Date(p.endedAt) : now, timeZone);
}

export function pluralDays(n: number): string {
  return n <= 1 ? `${n} jour` : `${n} jours`;
}

/** Date du jour (AAAA-MM-JJ) dans le fuseau donné, pour les champs <input type="date">. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  const d = new TZDate(now.getTime(), timeZone);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
