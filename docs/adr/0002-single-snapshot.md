# ADR 0002: Single Snapshot Single Source of Truth

## Status
Accepted

## Context
Personal finance metrics (allowance, goal progress, risk level, burn rate, health score) are tightly coupled. In traditional architectures where components independently compute or store derived state, subtle bugs emerge where the dashboard header reports one allowance, a modal calculates another, and the forecast graph diverges.

## Decision
All financial calculations derive deterministically from the canonical `FinanceState` via a single pure domain function:
```typescript
export function getSnapshot(state: Readonly<FinanceState>): Snapshot
```
- The Zustand store stores *only* primitive user-entered data (incomes, expenses, commitments, subscriptions, goals, transfers, events) and never caches derived metrics.
- Views, the persistent `ImpactBar`, and `RippleToast` subscribe to memoized snapshots or narrow selectors that evaluate `getSnapshot(state)`.

## Consequences
- **Positive**: Eliminates split-brain state anomalies across routes; simplifies state persistence (only user transactions need to be saved to localStorage); makes testing effortless by verifying `Snapshot` outputs given a fixture `FinanceState`.
- **Negative**: Requires snapshot calculation on state changes, mitigated through React memoization and sub-millisecond pure function execution.
