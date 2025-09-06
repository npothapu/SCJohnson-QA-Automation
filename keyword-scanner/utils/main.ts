import { Page } from '@playwright/test';
import keywordsConfig from '../keywords.json';
import { WebsiteScanner } from './scanner';
import { delay, setupConsoleErrorHandling} from './helpers';
import { loadRobotsTxt, isUrlAllowed } from './robots';
import { createResultsDirectory, generateTimestamp } from './file-utils';
import { generateCSV } from './csv-generator';
import { generateHtmlReport } from './html-generator';

export async function scanWebsite(page: Page) {
// Configuration
const BASE_URL = keywordsConfig.baseUrl;
const MAX_PAGES = keywordsConfig.maxPages;
const KEYWORDS = keywordsConfig.keywords;
const CASE_SENSITIVE = keywordsConfig.caseSensitive;

console.log(`Starting scan of ${BASE_URL} for keywords: ${KEYWORDS.join(', ')}`);

// Initialize scanner
const scanner = new WebsiteScanner(KEYWORDS, CASE_SENSITIVE, BASE_URL, MAX_PAGES);
const pendingUrls: string[] = [BASE_URL];

// Setup
setupConsoleErrorHandling(page);
const robotsTxt = await loadRobotsTxt(BASE_URL);

// Main scanning loop
while (pendingUrls.length > 0 && scanner.getVisitedUrls().size < MAX_PAGES) {
  const url = pendingUrls.shift()!;

  // Skip if already visited or external
  if (scanner.getVisitedUrls().has(url) || !url.startsWith(BASE_URL)) {
    continue;
  }

  // Check robots.txt rules
  if (!isUrlAllowed(robotsTxt, url)) {
    console.log(`Skipping ${url} - disallowed by robots.txt`);
    continue;
  }

  scanner.addVisitedUrl(url);
  console.log(`Scanning page ${scanner.getVisitedUrls().size}/${MAX_PAGES}: ${url}`);

  try {
    await delay(1000);
    const links = await scanner.scanPage(page, url);
    
    // Add links to pending URLs
    for (const link of links) {
      try {
        const linkUrl = new URL(link.href);
        const baseUrl = new URL(BASE_URL);
        
        if (linkUrl.hostname === baseUrl.hostname && !scanner.getVisitedUrls().has(link.href)) {
          pendingUrls.push(link.href);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
  } catch (error) {
    console.error(`Error scanning ${url}: ${error}`);
  }
}

// Generate reports
const resultsDir = createResultsDirectory();
const timestamp = generateTimestamp();
const results = scanner.getResults();

// Save JSON results
const fs = require('fs');
const path = require('path');
const resultsFile = path.join(resultsDir, `keyword-scan-${timestamp}.json`);
fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

// Generate reports
generateCSV(results, resultsDir, timestamp);
generateHtmlReport(results, resultsDir, timestamp, BASE_URL, KEYWORDS, scanner.getVisitedUrls().size);

console.log(`\nScan complete! Scanned ${scanner.getVisitedUrls().size} pages.`);
console.log(`Found ${results.length} keyword matches.`);
console.log(`Results saved to ${resultsFile}`);
}