/**
 * @file rng.ts
 * Deterministic pseudo-random number generator using Mulberry32.
 * Pure and reproducible with zero Math.random() usage.
 */

export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Picks a random item from an array */
  pick<T>(items: readonly T[]): T;
  /** Returns current seed/state representation */
  getSeed(): number;
}

/**
 * Creates a deterministic Mulberry32 generator.
 * @param seed 32-bit integer seed
 */
export function createRng(seed: number): SeededRng {
  let s = Math.floor(seed) >>> 0;

  function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(next() * (hi - lo + 1)) + lo;
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new RangeError("Cannot pick from empty array");
    }
    const idx = nextInt(0, items.length - 1);
    const item = items[idx];
    if (item === undefined) {
      throw new RangeError("Index out of bounds");
    }
    return item;
  }

  return {
    next,
    nextInt,
    pick,
    getSeed: () => s,
  };
}
