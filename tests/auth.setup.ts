import { test as setup } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
// Keep .env loading consistent with playwright.config.ts
dotenv.config({ path: "./utils/env/.env" });

const authFile = path.join(__dirname, "../playwright/.auth/user.json");
// Normalize ENV to uppercase and default to STG to match playwright.config.ts
const ENV = (process.env.ENV || "STG").toUpperCase();

setup("authenticate", async ({ page }) => {
  if (ENV !== "STG") {
    // Skip auth setup on non-STG environments; avoids console logging and uses reporter-visible skip instead
    setup.skip(true, `Skipping authentication setup for ENV=${ENV}`);
  }
  if (ENV === "STG") {
    const baseUrl = process.env.STG_BASE_URL;
    if (!baseUrl) {
      throw new Error("STG_BASE_URL is not defined. Check your environment variables.");
    }
    await page.goto(baseUrl);

    const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
    }
    await page.context().storageState({ path: authFile });
  }
});