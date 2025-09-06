import fs from 'fs';
import path from 'path';
import { KeywordMatch } from './scanner';
import { createObjectCsvWriter } from 'csv-writer';

export async function generateCSV(results: KeywordMatch[], resultsDir: string, timestamp: string): Promise<void> {
console.log(`Found ${results.length} results to save to CSV`);

if (results.length === 0) {
  console.log('No results to write to CSV file');
  return;
}

// CSV Generation, here we go
// Add error handling around CSV generation
try {
  console.log(`Creating CSV writer for ${results.length} results...`);
  const csvWriter = createObjectCsvWriter({
    path: path.join(resultsDir, `keyword-scan-${timestamp}.csv`),
    header: [
      { id: 'url', title: 'URL' },
      { id: 'keyword', title: 'Keyword' },
      { id: 'location', title: 'Location' },
      { id: 'context', title: 'Context' }
    ]
  });

  console.log('Writing CSV records...');
  await csvWriter.writeRecords(results);
  console.log(`CSV report saved to ${path.join(resultsDir, `keyword-scan-${timestamp}.csv`)}`);
} catch (error) {
  console.error('Error generating CSV report:', error);
  
  // Fallback to manual CSV generation
  try {
    console.log('Attempting fallback CSV generation...');
    const csvFilePath = path.join(resultsDir, `keyword-scan-fallback-${timestamp}.csv`);
    const csvHeader = 'URL,Keyword,Location,Context\n';
    const csvRows = results.map(result => {
      return `"${result.url.replace(/"/g, '""')}","${result.keyword.replace(/"/g, '""')}","${result.location.replace(/"/g, '""')}","${result.context.replace(/"/g, '""')}"`;
    }).join('\n');
    
    fs.writeFileSync(csvFilePath, csvHeader + csvRows);
    console.log(`Fallback CSV report saved to ${csvFilePath}`);
  } catch (fallbackError) {
    console.error('Fallback CSV generation also failed:', fallbackError);
  }
}
}

export function saveJsonResults(results: KeywordMatch[], resultsDir: string, timestamp: string): void {
// When writing files, add more logging:
try {
  const resultsFile = path.join(resultsDir, `keyword-scan-${timestamp}.json`);
  console.log(`Writing JSON results to: ${resultsFile}`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`JSON report saved successfully to: ${resultsFile}`);
} catch (error) {
  console.error(`Error writing JSON results: ${error}`);
}
}