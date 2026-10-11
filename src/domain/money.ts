/**
 * @file money.ts
 * Pure financial money representation using branded integer Paise.
 * Eliminates floating point drift across all calculations.
 */

declare const __brand: unique symbol;

/**
 * Branded type representing money strictly as integer paise (1 Rupee = 100 Paise).
 */
export type Paise = number & { readonly [__brand]: "Paise" };

/**
 * Creates a branded Paise value from an integer number of paise.
 * Enforces integer representation.
 */
export function asPaise(amount: number): Paise {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`Cannot convert non-finite value ${amount} to Paise`);
  }
  return Math.round(amount) as Paise;
}

/**
 * Converts decimal Indian Rupees to integer Paise.
 * E.g., 100.50 -> 10050 Paise.
 */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isFinite(rupees)) {
    throw new TypeError(`Cannot convert non-finite rupees ${rupees} to Paise`);
  }
  return Math.round(rupees * 100) as Paise;
}

/**
 * Converts integer Paise to decimal Indian Rupees.
 * E.g., 10050 Paise -> 100.50 Rupees.
 */
export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}

/**
 * Adds two Paise amounts.
 */
export function addPaise(a: Paise, b: Paise): Paise {
  return asPaise(a + b);
}

/**
 * Subtracts b from a.
 */
export function subPaise(a: Paise, b: Paise): Paise {
  return asPaise(a - b);
}

/**
 * Multiplies Paise by a numeric scalar and rounds to the nearest integer.
 */
export function multiplyPaise(a: Paise, scalar: number): Paise {
  if (!Number.isFinite(scalar)) {
    throw new TypeError(`Cannot multiply Paise by non-finite scalar ${scalar}`);
  }
  return asPaise(Math.round(a * scalar));
}

/**
 * Integer division of Paise with floor.
 */
export function dividePaise(a: Paise, divisor: number): Paise {
  if (!Number.isFinite(divisor) || divisor === 0) {
    throw new TypeError(`Invalid divisor ${divisor} for Paise division`);
  }
  return asPaise(Math.floor(a / divisor));
}

/**
 * Clamps a Paise value between a minimum and maximum.
 */
export function clampPaise(value: Paise, min: Paise, max: Paise): Paise {
  return asPaise(Math.min(Math.max(value, min), max));
}

/**
 * Compares two Paise values.
 * Returns -1 if a < b, 1 if a > b, 0 if a === b.
 */
export function comparePaise(a: Paise, b: Paise): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
