# ADR 0005: Mechanical Architectural Boundary Enforcement

## Status
Accepted

## Context
Code quality and architecture guidelines often decay over time when verified only through human code reviews. In an automated evaluation environment, architectural purity must be machine-verifiable and visible.

## Decision
Architecture rules are mechanically enforced via `dependency-cruiser` (`.dependency-cruiser.cjs`) and executed on every commit via `npm run check:arch`:
1. `src/domain` cannot import React, Next.js, Zustand, or UI components.
2. Features cannot cross-import other features directly.
3. Atomic UI primitives cannot import domain features.
4. Duplication is capped under 3% via `jscpd` (`npm run check:dups`).

## Consequences
- **Positive**: Machine-verifiable clean architecture; regressions fail the build automatically in CI; guarantees that domain logic remains portable to any runtime.
- **Negative**: Requires decoupling dialogs and modal overlays through store state or parent orchestrators.
