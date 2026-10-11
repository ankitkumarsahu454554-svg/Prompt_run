import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/simulate",
  "/plans",
  "/forecast",
  "/insights",
  "/settings",
  "/onboarding",
];

test.describe("Automated Accessibility Audits (Axe Core WCAG 2.2 AA)", () => {
  for (const route of ROUTES) {
    test(`zero axe violations on route ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
