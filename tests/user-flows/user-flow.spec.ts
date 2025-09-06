import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  // Ensure baseURL is defined
  if (!baseURL) {
    throw new Error("baseURL is not defined. Check Playwright configuration.");
  }

  // Navigate to the baseURL before each test
  await page.goto(baseURL);
});

test("User login and logout test", async ({ page }) => {
  // Simulate user login
  await page.getByRole("textbox", { name: "Username" }).fill("tomsmith");
  await page
    .getByRole("textbox", { name: "Password" })
    .fill("SuperSecretPassword!");
  await page.getByRole("button", { name: "Login" }).click();

  // Validate successful login
  await expect(page.getByText("Secure Area", { exact: true })).toBeVisible();

  // Simulate user logout
  await page.getByRole("link", { name: "Logout" }).click();

  // Validate successful logout
  await expect(page.getByRole("heading", { name: "Login Page" })).toBeVisible();
});

// This test is a good example of a user flow test because it simulate a user logging in, 
// checking if the user is redirected to the secure area, and then logging out and checking if the user is redirected back to the login page.
