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
  test(
    `@header-navigation @smoke @regression @${link.name} should navigate to ${link.expectedTitle} from ${link.name}`,
    async ({ page, isMobile }) => {
      if (isMobile) {
        await page.getByRole('button', { name: 'Menu' }).click();
      }
      await page.getByRole('menuitem', { name: link.name }).click();
      await expect(page).toHaveTitle(link.expectedTitle);
      if (link.expectedUrl) {
        await expect(page).toHaveURL(link.expectedUrl);
      }
    }
  );
}