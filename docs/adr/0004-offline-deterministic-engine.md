# ADR 0004: Offline Deterministic Finance Engine

## Status
Accepted

## Context
Personal financial applications that depend on cloud backend endpoints suffer from latency, network flakiness, privacy concerns, and unpredictable test environments.

## Decision
The entire simulation and financial engine is 100% offline and deterministic:
- Zero external APIs, zero third-party CDNs, zero telemetry exfiltration.
- Time is indexed discretely $d \in [1, 30]$ instead of depending on wall-clock `Date.now()`.
- Pseudo-random events use a deterministic, seeded Mulberry32 PRNG algorithm.

## Consequences
- **Positive**: Complete privacy for user financial records; deterministic snapshot calculation across different timezones; 100% reliable, zero-flake test execution.
- **Negative**: Long-term multi-year budgeting is outside the current discrete monthly scope.
