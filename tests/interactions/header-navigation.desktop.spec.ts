import { test, expect } from '@playwright/test';
require('dotenv').config();

const ENV = process.env.ENV || "PROD";
const BASE_URL = ENV === "STG"
  ? process.env.STG_BASE_URL
  : process.env.PROD_BASE_URL;

const headerLinks = [
  { name: 'Impact Stories', expectedTitle: 'Plastic Stories: Global Efforts to Fight Plastic Waste' },
  { name: 'Join Zuzu', expectedTitle: 'Join Zuzu: The Little Crab on a Mission to End Plastic Waste' },
  { name: 'Paradox of Plastic', expectedTitle: 'The Paradox of Plastic: Microplastics, Our Health, and Global Impact' },
  { name: 'Get Involved', expectedTitle: 'Get Involved - Sign the Petition to End Plastic Waste' },
];

test.describe('Header Navigation - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    if (!BASE_URL) throw new Error("BASE_URL is not set in environment variables!");
    await page.goto(BASE_URL);
    const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
    }
  });

  for (const link of headerLinks) {
    test(`"${link.name}" link navigates to correct page @desktop @smoke @regression`, async ({ page }) => {
      await page.getByRole('menuitem', { name: link.name }).click();
      await expect(page).toHaveTitle(link.expectedTitle);
    });
  }
});