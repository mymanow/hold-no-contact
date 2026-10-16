import { describe, expect, it } from "vitest";
import { BREATH_CYCLES, BREATH_PHASES, INITIAL_BREATH, tickBreath, type BreathState } from "./breath";

const run = (s: BreathState, seconds: number) => {
  for (let i = 0; i < seconds; i++) s = tickBreath(s);
  return s;
};

describe("tickBreath", () => {
  const start: BreathState = { ...INITIAL_BREATH, status: "running" };
  const cycleLength = BREATH_PHASES.reduce((t, p) => t + p.seconds, 0);

  it("ne bouge pas tant que l'exercice n'est pas lancé ou s'il est en pause", () => {
    expect(tickBreath(INITIAL_BREATH)).toBe(INITIAL_BREATH);
    const paused = { ...start, status: "paused" as const };
    expect(tickBreath(paused)).toBe(paused);
  });

  it("enchaîne inspirer → retenir → expirer", () => {
    expect(run(start, 4)).toMatchObject({ phase: 1, left: 4, cycle: 1 });
    expect(run(start, 8)).toMatchObject({ phase: 2, left: 6, cycle: 1 });
    expect(run(start, cycleLength)).toMatchObject({ phase: 0, left: 4, cycle: 2 });
  });

  it("se termine après le dernier cycle, en 56 secondes", () => {
    expect(run(start, cycleLength * BREATH_CYCLES - 1).status).toBe("running");
    expect(run(start, cycleLength * BREATH_CYCLES).status).toBe("finished");
    expect(cycleLength * BREATH_CYCLES).toBe(56);
  });
});
