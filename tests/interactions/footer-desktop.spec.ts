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
  test(`@footer-navigation @smoke should navigate to ${link.expectedTitle} from footer link ${link.name}`, async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const footer = page.locator('footer');
    await footer.waitFor();
    const target = footer.getByRole('link', { name: link.name, exact: true });
    await target.scrollIntoViewIfNeeded();
    await target.waitFor({ state: 'visible' });
    await target.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(new RegExp(`${link.expectedUrl.replace(/\//g, '\\/')}(?:/)?$`));
    await expect(page).toHaveTitle(link.expectedTitle);
  });
}