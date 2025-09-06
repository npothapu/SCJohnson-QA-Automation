import { test, expect } from "@playwright/test";

test.describe("Content Validation", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Ensure baseURL is defined
    if (!baseURL) {
      throw new Error("baseURL is not defined. Check Playwright configuration.");
    }
    // Navigate to the baseURL before each test
    await page.goto(baseURL);
  });

  test("should have a title", async ({ page }) => {
    const title = await page.title();
    expect(title).toBe("Hacker News");
  });
});
