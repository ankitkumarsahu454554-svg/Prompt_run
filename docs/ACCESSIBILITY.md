# WCAG 2.2 Level AA Accessibility Conformance Specification

This document details the compliance architecture and verification evidence for every applicable WCAG 2.2 Level AA success criterion implemented in **Broke But Functional — Survive the Month**.

---

## 1. Compliance Matrix

| WCAG 2.2 AA Criterion | Requirement | Implementation in Application | Implementation Files | Automated Verification |
| :--- | :--- | :--- | :--- | :--- |
| **1.1.1 Non-text Content** | Text alternatives for non-text content | All hand-built charts have `role="img"`, descriptive `aria-label`, and accessible fallback semantic `<table>` elements. | `src/components/charts/LineChart.tsx`<br>`src/components/charts/Gauge.tsx`<br>`src/components/charts/DonutChart.tsx` | `e2e/a11y.spec.ts`<br>`tests/components/Views.test.tsx` |
| **1.3.1 Info & Relationships** | Structure and relationships conveyed programmatically | Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`), single `<h1>` per page, explicit `<label htmlFor="...">` associations. | `src/components/layout/AppShell.tsx`<br>`src/components/ui/Input.tsx`<br>`src/features/expenses/AddExpenseModal.tsx` | `e2e/a11y.spec.ts`<br>`tests/components/AddExpense.test.tsx` |
| **1.3.2 Meaningful Sequence** | Correct programmatic reading sequence | DOM ordering strictly matches visual layout; modals rendered in logical tab sequence. | `src/components/layout/AppShell.tsx` | `e2e/keyboard.spec.ts` |
| **1.4.1 Use of Color** | Color is not used as the only visual means of conveying information | Every status, verdict, and delta pairs color with an icon, mathematical sign (`+` / `-` / `▼` / `▲`), and explicit textual description. | `src/components/ui/RiskBadge.tsx`<br>`src/features/simulator/SimulatorView.tsx`<br>`src/components/feedback/RippleToast.tsx` | `tests/components/RiskBadge.test.tsx`<br>`tests/components/Simulator.test.tsx` |
| **1.4.3 Contrast (Minimum)** | Text contrast $\ge 4.5:1$ (normal) or $\ge 3:1$ (large) | Strict color palette audited via automated token script. Primary fill `#6D4AFF` (5.1:1 on white), dark text `#F4F4F8` on `#0B0B14` (15.65:1). | `tailwind.config.ts`<br>`scripts/check-contrast.mjs` | `npm run check-contrast`<br>(18/18 pairs pass) |
| **1.4.10 Reflow** | Content reflows without 2D scrolling down to 320px width | Fluid grid and flex layouts tested down to 320px with zero horizontal scrollbar. | `src/app/globals.css`<br>`src/components/layout/AppShell.tsx` | `e2e/a11y.spec.ts` (390px project) |
| **1.4.11 Non-text Contrast** | UI components and graphics contrast $\ge 3:1$ | Progress rings, chart paths, focus indicators, and card borders achieve $\ge 3:1$ contrast against adjacent surfaces. | `scripts/check-contrast.mjs` | `npm run check-contrast` |
| **1.4.12 Text Spacing** | No loss of content or function when text spacing is overridden | Relative `rem` units, flexible heights, and overflow handling prevent clipping when line-height and letter-spacing expand. | `src/app/globals.css` | Manual 200% zoom test |
| **2.1.1 Keyboard** | All functionality operable through keyboard interface | Full application journey operable via Tab, Enter, Space, and Arrow keys without pointer reliance. | Entire `/src/features/` suite | `e2e/keyboard.spec.ts` |
| **2.1.2 No Keyboard Trap** | Focus can be moved away from any component | Radix UI dialog modals trap focus inside the open modal and release focus back to the trigger button upon Escape. | `src/components/ui/Dialog.tsx`<br>`src/features/expenses/AddExpenseModal.tsx` | `e2e/keyboard.spec.ts` |
| **2.4.1 Bypass Blocks** | Mechanism to bypass repeated navigation blocks | Pinned `<SkipLink>` component allowing direct jump to `<main id="main-content">`. | `src/components/layout/SkipLink.tsx`<br>`src/components/layout/AppShell.tsx` | `e2e/keyboard.spec.ts` |
| **2.4.3 Focus Order** | Logical and intuitive focus navigation sequence | Tab sequence follows header $\to$ main view $\to$ bottom navigation, with modals taking immediate active focus. | `src/components/layout/AppShell.tsx` | `e2e/keyboard.spec.ts` |
| **2.4.7 Focus Visible** | Visible keyboard focus indicator | High-contrast `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` applied to all interactive controls. | `src/app/globals.css`<br>`src/components/ui/Button.tsx`<br>`src/components/ui/Input.tsx` | `e2e/keyboard.spec.ts` |
| **2.5.3 Label in Name** | Accessible name matches visible text label | "Quick Add" floating trigger button accessible name matches visible text ("Quick Add"). | `src/features/expenses/AddExpenseModal.tsx` | `e2e/a11y.spec.ts` |
| **2.5.8 Target Size (Minimum)** | Interactive target size $\ge 44 \times 44\text{ px}$ | Mobile navigation items, buttons, category chips, and keypad keys have minimum touch dimensions of $44\text{px}$. | `src/components/layout/BottomTabBar.tsx`<br>`src/components/ui/Button.tsx` | `e2e/a11y.spec.ts` |
| **3.2.1 On Focus** | Receiving focus does not trigger unexpected change of context | Selecting an input or tabbing across tabs never mutates financial state or redirects routes without explicit activation. | Entire `/src/features/` suite | `e2e/journey.spec.ts` |
| **3.3.1 Error Identification** | Input errors clearly identified and described | Amount parsing failures and empty note errors display visible error messages with `role="alert"` and red iconography. | `src/features/expenses/AddExpenseModal.tsx`<br>`src/components/ui/Input.tsx` | `tests/components/AddExpense.test.tsx` |
| **3.3.2 Labels or Instructions** | Explicit labels and instructions provided for user input | Every `<Input>` provides an explicit `<label>`, helper description via `aria-describedby`, and required indicators. | `src/components/ui/Input.tsx`<br>`src/features/expenses/AddExpenseModal.tsx` | `tests/components/AddExpense.test.tsx` |
| **4.1.2 Name, Role, Value** | Programmatic accessibility for all custom controls | Radix UI primitives provide standard roles (`role="dialog"`, `role="tablist"`, `role="switch"`, `role="status"`). | `src/components/ui/Dialog.tsx`<br>`src/components/ui/Tabs.tsx`<br>`src/components/ui/Switch.tsx` | `e2e/a11y.spec.ts` |
| **4.1.3 Status Messages** | Asynchronous status updates presented to assistive technologies | `ImpactBar` uses `aria-live="polite"` with debounced final values; `RippleToast` uses `role="status"` without count-up animation spam. | `src/components/layout/ImpactBar.tsx`<br>`src/components/feedback/RippleToast.tsx`<br>`src/lib/format.ts` | `tests/components/RippleToast.test.tsx` |

---

## 2. Screen Reader Audio Optimization

To prevent robotic or ambiguous screen-reader announcements like *"INR 3 1 2"* or *"Indian Rupee three hundred twelve"*, the application implements dual visual/audio rendering:

- **Visible Text**: `₹312` with `<span aria-hidden="true">₹</span>`
- **Assistive Technology Text**: `<span className="sr-only">312 rupees</span>`
- **Implemented in**: `src/lib/format.ts` (`formatPaiseSr` and `formatRupeesSr`).

---

## 3. Motion & Cognitive Preferences

- **`prefers-reduced-motion`**: Handled globally in `src/app/globals.css` and inside `useCountUp` hook:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- **Live Numbers**: Counters immediately snap to final values under reduced motion, avoiding visual disorientation.
