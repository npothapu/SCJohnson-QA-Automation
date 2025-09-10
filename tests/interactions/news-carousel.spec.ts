import { test, expect } from '@playwright/test';

test('@carousel interaction: clicking auto-advancing item validates URL and 200 status', async ({ page, context }) => {
  await page.goto('https://www.blueparadox.com/');

  // Accept cookies if present
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
  }

  // Skip intro if present
  const skipButton = page.getByRole('button', { name: 'Skip' });
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click();
  }

  // Wait for the carousel button to be visible (not stable)
  const carouselBtn = page.getByRole('button', { name: 'Blood samples in a labratory' }).first();
  await expect(carouselBtn).toBeVisible();

  // Use force: true to click moving carousel item
  const popupPromise = page.waitForEvent('popup');
  await carouselBtn.click({ force: true });
  const popup = await popupPromise;

  const expectedUrl = 'https://www.weforum.org/stories/2025/02/how-microplastics-get-into-the-food-chain/';
  await expect(popup.url()).toContain(expectedUrl);

  const response = await context.request.get(expectedUrl);
  expect(response.status()).toBe(200);

  await popup.close();
});