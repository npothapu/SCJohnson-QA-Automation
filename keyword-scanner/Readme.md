# So You Want To Scan Some Stuff?
## You're in the (play)Wright Place
[](#general-info)
[](#how-to)
[](#step-1-make-it-yours-hombre)
[](#want-to-override-the-crawler-functionality-by-listing-specific-links-to-scan)
[](#step-2-run-it)
[](#step-3-do-you-need-to-debug)

### General Info
This is a webscraper that checks for the instance of declared keywords in the body content, links, URLs, & metadata. So, it's looking on the UI AND behind the scenes!

It will generate two different custom reports as well as the CLI list results & the standard playwright test report. The custom reports are in csv format & HTML format. 

It's for fun.

### How To!
#### Step 1: Make It Yours, Hombre!
Start with keywords.json
This is where you'll not only declare the keywords to check, but also the base page to start & your max pages limit. 

Keep in mind, this suite is configured to run over an hour, give or take what you set your limit to. Our Weblink Validator, for example, is licensed to 75,000 links, but each project meters the connection rate depending on when they run the tool, as to not bog down the system for all testers. There are ways to configure the connectivity, but that's in other places.

Next, review the structure of utils:
- csv-generator
- file-utils
- helpers
- html-generator
- main
- scanner
Generally speaking, you will not need to update any of these files. Made you look!

If you want to, pop open the CSV Generation script & update the fields that will be created. Same goes for the custom HTML Generation script.

##### Want to Override the Crawler Functionality By Listing Specific Links to Scan?
Well, go right ahead. I won't stop you. Here's the steps:
1. In keywords.json, add a property "scanMode" & set it to "specific-pages". Then add a "specific-pages" property & list your links in an array, like this: 
"scanMode": "specific-pages",
"specificPages": [
  "https://www.coolwebsite.com/about",
  "https://www.coolwebsite.com/contact",
  "https://www.coolwebsite.com/services/equipment-rental"
]
2. Update the WebsiteScanner constructor in scanner.ts to accomodate this:
export class WebsiteScanner {
private results: KeywordMatch[] = [];
private visitedUrls = new Set<string>();
private keywords: string[];
private caseSensitive: boolean;
private pendingUrls: string[];
private baseUrl: string;
private maxPages: number;
private scanMode: 'crawler' | 'specific-pages'; // Add this
private specificPages: string[]; // Add this

constructor(
  keywords: string[], 
  caseSensitive: boolean = false, 
  baseUrl: string, 
  maxPages: number,
  scanMode: 'crawler' | 'specific-pages' = 'crawler', // New parameter
  specificPages: string[] = [] // New parameter
) {
  this.keywords = keywords;
  this.caseSensitive = caseSensitive;
  this.baseUrl = baseUrl;
  this.maxPages = maxPages;
  this.scanMode = scanMode;
  this.specificPages = specificPages;
  
  // Initialize pendingUrls based on scan mode
  this.pendingUrls = scanMode === 'specific-pages' 
    ? [...specificPages] 
    : [baseUrl];
}
3. Update the runScan method starting on line 27 in the main.ts like so...
while (pendingUrls.length > 0 && scanner.visitedUrls.size < scanner.maxPages) {
  const url = scanner.pendingUrls.shift()!;

  // Skip if already visited
  if (scanner.visitedUrls.has(url)) {
    continue;
  }

  // For crawler mode, check if URL is external
  if (scanner.scanMode === 'crawler' && !url.startsWith(scanner.baseUrl)) {
    continue;
  }

  // Check robots.txt rules (skip for specific-pages mode if desired)
  if (scanner.scanMode === 'crawler' && robotsTxt && !robotsTxt.isAllowed(url, 'PlaywrightBot')) {
    console.log(`Skipping ${url} - disallowed by robots.txt`);
    continue;
  }

  visitedUrls.add(url);

  try {
    const links = await scanner.scanPage(page, url);
    
    // Only add discovered links in crawler mode
    if (scanner.scanMode === 'crawler') {
      // Add links to pending URLs if it's on the same domain
      for (const link of links) {
        try {
          const linkUrl = new URL(link.href);
          const baseUrl = new URL(this.baseUrl);
          
          if (linkUrl.hostname === baseUrl.hostname && !this.visitedUrls.has(link.href)) {
            pendingUrls.push(link.href);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    }
    
  } catch (error) {
    console.error(`Error scanning ${url}: ${error}`);
  }
}

4. Don't close main.ts yet! See line 11? Starting there, you'll want to update like so...
// Configuration
const BASE_URL = keywordsConfig.baseUrl;
const MAX_PAGES = keywordsConfig.maxPages;
const KEYWORDS = keywordsConfig.keywords;
const CASE_SENSITIVE = keywordsConfig.caseSensitive;
const SCAN_MODE = keywordsConfig.scanMode || 'crawler'; // Default to crawler
const SPECIFIC_PAGES = keywordsConfig.specificPages || [];

console.log(`Starting ${SCAN_MODE} scan for keywords: ${KEYWORDS.join(', ')}`);

if (SCAN_MODE === 'specific-pages') {
  console.log(`Scanning ${SPECIFIC_PAGES.length} specific pages`);
} else {
  console.log(`Starting crawler scan from ${BASE_URL}`);
}

// Initialize scanner
const scanner = new WebsiteScanner(
  KEYWORDS, 
  CASE_SENSITIVE, 
  BASE_URL, 
  MAX_PAGES,
  SCAN_MODE,
  SPECIFIC_PAGES
);

#### Step 2: Run It
Well, what are you waiting for?

npx playwright test

#### Step 3: Do You Need to Debug?
Well, you're in luck! There is a "test" called debug.spec.ts that has the skip annotation added to it to prevent it from running unless you need it to. It has additional methods of debugging.

### The Keyword Player & Friends
This initial iteration presents a web scraper that scans a website for any instance of declared keywords. That's not the limit of what he can do, or wants to do!

Future iterations may contain:
- Status Codes (400, 404, 500)
- Compliation of all errors, console, misc API, JavaScript, you name it (please)
- Spelling errors
- Failed page rules
- Pages with missing titles
- Directory Tree generation
- Site Map generation
- Any maybe even WCAG validation...

Got an idea? Create a new branch & show it off! Feeling shy? Why? It's okay, just contact your nearest Playwright Partner.

### Credits
My name is Jess Zager & I could not have written this without the direct assistance of Christian Conner, as well as his indirect help, body by Wizard.