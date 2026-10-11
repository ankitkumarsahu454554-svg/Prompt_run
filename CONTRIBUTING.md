# Contributing Guidelines

Thank you for contributing to **Broke But Functional — Survive the Month**.

## Development Setup

```bash
# 1. Install dependencies
npm ci

# 2. Run local dev server
npm run dev

# 3. Run full verification gate
npm run verify
```

## Architecture & Code Standards
1. **Integer Paise**: Always use branded `Paise` for money. Never use floating-point numbers in domain math.
2. **Pure Domain**: Logic in `src/domain` must have zero UI dependencies and zero side-effects.
3. **Boundaries**: Features never import other features directly; UI components never import features.
4. **WCAG 2.2 Level AA**: All interactive components must be keyboard accessible, have 44px touch targets, visible focus indicators, and 0 axe violations.
5. **No File Over 250 Lines**: Break components down when they exceed 120 lines.

## Pre-PR Verification
Before submitting, run:
```bash
npm run check:arch         # Dependency Cruiser architecture rules
npm run check:dups         # Code duplication check (jscpd < 3%)
npm run check-contrast     # Design token contrast verification
npm run check:traceability # Traceability matrix link verification
npm run typecheck          # TypeScript strict validation
npm run lint               # Next.js ESLint
npm run test:coverage      # Vitest test suite with coverage
npm run build              # Next.js static production build
npm run test:e2e           # Playwright E2E and Axe scans
```
