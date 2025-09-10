import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
});

for (const link of siteLinks) {
  test(`@footer-navigation should navigate to ${link.expectedTitle} from footer link ${link.name}`, async ({ page }) => {
    await page.getByRole('link', { name: link.name }).click();
    await expect(page).toHaveTitle(link.expectedTitle);
    await expect(page).toHaveURL(link.expectedUrl);
  });
}