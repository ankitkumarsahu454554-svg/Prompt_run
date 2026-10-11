# ADR 0003: Hand-Crafted SVG Charts with Accessible HTML Fallbacks

## Status
Accepted

## Context
Third-party charting libraries (Recharts, Chart.js, D3) introduce 150KB–300KB of JavaScript, drag down Core Web Vitals (INP, LCP), and generate canvas or SVG elements that fail automated screen-reader and WCAG accessibility standards.

## Decision
All charts (`Sparkline`, `ProgressRing`, `Gauge`, `LineChart`, `DonutChart`) are hand-crafted, zero-dependency SVG components located in `src/components/charts/`.
- Every chart embeds dual representations: an SVG graphic for sighted users and a hidden semantic HTML `<table>` with proper `<caption>`, `<th>`, and `<td>` tags for screen readers.
- Fixed aspect ratios and `viewBox` bounding boxes prevent Cumulative Layout Shift (CLS = 0.00).

## Consequences
- **Positive**: Zero external chart dependency bloat; shared initial JS bundle kept to ~103 kB; 100% accessible under WCAG 2.2 AA with zero Axe violations.
- **Negative**: Requires maintaining mathematical coordinate projections (`path` bezier and arc curves) directly in TypeScript.
