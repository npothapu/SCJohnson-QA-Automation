import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

const flows = siteLinks.map(l => ({
  name: l.name,
  expectedUrl: l.expectedUrl,
  expectedTitle: l.expectedTitle,
  tag: ['@mobile', '@header', '@regression', `@${l.name.replace(/\s+/g,'-').toLowerCase()}`]
}));

test.describe('mobile header navigation', () => {
  for (const flow of flows) {
    test(`navigates to ${flow.name} from mobile header`, { tag: flow.tag }, async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
      if (await acceptCookies.isVisible()) {
        await acceptCookies.click();
      }
      const menuButton = page.getByRole('button', { name: 'Menu' });
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
      const item = page.getByRole('menuitem', { name: flow.name, exact: true });
      await item.waitFor();
      await item.focus();
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        page.keyboard.press('Enter'),
      ]);
      await expect(page).toHaveURL(new RegExp(`${flow.expectedUrl.replace(/\//g, '\\/')}(?:/)?$`));
      await expect(page).toHaveTitle(flow.expectedTitle);
    });
  }
});
