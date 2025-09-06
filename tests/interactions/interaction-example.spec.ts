import { test, expect } from "@playwright/test";

test("sample interaction test", async ({ page, baseURL }) => {
  // Ensure baseURL is defined
  if (!baseURL) {
    throw new Error("baseURL is not defined. Check Playwright configuration.");
  }

  // Navigate to the baseURL
  await page.goto(baseURL);

  // Simulate user interaction
  await page.getByRole("link", { name: "past", exact: true }).click();

  // Validate the URL contains the expected string
  expect(page.url().includes("past")).toBeTruthy();
});
// This test is a good example of an interaction test because it simulates a user interaction with a web page.
// It clicks on a link and then checks if the URL contains the expected string.
