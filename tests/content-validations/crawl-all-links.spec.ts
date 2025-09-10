import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
});

for (const link of siteLinks) {
  test(`@link-crawl crawl all links on ${link.name} page`, async ({ page, request }) => {
    await page.goto(link.expectedUrl);

    const linkElements = await page.$$('header a, footer a, a');
    let hrefs = await Promise.all(linkElements.map(el => el.getAttribute('href')));
    hrefs = Array.from(new Set(hrefs.filter(h => h && !h.startsWith('mailto:') && !h.startsWith('tel:'))));

    const failures: { href: string, status: number | string }[] = [];

    for (const href of hrefs) {
      let url = href;
      if (url && url.startsWith('/')) {
        url = new URL(url, page.url()).toString();
      }
      try {
        const response = await request.get(url);
        if (response.status() !== 200) {
          failures.push({ href: href ?? '', status: response.status() });
        }
      } catch (e) {
        failures.push({ href: href ?? '', status: e instanceof Error ? e.message : String(e) });
      }
    }

    expect(failures, `Broken links: ${JSON.stringify(failures, null, 2)}`).toEqual([]);
  });
}