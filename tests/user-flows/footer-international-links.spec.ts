import { test, expect } from '@playwright/test';

test.describe('Footer International Links Validation', () => {
  test('should validate US, France, and UK footer links return 200 status', {
    tag: ["@webtest", "@footer", "@international", "@http-status"]
  }, async ({ page, baseURL }) => {
    if (!baseURL) {
      throw new Error('baseURL is not configured in Playwright config');
    }
    
    await page.goto('/');
    
    await page.waitForLoadState('domcontentloaded');
    
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await footer.scrollIntoViewIfNeeded();
    
    const usLink = footer.getByRole('link', { name: /contact us/i });
    await expect(usLink).toBeVisible();
    
    const usHref = await usLink.getAttribute('href');
    expect(usHref).toBeTruthy();
    
    const usResponse = await page.request.get(usHref!);
    expect(usResponse.status()).toBe(200);
    
    const frResponse = await page.request.get(`${baseURL}/fr`);
    expect(frResponse.status()).toBe(200);
    
    const ukResponse = await page.request.get(`${baseURL}/uk`);
    expect(ukResponse.status()).toBe(200);
  });
});