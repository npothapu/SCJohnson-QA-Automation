import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

const flows = siteLinks.map(l => ({
  name: l.name,
  expectedUrl: l.expectedUrl,
  expectedTitle: l.expectedTitle,
  tag: ['@mobile', '@footer', '@regression', `@${l.name.replace(/\s+/g,'-').toLowerCase()}`]
}));

test.describe('mobile footer navigation', () => {
  for (const flow of flows) {
    test(`navigates to ${flow.name} from mobile footer`, { tag: flow.tag }, async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
      if (await acceptCookies.isVisible()) {
        await acceptCookies.click();
      }
      const footer = page.locator('footer');
      await footer.waitFor();
      const link = footer.getByRole('link', { name: flow.name, exact: true });
      await link.scrollIntoViewIfNeeded();
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        link.click(),
      ]);
      await expect(page).toHaveURL(new RegExp(`${flow.expectedUrl.replace(/\//g, '\\/')}(?:/)?$`));
      await expect(page).toHaveTitle(flow.expectedTitle);
    });
  }
});
