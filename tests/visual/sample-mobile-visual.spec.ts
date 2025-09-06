import { test, expect, devices } from "@playwright/test";
import { closeCookieBanner, resizePage } from '../../utils/helpers/helpers';

const iPhone11 = devices['iPhone 11'];
test.use(iPhone11);

test.describe('Mobile - Visual Tests', () => { 

  test('Mobile - Home @visual', async ({ page, baseURL }) => {
    // Use the baseURL from the Playwright configuration
    if (!baseURL) {
      throw new Error("baseURL is not defined. Check Playwright configuration.");
    }
    await page.goto(baseURL);
    await closeCookieBanner(page);
    await resizePage(page);
    await expect(page).toHaveTitle(/.*Teen Market Research | Gen Z Reports &amp; Surveys | TeenVoice/);
    await expect(page).toHaveScreenshot('visual/mobile/' + process.env.NODE_ENV + '/home.png', {
      fullPage: true,
      maxDiffPixels: 25
    });
  });

});