import { describe, expect, it } from "vitest";
import { createDefaultSeed } from "../../src/domain/seed";
import {
  hasPrototypePollution,
  validateAndHydrateState,
} from "../../src/store/persistence";

describe("Persistence & Hydration Security", () => {
  it("hydrates default seed on empty storage", () => {
    const res = validateAndHydrateState(null);
    expect(res.recoveredFromCorruption).toBe(false);
    expect(res.state.config.startBalance).toBe(1000000);
  });

  it("validates and hydrates pristine serialized seed", () => {
    const seed = createDefaultSeed();
    const serialized = JSON.stringify(seed);
    const res = validateAndHydrateState(serialized);

    expect(res.recoveredFromCorruption).toBe(false);
    expect(res.state.meta.currentDay).toBe(8);
  });

  it("detects and rejects prototype pollution attack payloads", () => {
    const maliciousJson = '{"__proto__":{"polluted":true},"state":{}}';
    expect(hasPrototypePollution(maliciousJson)).toBe(true);

    const res = validateAndHydrateState(maliciousJson);
    expect(res.recoveredFromCorruption).toBe(true);
    expect(res.error).toContain("prototype pollution");
    expect(res.state).toEqual(createDefaultSeed());
  });

  it("recovers gracefully from corrupted JSON", () => {
    const badJson = '{"config": { "startBalance": 1000000,'; // syntax error
    const res = validateAndHydrateState(badJson);

    expect(res.recoveredFromCorruption).toBe(true);
    expect(res.state).toEqual(createDefaultSeed());
  });

  it("rejects oversized payloads exceeding 100KB", () => {
    const hugePayload = "A".repeat(105 * 1024);
    const res = validateAndHydrateState(hugePayload);

    expect(res.recoveredFromCorruption).toBe(true);
    expect(res.error).toContain("100KB");
  });

  it("migrates older schemaVersion 0 to version 1", () => {
    const seed = createDefaultSeed();
    const oldVersionState = {
      ...seed,
      meta: {
        ...seed.meta,
        schemaVersion: 0,
      },
    };

    const res = validateAndHydrateState(JSON.stringify(oldVersionState));
    expect(res.migrationApplied).toBe(true);
    expect(res.state.meta.schemaVersion).toBe(1);
  });
});
