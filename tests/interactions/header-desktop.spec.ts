import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

const flows = siteLinks.map((l) => ({
  name: l.name,
  expectedUrl: l.expectedUrl,
  expectedTitle: l.expectedTitle,
  tag: [
    '@desktop',
    '@header',
    '@regression',
    `@${l.name.replace(/\s+/g, '-').toLowerCase()}`,
  ],
}));

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
});

test.describe('desktop header navigation', () => {
  for (const flow of flows) {
    test(
      `navigates to ${flow.name} via header`,
      { tag: flow.tag },
      async ({ page }) => {
        const target = page.getByRole('link', { name: flow.name, exact: true });
        await target.scrollIntoViewIfNeeded();
        await Promise.all([
          page.waitForLoadState('domcontentloaded'),
          target.click(),
        ]);
        await expect(page).toHaveURL(
          new RegExp(`${flow.expectedUrl.replace(/\//g, '\\/')}(?:/)?$`)
        );
        await expect(page).toHaveTitle(flow.expectedTitle);
      }
    );
  }
});