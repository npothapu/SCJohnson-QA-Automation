import { test, expect, Page } from '@playwright/test';
import { siteLinks } from '../../utils/data/siteLinks';

const pages = siteLinks.map(l => ({
  name: l.name,
  expectedUrl: l.expectedUrl,
  tag: ['@webtest', '@regression', '@mobile', '@content-crawl', `@${l.name.replace(/\s+/g,'-').toLowerCase()}`]
}));

async function dismissCookies(page: Page) {
  const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
}

test.describe('mobile content link integrity', () => {
  for (const p of pages) {
    test(`crawls internal links on ${p.name} page (mobile)`, { tag: p.tag }, async ({ page, request, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      await page.goto(p.expectedUrl, { waitUntil: 'domcontentloaded' });
      await dismissCookies(page);
      const linkElements = await page.$$('a');
      const rawHrefs = await Promise.all(linkElements.map(el => el.getAttribute('href')));
      const pageOrigin = new URL(page.url()).origin;
      const hrefs: string[] = Array.from(new Set(
        rawHrefs.filter((h): h is string => {
          if (!h) return false;
          if (h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return false;
          if (h === '#' || h.startsWith('#')) return false;
          if (/^https?:\/\//i.test(h)) {
            try { return new URL(h).origin === pageOrigin; } catch { return false; }
          }
          return true;
        })
      ));
      const failures: { href: string; status: number | string }[] = [];
      for (const href of hrefs) {
        const absolute = href.startsWith('/') ? new URL(href, page.url()).toString() : new URL(href, page.url()).toString();
        try {
          const response = await request.get(absolute);
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
});
