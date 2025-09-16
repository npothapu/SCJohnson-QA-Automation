import { test, expect } from '@playwright/test';

test.describe('desktop footer navigation impact stories', () => {
  test('navigates to Impact Stories via footer link', { tag: ['@desktop', '@footer', '@impact-stories'] }, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
    }
    const footer = page.locator('footer');
    await footer.waitFor();
    const link = footer.getByRole('link', { name: 'Impact Stories', exact: true });
    await link.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      link.click(),
    ]);
    await expect(page).toHaveURL(/\/stories(?:\/)?$/);
    await expect(page).toHaveTitle('Plastic Stories: Global Efforts to Fight Plastic Waste');
  });
});
