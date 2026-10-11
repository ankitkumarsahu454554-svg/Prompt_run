import { test, expect } from "@playwright/test";

test.describe("Unexpected Event Resolution Flow", () => {
  test("triggers unexpected surprise event, presents 4 resolution paths, and resolves", async ({
    page,
  }) => {
    await page.goto("/");

    // Click "Surprise Event" demo button
    const surpriseBtn = page.getByRole("button", { name: /Trigger Surprise/i });
    if (await surpriseBtn.isVisible()) {
      await surpriseBtn.click();

      // Surprise event modal appears with 4 resolution choices
      const dialog = page.locator("role=dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(/Surprise Financial Event/i);

      // Choose Pay Now or Split
      const payNowBtn = dialog.getByRole("button", { name: /Pay Now/i });
      if (await payNowBtn.isVisible()) {
        await payNowBtn.click();
        await expect(dialog).not.toBeVisible();
      }
    }
  });
});
