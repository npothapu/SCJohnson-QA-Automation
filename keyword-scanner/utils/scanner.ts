//Core Scanning Logic
import { Page } from '@playwright/test';
import { escapeRegExp, delay } from './helpers';

export type KeywordMatch = {
url: string;
keyword: string;
location: string;
context: string;
};

export class WebsiteScanner {
private results: KeywordMatch[] = [];
private visitedUrls = new Set<string>();
private keywords: string[];
private caseSensitive: boolean;
private pendingUrls: string[];
private baseUrl: string;
private maxPages: number;

constructor(keywords: string[], caseSensitive: boolean = false, baseUrl: string, maxPages: number) {
  this.keywords = keywords;
  this.caseSensitive = caseSensitive;
  this.baseUrl = baseUrl;
  this.maxPages = maxPages;
  this.pendingUrls = [baseUrl];
}

checkForKeywords(text: string, location: string, currentUrl: string): void {
  if (!text) return;

  const searchText = this.caseSensitive ? text : text.toLowerCase();

  for (const keyword of this.keywords) {
    const searchKeyword = this.caseSensitive ? keyword : keyword.toLowerCase();
    
    // Enhanced regex with better word boundary handling
    // This handles multi-word keywords and special characters better
    const escapedKeyword = escapeRegExp(searchKeyword);
  
    // For multi-word keywords, replace spaces with flexible whitespace matching
    const regexPattern = escapedKeyword.replace(/\\\s+/g, '\\s+');
  
    // Use word boundaries, but handle edge cases for special characters
    const regex = new RegExp(
        `(?<!\\w)${regexPattern}(?!\\w)`, 
        this.caseSensitive ? 'g' : 'gi'
    );

    let match;
    regex.lastIndex = 0;
    
    while ((match = regex.exec(searchText)) !== null) {
      const matchIndex = match.index;
      
      // Get better context - preserve original case from source text
        let startIndex = Math.max(0, matchIndex - 50);
        let endIndex = Math.min(text.length, matchIndex + match[0].length + 50);
        let contextSnippet = text.substring(startIndex, endIndex);
    
        if (startIndex > 0) contextSnippet = '...' + contextSnippet;
        if (endIndex < text.length) contextSnippet += '...';
      
      this.results.push({
        url: currentUrl,
        keyword,
        location,
        context: contextSnippet
      });
      
      // Prevent infinite loops
    if (regex.lastIndex === matchIndex) {
      regex.lastIndex++;
    }
    }
  }
}

async scanPage(page: Page, url: string): Promise<any[]> {
  console.log(`Scanning page ${this.visitedUrls.size}/${this.maxPages}: ${url}`);
  
  // Add rate limiting delay before loading each page
  await delay(1000); // Wait 1 second between requests - adjust as needed

  // Navigate to the page
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Check URL for keywords
  this.checkForKeywords(url, 'url', url);
  
  // Check page title
  const title = await page.title();
  this.checkForKeywords(title, 'title', url);
  
  // Check meta tags
  const metaTags = await page.$$eval('meta[name], meta[property]', metas => {
    return metas.map(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
      const content = meta.getAttribute('content') || '';
      return { name, content };
    });
  });
  
  for (const meta of metaTags) {
    this.checkForKeywords(meta.content, `meta:${meta.name}`, url);
  }
  
  // Check all text content on the page
  const bodyText = await page.$eval('body', body => body.innerText);
  this.checkForKeywords(bodyText, 'content', url);
  
  // Check HTML source
  const htmlContent = await page.content();
  this.checkForKeywords(htmlContent, 'html', url);
  
  // Extract and check link text
  const links = await page.$$eval('a[href]', (anchors: HTMLAnchorElement[]) => {
    return anchors.map(anchor => ({
      href: anchor.href,
      text: anchor.innerText.trim(),
    }));
  });
  
  for (const link of links) {
    this.checkForKeywords(link.text, 'link-text', url);
  }
  
  return links;
}

// Main scanning loop method
async runScan(page: Page, robotsTxt: any): Promise<void> {
  while (this.pendingUrls.length > 0 && this.visitedUrls.size < this.maxPages) {
    const url = this.pendingUrls.shift()!;

    // Skip if already visited or external
    if (this.visitedUrls.has(url) || !url.startsWith(this.baseUrl)) {
      continue;
    }

    // Check robots.txt rules
    if (robotsTxt && !robotsTxt.isAllowed(url, 'PlaywrightBot')) {
      console.log(`Skipping ${url} - disallowed by robots.txt`);
      continue;
    }

    this.visitedUrls.add(url);

    try {
      const links = await this.scanPage(page, url);
      
      // Add link to pending URLs if it's on the same domain
      for (const link of links) {
        try {
          const linkUrl = new URL(link.href);
          const baseUrl = new URL(this.baseUrl);
          
          if (linkUrl.hostname === baseUrl.hostname && !this.visitedUrls.has(link.href)) {
            this.pendingUrls.push(link.href);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
      
    } catch (error) {
      console.error(`Error scanning ${url}: ${error}`);
    }
  }
}

getResults(): KeywordMatch[] {
  return this.results;
}

getVisitedUrls(): Set<string> {
  return this.visitedUrls;
}

addVisitedUrl(url: string): void {
  this.visitedUrls.add(url);
}

getPendingUrls(): string[] {
  return this.pendingUrls;
}
}