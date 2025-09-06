//Directory and File Operations
import fs from 'fs';
import path from 'path';

export function createResultsDirectory(): string {
let resultsDir = path.join(process.cwd(), 'results');
console.log(`Attempting to create results directory at: ${resultsDir}`);

try {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    console.log(`Results directory created successfully at: ${resultsDir}`);
  } else {
    console.log(`Results directory already exists at: ${resultsDir}`);
  }
} catch (error) {
  console.error(`Error creating results directory: ${error}`);
  // Try creating in a different location as fallback
  const fallbackDir = path.join(__dirname, 'results');
  console.log(`Attempting to create fallback results directory at: ${fallbackDir}`);
  
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
      console.log(`Fallback results directory created successfully at: ${fallbackDir}`);
    }
    // Use fallbackDir instead
    resultsDir = fallbackDir;
  } catch (fallbackError) {
    console.error(`Error creating fallback results directory: ${fallbackError}`);
    // Last resort - use the current directory
    resultsDir = __dirname;
    console.log(`Using current directory for results: ${resultsDir}`);
  }
}

return resultsDir;
}

export function generateTimestamp(): string {
return new Date().toISOString().replace(/[:.]/g, '-');
}