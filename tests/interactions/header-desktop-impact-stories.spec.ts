import { test, expect } from '@playwright/test';

test.describe('desktop header navigation impact stories', () => {
  test('navigates to Impact Stories via header link', { tag: ['@desktop', '@header', '@impact-stories'] }, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
    }
    const link = page.getByRole('link', { name: 'Impact Stories', exact: true });
    await link.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      link.click(),
    ]);
    await expect(page).toHaveURL(/\/stories(?:\/)?$/);
    await expect(page).toHaveTitle('Plastic Stories: Global Efforts to Fight Plastic Waste');
  });
});
