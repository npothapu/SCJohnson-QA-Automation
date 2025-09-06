import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
// Try to import your function
import { scanWebsite } from '../utils/main';

test.skip('Debug test', async ({ page }) => {
console.log('Debug test running');

// Check if scanWebsite is a function
console.log('scanWebsite type:', typeof scanWebsite);

// Create a results directory directly
const resultsDir = path.join(process.cwd(), 'results');
console.log(`Creating results directory at: ${resultsDir}`);

try {
  fs.mkdirSync(resultsDir, { recursive: true });
  
  // Write a test file
  const testFile = path.join(resultsDir, 'test.txt');
  fs.writeFileSync(testFile, 'Test file content');
  console.log(`Test file created at: ${testFile}`);
} catch (error) {
  console.error('Error creating directory or file:', error);
}

// Try calling scanWebsite if it's a function
if (typeof scanWebsite === 'function') {
  try {
    console.log('Calling scanWebsite function...');
    await scanWebsite(page);
    console.log('scanWebsite function completed');
  } catch (error) {
    console.error('Error calling scanWebsite:', error);
  }
}
});