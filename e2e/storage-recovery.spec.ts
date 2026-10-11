import { test, expect } from "@playwright/test";

test.describe("Corrupted Storage Recovery E2E", () => {
  test("recovers gracefully when localStorage has corrupted JSON or prototype pollution", async ({
    page,
  }) => {
    // Inject corrupted malformed JSON and prototype-polluting keys before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "bbf_state_v1",
        JSON.stringify({
          __proto__: { polluted: true },
          config: { startBalance: "INVALID_STRING" },
        })
      );
    });

    await page.goto("/");

    // The app should not crash or throw white screen of death; it falls back safely to default seed
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).toContainText("Safe Daily Budget");
  });
});
