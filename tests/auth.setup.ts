import { test as setup } from "@playwright/test";
import path from "path";
require('dotenv').config();

const authFile = path.join(__dirname, "../playwright/.auth/user.json");
const ENV = process.env.ENV || "PROD";

setup("authenticate", async ({ page }) => {
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
  } else {
    console.log("Production environment detected, skipping authentication setup.");
  }
});