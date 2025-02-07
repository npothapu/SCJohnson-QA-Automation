/**
 * Author: Nandakumar Pothapu Reddy
 * Title: Associate Director of Technology
 * FileName: extractLinksUtil.ts
 * Description:
 * Date: February 4, 2025
 */

import { expect } from "@playwright/test";
import path from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
import { Browser } from "playwright"; // Import Playwright types

// Load environment variables safely
const envPath = path.resolve(__dirname, `../../env/.env.${process.env.ENV || "dev"}`);
dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = ["BASE_URL", "FOLDER_NAME", "FILE_NAME"] as const;
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Extract environment variables
const BASE_URL: string = process.env.BASE_URL!;
const FOLDER_NAME: string = process.env.FOLDER_NAME!;
const FILE_NAME: string = process.env.FILE_NAME!;
const FOLDER_PATH: string = path.resolve(__dirname, `../data/url_batches/${FOLDER_NAME}`);

/**
 * Extracts all unique links from a webpage and saves them in JSON batches.
 * @param browser - Playwright browser instance
 */
async function extractAndSaveLinks(browser: Browser): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Navigating to URL: ${BASE_URL}`);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Extract all unique links that start with BASE_URL
    const links: string[] = await page.$$eval(
      "a",
      (anchors, baseURL) =>
        [...new Set(anchors.map((anchor) => anchor.href).filter((href) => href.startsWith(baseURL)))],
      BASE_URL
    );

    console.log(`Extracted ${links.length} unique links.`);

    // Soft assertion for minimum extracted links
    expect.soft(links.length, "No links extracted!").toBeGreaterThan(0);

    // Split links into batches of 25
    const batches: string[][] = Array.from({ length: Math.ceil(links.length / 25) }, (_, i) =>
      links.slice(i * 25, (i + 1) * 25)
    );

    // Ensure the folder exists
    await fs.mkdir(FOLDER_PATH, { recursive: true });

    // Save batches as JSON files with FILE_NAME prefix
    await Promise.all(
      batches.map((batch, index) =>
        fs.writeFile(path.join(FOLDER_PATH, `${FILE_NAME}_${index + 1}.json`), JSON.stringify(batch, null, 2), "utf8")
      )
    );

    console.log(`Successfully saved ${batches.length} batches in ${FOLDER_PATH}`);
  } catch (error) {
    console.error(`Error during extraction: ${(error as Error).message}`);
  } finally {
    await context.close();
  }
}

export { extractAndSaveLinks };
