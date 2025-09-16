import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
});

test.describe.configure({ mode: 'serial' });

for (const link of siteLinks) {
  test(
    `@header-navigation @smoke @regression @${link.name} should navigate to ${link.expectedTitle} from ${link.name}`,
    async ({ page, isMobile }) => {
      if (isMobile) {
        await page.getByRole('button', { name: 'Menu' }).click();
      }
      const target = page.getByRole('link', { name: link.name, exact: true });
      await target.scrollIntoViewIfNeeded();
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        target.click(),
      ]);
      await expect(page).toHaveURL(new RegExp(`${link.expectedUrl.replace(/\//g, '\\/')}(?:/)?$`));
      await expect(page).toHaveTitle(link.expectedTitle);
    }
  );
}