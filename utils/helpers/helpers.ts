import { Page } from 'playwright';

export async function closeCookieBanner(page: Page) {
  const cookieBanner = await page.getByRole('button', { name: 'Close this dialog' }).isVisible();
    if (cookieBanner) {
      await page.getByRole('button', { name: 'Close this dialog' }).click({delay: 1000});
    }else{
      ;
    };
};

export async function resizePage(page: Page) {
  const fullPageSize = await page.evaluate(() => {
    return {
      width: Math.max(
          document.body.scrollWidth, document.documentElement.scrollWidth,
          document.body.offsetWidth, document.documentElement.offsetWidth,
          document.body.clientWidth, document.documentElement.clientWidth
      ),
      height: Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
      ),
    };
  });
  await page.setViewportSize(fullPageSize);
};