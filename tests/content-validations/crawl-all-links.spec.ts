import { test, expect } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
});

for (const link of siteLinks) {
  test(`@link-crawl crawl all links on ${link.name} page`, async ({ page, request }) => {
    await page.goto(link.expectedUrl, { waitUntil: 'domcontentloaded' });

    const linkElements = await page.$$('header a, footer a, a');
    const rawHrefs = await Promise.all(linkElements.map(el => el.getAttribute('href')));
    const pageOrigin = new URL(page.url()).origin;

    const hrefs: string[] = Array.from(new Set(
      rawHrefs.filter((h): h is string => {
        if (!h) return false;
        if (h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return false;
        if (h === '#' || h.startsWith('#')) return false;
        if (h.startsWith('http://') || h.startsWith('https://')) {
          try {
            return new URL(h).origin === pageOrigin;
          } catch {
            return false;
          }
        }
        return true;
      })
    ));

    const failures: { href: string, status: number | string }[] = [];

    for (const href of hrefs) {
      let url: string = href;
      if (url.startsWith('/')) {
        url = new URL(url, page.url()).toString();
      }
      try {
        const response = await request.get(url);
        const status = response.status();
        if (status < 200 || status >= 400) {
          failures.push({ href, status });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!/Target page, context or browser has been closed/i.test(msg)) {
          failures.push({ href, status: msg });
        }
      }
    }

    expect(failures, `Broken links: ${JSON.stringify(failures, null, 2)}`).toEqual([]);
  });
}