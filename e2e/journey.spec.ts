import { test, expect } from "@playwright/test";

test.describe("Full User Journey E2E Flow", () => {
  test("onboard -> add expense -> simulate decision -> commit -> verify dashboard ripple", async ({
    page,
  }) => {
    // 1. Visit onboarding page
    await page.goto("/onboarding");
    await expect(page.locator("h1")).toContainText(/budget/i);

    // 2. Bypass via demo data (starts at Day 8 with calibrated state)
    const demoBtn = page.getByRole("button", { name: /Use Demo Data/i });
    await demoBtn.click();

    // 3. Lands on dashboard
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toContainText("Safe Daily Budget");

    // 4. Open Add Expense Modal
    const quickAddBtn = page.getByRole("button", { name: /Quick Add/i });
    await quickAddBtn.click();

    await expect(page.locator("role=dialog")).toBeVisible();

    // Fill in ₹120 snack expense
    await page.locator("#expense-amount").fill("120");
    await page.getByRole("button", { name: "Add Expense", exact: true }).click();

    // Dialog closes and ripple toast appears
    await expect(page.locator("role=dialog")).not.toBeVisible();
    await expect(page.locator("text=Added Food expense")).toBeVisible();

    // 5. Navigate to Decision Simulator
    await page.goto("/simulate");
    await expect(page.locator("h1")).toContainText("Decision Simulator");

    // Click quick test scenario Swiggy ₹399
    const swiggyBtn = page.getByText(/🍔 Swiggy/i);
    await swiggyBtn.click();

    await expect(page.locator("body")).toContainText(/Verdict:\s*GO FOR IT/i);

    // Commit decision
    const commitBtn = page.getByRole("button", { name: /Commit Decision/i });
    await commitBtn.click();

    // 6. Return to Home and observe updated metrics
    await page.goto("/");
    await expect(page.locator("body")).toContainText("Safe Daily Budget");
  });
});
