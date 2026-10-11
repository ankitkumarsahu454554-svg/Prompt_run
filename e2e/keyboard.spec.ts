import { test, expect } from "@playwright/test";

test.describe("Keyboard Navigation & Focus Trap Journey", () => {
  test("navigates with keyboard, traps focus in dialog, and restores focus on Escape", async ({
    page,
  }) => {
    await page.goto("/");

    // Skip to main content link should be reachable
    const skipLink = page.getByRole("link", { name: /Skip to main content/i });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Open Add Expense modal via Quick Add button
    const quickAddBtn = page.getByRole("button", { name: /Quick Add/i });
    await quickAddBtn.focus();
    await page.keyboard.press("Enter");

    // Modal is open; focus should be inside the dialog
    const dialog = page.locator("role=dialog");
    await expect(dialog).toBeVisible();

    // Press Escape to dismiss dialog
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Focus restored to trigger
    await expect(quickAddBtn).toBeFocused();
  });
});
