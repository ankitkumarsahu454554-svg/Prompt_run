# Architectural & Design Decisions

This document logs all principal architectural, algorithmic, and interface design decisions made autonomously to fulfill the specification.

---

## 1. Domain Modeling: Integer Paise Branded Type
- **Context**: Standard JavaScript floating point numbers (`0.1 + 0.2 = 0.30000000000000004`) lead to accumulated rounding errors, visual artifacts, and financial reconciliation discrepancies.
- **Decision**: Brand `Paise` as `number & { readonly __brand: unique symbol }`. All domain engine interfaces accept and return `Paise`. Conversions to/from Rupee decimals (`fromRupees(100.50) -> 10050`, `toRupees(10050) -> 100.5`) occur only at UI input parsing and display formatting boundaries.

---

## 2. Time Horizon: 1..30 Day Indexing
- **Context**: Working with wall-clock dates introduces timezone skew, leap seconds, monthly day-count variability (28 vs 31), and client locale desynchronization.
- **Decision**: Model time strictly as a discrete integer day index $d \in [1, 30]$.
  - $\text{daysLeft} = 30 - d + 1$, ensuring today is included in the active budget division and never drops to 0 inside the monthly simulation.
  - A dedicated "Next Day" control advances time deterministically, triggering the settlement of subscriptions, scheduled expenses, and income drops.

---

## 3. Discretionary Burn Rate Window
- **Context**: In the early days of the month (e.g., Day 1 to Day 3), trailing 7-day spend history is either non-existent or statistically unrepresentative.
- **Decision**: Window size is dynamic: $W = \min(7, \text{currentDay} - 1)$.
  - If $\text{currentDay} = 1$, fall back to the initial planned daily allowance.
  - Only discretionary `manual` expenses are counted in burn rate; fixed commitments, one-off unexpected events, and goal transfers are excluded from burn rate to avoid skewing daily living velocity.

---

## 4. Multi-Tiered Financial Risk Evaluation
- **Context**: Gen Z users need immediate, non-cryptic clarity on whether their money is in jeopardy without having to decipher multi-variable accounting sheets.
- **Decision**: Four risk tiers evaluated hierarchically:
  1. `Critical`: Balance cannot cover immediate obligations or money runs out in $\le 3$ days.
  2. `Danger`: Negative forecast at month-end.
  3. `Watch`: Low buffer ($< 15\%$ of initial capital) or high commitment burden ($> 60\%$).
  4. `Safe`: Healthy runway, positive reserves, low fixed load.
  Each tier returns localized, human-friendly reasons alongside the status tag.

---

## 5. Decision Simulator: Immutability Guarantee
- **Context**: Testing potential financial actions ("Can I buy this ₹1,800 jacket?") must not accidentally alter the user's active financial state or cause memory leaks.
- **Decision**: `simulateDecision` clones and deeply freezes the input state (`Object.freeze`) before applying a virtual transaction. It computes full snapshots `before` and `after`, returning a structured diff and verdict (`GO FOR IT`, `THINK TWICE`, `HARD NO`) with multi-factor impact explanation (allowance drop, goal ETA slip, risk tier degradation).

---

## 6. Zero External Chart Library & Zero Motion Lib
- **Context**: Popular charting libraries (Chart.js, Recharts, ECharts) and animation libraries (`framer-motion`) add 150KB–300KB+ to bundle sizes, negatively impacting First Input Delay (FID), Interaction to Next Paint (INP), and Largest Contentful Paint (LCP).
- **Decision**: Hand-craft zero-dependency SVG charts (`Sparkline`, `ProgressRing`, `Gauge`, `LineChart`, `DonutChart`) with responsive SVG viewports, native CSS transitions, and dual screen-reader accessibility (hidden semantic HTML `<table>` fallbacks). Animated counters use a lightweight `requestAnimationFrame` hook respecting `prefers-reduced-motion`.

---

## 7. Contrast & Accessibility Standards
- **Context**: Dark mode fintech palettes often use saturated purples or neon accents that fail WCAG 2.2 AA contrast requirements (e.g. white text on `#7C5CFF` achieves only 4.3:1).
- **Decision**:
  - Primary button fill: `#6D4AFF` (5.1:1 on white).
  - Accent text on dark surfaces: `#8B72FF`.
  - Contrast checker script automated in CI to fail the build if any background/foreground pair drops below 4.5:1 (or 3:1 for large display text and UI borders).
  - Every interactive element provides $\ge 44\text{px}$ touch targets and visible focus indicators with 2px offset.

---

## 8. Persistence & Corrupted Storage Auto-Recovery
- **Context**: Client localStorage is vulnerable to corruption, version skew across deployments, and malicious tampering via manual JSON injection.
- **Decision**:
  - Strict Zod schema validation (`financeStateSchema.strict()`) on store rehydration.
  - Size cap enforced on imported files (maximum 100 KB) with prototype pollution key protection (`__proto__`, `constructor`, `prototype`).
  - If rehydration fails or localStorage holds invalid schema, the store automatically falls back to the deterministic benchmark seed state without crashing the UI, alerting the user with a dismissible notice.

---

## 9. The Ripple UX Contract & Undo Architecture
- **Context**: Users must see the interconnected consequences of every action immediately, without navigating across disconnected sub-pages.
- **Decision**:
  - Persistent `ImpactBar` on every route rendering current Balance, Safe-to-Spend Allowance, Risk Badge, and Health Score.
  - Every mutation (expense creation, commitment toggle, simulated decision commit, event resolution, goal deposit, day advancement) dispatches a `RippleToastData` event computing before/after deltas.
  - Previous financial state is preserved in a single-step undo buffer (`previousState`), permitting immediate reversion with exact reversal toast notification.

---

## 10. Security Pipeline: Unicode NFKC & Zero Unsafe HTML
- **Context**: Financial applications accepting user text (notes, category labels, income names) are prime vectors for stored XSS and bidi override spoofing.
- **Decision**:
  - Input sanitization function `sanitizeText` applies Unicode NFKC normalization, strips HTML tags, filters bidirectional control characters (`U+202A`–`U+202E`, `U+2066`–`U+2069`), and truncates to length boundaries.
  - Strict Content Security Policy in `next.config.ts` enforcing `default-src 'self'`, forbidding `unsafe-eval` in production, and applying `object-src 'none'`.
  - Zero usage of `dangerouslySetInnerHTML`, `eval()`, or inline event handlers across all React components.

---

## 11. Calibrated Benchmark Seed State (Day 8 Calibration)
- **Context**: The master prompt requires a realistic demo state landing in risk tier "Watch" so that:
  - Swiggy ₹399 = `GO FOR IT`
  - Headphones ₹1,299 = `THINK TWICE`
  - Sneakers ₹2,499 = `HARD NO`
- **Decision**: Seed state initialized on Day 8 with starting balance ₹10,000, 7 days of realistic historical spend (chai, groceries, metro, Swiggy, friend's dinner), pending rent share (₹2,500), bike EMI (₹1,000), phone recharge (₹299), active subscriptions (Netflix, Spotify, Gym), upcoming freelance income (₹2,000), and a "Goa Trip" goal. This precisely creates a baseline allowance (~₹312/day) where ₹399 stays within reasonable bounds, ₹1,299 triggers alert thresholds, and ₹2,499 triggers severe deficit warnings.

---

## 12. Prerendered Static Architecture for Zero Latency
- **Context**: Consumers expect sub-second page loads and zero layout shift on mobile devices.
- **Decision**: Next.js App Router configured with static prerendering across all routes. Store rehydration is decoupled using `skipHydration: true` with an interactive client mount hook, presenting a skeleton screen during initial hydration to prevent visual pop-in or React hydration mismatches.
