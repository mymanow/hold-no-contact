/** Machine à états pure de l'exercice de respiration (testée dans breath.test.ts). */

export const BREATH_PHASES = [
  { label: "Inspire", seconds: 4, scale: 1 },
  { label: "Retiens", seconds: 4, scale: 1 },
  { label: "Expire", seconds: 6, scale: 0.68 },
] as const;

export const BREATH_CYCLES = 4;

export type BreathState = {
  status: "idle" | "running" | "paused" | "finished";
  phase: number; // index dans BREATH_PHASES
  left: number; // secondes restantes dans la phase
  cycle: number; // 1..BREATH_CYCLES
};

export const INITIAL_BREATH: BreathState = { status: "idle", phase: 0, left: BREATH_PHASES[0].seconds, cycle: 1 };

/** Avance d'une seconde. Pure : même entrée, même sortie. */
export function tickBreath(s: BreathState): BreathState {
  if (s.status !== "running") return s;
  if (s.left > 1) return { ...s, left: s.left - 1 };

  const nextPhase = (s.phase + 1) % BREATH_PHASES.length;
  if (nextPhase === 0) {
    if (s.cycle >= BREATH_CYCLES) return { ...s, status: "finished", left: 0 };
    return { ...s, phase: 0, left: BREATH_PHASES[0].seconds, cycle: s.cycle + 1 };
  }
  return { ...s, phase: nextPhase, left: BREATH_PHASES[nextPhase].seconds };
}
