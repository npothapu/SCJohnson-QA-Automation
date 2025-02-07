/**
 * Author: Nandakumar Pothapu Reddy
  * FileName: linkCheckerUtils.ts
 * Description:
 * Date: February 7, 2025
 */

import path from "path";
import fs from "fs/promises";
import { expect, Page } from "@playwright/test";
import dotenv from "dotenv";
import resemble from "resemblejs";

dotenv.config(); // Load environment variables

// Load environment variables safely
const envPath = path.resolve(__dirname, `../../../env/.env.${process.env.ENV || "dev"}`);
dotenv.config({ path: envPath });

// Validate required environment variables with soft assertions
const requiredEnvVars = ["BASE_URL", "FOLDER_NAME", "FILE_NAME"];
requiredEnvVars.forEach((key) => {
  expect.soft(process.env[key], `Missing required environment variable: ${key}`).not.toBeNull();
});

// Extract environment variables
const BASE_URL = process.env.BASE_URL as string;
const FOLDER_NAME = process.env.FOLDER_NAME as string;
const FILE_NAME = process.env.FILE_NAME as string;
const FOLDER_PATH = path.resolve(__dirname, `../../data/url_batches/${FOLDER_NAME}`);
const BASELINE_SNAPSHOTS_DIR = path.join(__dirname, "..", "visual_tests", "baseline_snapshots");
const CURRENT_SNAPSHOTS_DIR = path.join(__dirname, "..", "visual_tests", "current_snapshots");
const DIFFS_DIR = path.join(__dirname, "..", "visual_tests", "diffs");
const REPORTS_DIR = path.join(__dirname, "..", "visual_tests", "reports");

async function checkLinks(page: Page, selector: string, sectionName: string): Promise<void> {
    await page.goto(BASE_URL);
    
    // Select all links from the specified section
    const links = page.locator(selector);
    const count = await links.count();
    
    console.log(`Total ${sectionName} links found: ${count}`);
    
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < count; i++) {
        const link = await links.nth(i).getAttribute('href');
        if (link) {
            const response = await page.request.get(link);
            const status = response.status();
            if (status >= 400) {
                console.error(`Broken link in ${sectionName}: ${link} (Status: ${status})`);
                failedCount++;
            } else {
                console.log(`Working link in ${sectionName}: ${link} (Status: ${status})`);
                successCount++;
            }
        }
    }
    
    console.log(`\n${sectionName} Test Summary:`);
    console.log(`Total Working Links: ${successCount}`);
    console.log(`Total Broken Links: ${failedCount}`);
}

async function runFooterLinkCheck(page: Page): Promise<void> {
    await checkLinks(page, 'footer a', 'Footer');
}

async function runHeaderLinkCheck(page: Page): Promise<void> {
    await checkLinks(page, 'header a', 'Header');
}

async function captureAndCompareScreenshot(page: Page, testName: string, browserName: string): Promise<void> {
    if (!BASE_URL) {
        throw new Error("❌ BASE_URL is missing in the environment configuration!");
    }

    const originalImagePath = path.join(BASELINE_SNAPSHOTS_DIR, `${testName}_baseline.png`);
    const newImagePath = path.join(CURRENT_SNAPSHOTS_DIR, `${testName}_${browserName}.png`);
    const diffImagePath = path.join(DIFFS_DIR, `${testName}_diff.png`);
    const reportPath = path.join(REPORTS_DIR, `${testName}_report.html`);

    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 1920, height: Math.min(bodyHeight, 5000) });
    
    await page.screenshot({ path: newImagePath, fullPage: true });
    console.log(`📸 New screenshot saved at: ${newImagePath}`);

    if (!fs.existsSync(originalImagePath)) {
        console.warn("⚠️ No baseline snapshot found. Saving current screenshot as the baseline.");
        await fs.copyFile(newImagePath, originalImagePath);
        console.log("✅ Baseline snapshot saved.");
        return;
    }

    const diff = await new Promise((resolve) => {
        resemble(fs.readFileSync(originalImagePath))
            .compareTo(fs.readFileSync(newImagePath))
            .onComplete(resolve);
    });

    await fs.writeFile(diffImagePath, diff.getBuffer());
    console.log(`📊 Diff image saved at: ${diffImagePath}`);

    if (diff.misMatchPercentage > 0) {
        throw new Error(`❌ Visual mismatch detected! Images differ by ${diff.misMatchPercentage}%`);
    }
    console.log("✅ Screenshots match!");
}

export { runFooterLinkCheck, runHeaderLinkCheck, captureAndCompareScreenshot };
