# ADR 0001: Integer Paise Representation

## Status
Accepted

## Context
Standard JavaScript IEEE 754 floating-point arithmetic introduces cumulative precision degradation (e.g. `0.1 + 0.2 === 0.30000000000000004`). In personal finance software, sub-cent drift causes balances to desynchronize, currency diffs to render trailing decimals like `₹312.000000001`, and invalid zero-allowance checks.

## Decision
All monetary values in the domain, persistence, and computation layers are strictly branded integer Paise (`1 Rupee = 100 Paise`):
```typescript
export type Paise = number & { readonly [PaiseBrand]: "Paise" };
```
- Conversions to/from Rupee decimals (`rupeesToPaise`, `toRupees`, `formatPaise`) occur exclusively at UI input parsing and display formatting boundaries.
- All domain arithmetic functions (`addPaise`, `subtractPaise`, `multiplyPaise`) enforce `Math.round()` on multiplicative factors to guarantee integral results.

## Consequences
- **Positive**: Zero floating-point rounding errors across 30 days of transactions; exact equality assertions in tests; mathematically proven balance invariants.
- **Negative**: Requires explicit casting helper `asPaise()` when bridging raw numbers from mock fixtures or sanitized JSON imports.
