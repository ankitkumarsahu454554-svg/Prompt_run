import { describe, expect, it } from "vitest";
import { evaluateGamification } from "../../src/domain/engine/gamification";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Gamification Engine", () => {
  it("evaluates streaks, rank, and unlocked badges from financial state", () => {
    const seed = createDefaultSeed();
    const profile = evaluateGamification(seed);

    expect(profile.survivalRank).toBeDefined();
    expect(profile.badges.length).toBe(5);
    expect(profile.unlockedBadgeCount).toBeGreaterThanOrEqual(1);

    const unlockedBadge = profile.badges.find((b) => b.unlocked);
    expect(unlockedBadge).toBeDefined();
    expect(unlockedBadge?.title).toBeDefined();
    expect(unlockedBadge?.description).toBeDefined();
  });
});
