import fs from 'fs';
import path from 'path';
import { KeywordMatch } from './scanner';

export function generateHtmlReport(
matches: KeywordMatch[], 
resultsDir: string, 
timestamp: string,
baseUrl: string,
keywords: string[],
visitedUrlsCount: number
): void {
const reportPath = path.join(resultsDir, `keyword-scan-report-${timestamp}.html`);

// Group results by URL
const urlMap = new Map<string, KeywordMatch[]>();
for (const match of matches) {
  if (!urlMap.has(match.url)) {
    urlMap.set(match.url, []);
  }
  urlMap.get(match.url)!.push(match);
}

let html = generateHtmlTemplate(baseUrl, keywords, visitedUrlsCount, matches.length);

// Add results for each URL
for (const [url, urlMatches] of urlMap.entries()) {
  html += generateUrlSection(url, urlMatches);
}

// Add keyword statistics
html += generateKeywordStats(keywords, matches);

html += '</body></html>';

fs.writeFileSync(reportPath, html);
console.log(`HTML report saved to ${reportPath}`);
}

function generateHtmlTemplate(baseUrl: string, keywords: string[], visitedCount: number, matchCount: number): string {
return `
<!DOCTYPE html>
<html>
<head>
  <title>Keyword Scan Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { margin-bottom: 20px; }
    .url-section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .url-header { background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; border-bottom: 1px solid #ddd; }
    .match { margin-bottom: 10px; padding: 10px; background: #fff9e6; border-left: 3px solid #ffd700; }
    .keyword { font-weight: bold; color: #cc0000; }
    .location { font-style: italic; color: #666; }
    .context { background: #f9f9f9; padding: 8px; margin-top: 5px; white-space: pre-wrap; word-break: break-word; }
    .stats { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Keyword Scan Report</h1>
  <div class="summary">
    <p><strong>Base URL:</strong> ${baseUrl}</p>
    <p><strong>Scan Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Pages Scanned:</strong> ${visitedCount}</p>
    <p><strong>Keywords Searched:</strong> ${keywords.join(', ')}</p>
    <p><strong>Total Matches Found:</strong> ${matchCount}</p>
  </div>
  
  <h2>Results by Page</h2>
`;
}

function generateUrlSection(url: string, urlMatches: KeywordMatch[]): string {
return `
<div class="url-section">
  <div class="url-header">
    <h3><a href="${url}" target="_blank">${url}</a></h3>
    <p>${urlMatches.length} match${urlMatches.length !== 1 ? 'es' : ''} found</p>
  </div>
  
  ${urlMatches.map(match => `
    <div class="match">
      <div><span class="keyword">${match.keyword}</span> found in <span class="location">${match.location}</span></div>
      <div class="context">${escapeHtml(match.context).replace(
        new RegExp(escapeRegExp(match.keyword), 'gi'),
        `<span class="keyword">$&</span>`
      )}</div>
    </div>
  `).join('')}
</div>
`;
}

function generateKeywordStats(keywords: string[], matches: KeywordMatch[]): string {
const keywordStats = keywords.map(keyword => {
  const count = matches.filter(m => m.keyword === keyword).length;
  return { keyword, count };
}).sort((a, b) => b.count - a.count);

return `
  <div class="stats">
    <h2>Keyword Statistics</h2>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Keyword</th>
        <th>Occurrences</th>
      </tr>
      ${keywordStats.map(stat => `
        <tr>
          <td>${stat.keyword}</td>
          <td>${stat.count}</td>
        </tr>
      `).join('')}
    </table>
  </div>
`;
}

function escapeHtml(text: string): string {
return text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
}

function escapeRegExp(string: string): string {
return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}