/**
 * @file persistence.ts
 * Safe localStorage persistence, Zod validation on rehydrate, migration, and fallback.
 */

import { createDefaultSeed } from "../domain/seed";
import type { FinanceState } from "../domain/types";
import { financeStateSchema } from "../lib/schemas";

export const STORAGE_KEY = "broke_financial_state_v1";
export const MAX_IMPORT_SIZE_BYTES = 100 * 1024; // 100KB

export interface HydrationResult {
  state: FinanceState;
  recoveredFromCorruption: boolean;
  migrationApplied: boolean;
  error?: string;
}

/**
 * Checks for prototype pollution attack vectors in raw JSON string or object.
 */
export function hasPrototypePollution(raw: string): boolean {
  return (
    raw.includes('"__proto__"') ||
    raw.includes('"constructor"') ||
    raw.includes('"prototype"')
  );
}

/**
 * Validates and migrates raw stored state into current schema.
 * Falls back to default demo seed on any corruption.
 */
export function validateAndHydrateState(rawString: string | null): HydrationResult {
  if (!rawString) {
    return {
      state: createDefaultSeed(),
      recoveredFromCorruption: false,
      migrationApplied: false,
    };
  }

  // Size limit check
  if (rawString.length > MAX_IMPORT_SIZE_BYTES) {
    return {
      state: createDefaultSeed(),
      recoveredFromCorruption: true,
      migrationApplied: false,
      error: "Imported state exceeded 100KB safety limit.",
    };
  }

  // Prototype pollution check
  if (hasPrototypePollution(rawString)) {
    return {
      state: createDefaultSeed(),
      recoveredFromCorruption: true,
      migrationApplied: false,
      error: "Dangerous prototype pollution payload detected and blocked.",
    };
  }

  try {
    const parsed: unknown = JSON.parse(rawString);

    // Migration hook if needed for future versions
    let migrationApplied = false;
    let candidate = parsed;

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "meta" in candidate &&
      typeof (candidate as Record<string, unknown>).meta === "object"
    ) {
      const meta = (candidate as { meta: Record<string, unknown> }).meta;
      if (meta.schemaVersion === 0) {
        meta.schemaVersion = 1;
        migrationApplied = true;
      }
    }

    // Strict Zod validation
    const validationResult = financeStateSchema.safeParse(candidate);

    if (!validationResult.success) {
      return {
        state: createDefaultSeed(),
        recoveredFromCorruption: true,
        migrationApplied: false,
        error: `State validation failed: ${validationResult.error.message}`,
      };
    }

    return {
      state: validationResult.data,
      recoveredFromCorruption: false,
      migrationApplied,
    };
  } catch (err) {
    return {
      state: createDefaultSeed(),
      recoveredFromCorruption: true,
      migrationApplied: false,
      error: err instanceof Error ? err.message : "Malformed JSON",
    };
  }
}
