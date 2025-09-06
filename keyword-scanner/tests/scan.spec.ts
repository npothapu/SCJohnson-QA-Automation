import { test } from '@playwright/test';
import { scanWebsite } from '../utils/main'; 
import fs from 'fs';
import path from 'path';

test('Scan website for keywords', async ({ page }) => {
console.log('Starting website scan test...');

// Create results directory directly in the test
const resultsDir = path.join(process.cwd(), 'results');
console.log(`Creating results directory at: ${resultsDir}`);

try {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    console.log(`Results directory created at: ${resultsDir}`);
  }
} catch (error) {
  console.error(`Error creating results directory: ${error}`);
}

// Now call scanWebsite
try {
  await scanWebsite(page);
  console.log('Website scan completed successfully');
} catch (error) {
  console.error('Error during website scan:', error);
}
});