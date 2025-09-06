import { test, expect } from "@playwright/test";
import { closeCookieBanner, resizePage } from '../../utils/helpers/helpers';

test.describe('Desktop - Visual Tests', () => {  

  test('Desktop - Home @visual', async ({ page, baseURL }) => {
    // Use the baseURL from the Playwright configuration
    if (!baseURL) {
      throw new Error("baseURL is not defined. Check Playwright configuration.");
    }
    await page.goto(baseURL);
    await closeCookieBanner(page);
    await resizePage(page);
    await expect(page).toHaveTitle(/.*Teen Market Research | Gen Z Reports &amp; Surveys | TeenVoice/);
    await expect(page).toHaveScreenshot('visual/desktop/' + process.env.NODE_ENV + '/home.png', {
      maxDiffPixels: 25,
      fullPage: true
    });
  });

});