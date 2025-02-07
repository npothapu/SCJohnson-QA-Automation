/**
 * Author: Nandakumar Pothapu Reddy
 * Title: Associate Director of Technology
 * FileName: headerfooterLinks.ts
 * Description: This script tests all header, navigation, and footer links on a webpage.
 *               It loads environment variables, navigates to the BASE_URL, extracts links,
 *              validates their status, and prints a summary of working and broken links.
 * Date: February 7, 2025
 */

import { chromium, Page } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';

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
const BASE_URL: string = process.env.BASE_URL as string;
const FOLDER_NAME: string = process.env.FOLDER_NAME!;
const FILE_NAME: string = process.env.FILE_NAME!;
const FOLDER_PATH: string = path.resolve(__dirname, `../data/url_batches/${FOLDER_NAME}`);

async function getPageLinks(page: Page, selector: string): Promise<{ title: string, href: string }[]> {
    return await page.$$eval(selector + ' a', links =>
    links
        .filter(link => link instanceof HTMLAnchorElement)
        .map(link => ({ title: (link as HTMLAnchorElement).innerText.trim(), href: (link as HTMLAnchorElement).href }))
);
}

async function validateLinks(page: Page, links: string[]): Promise<{ working: string[], broken: string[] }> {
    const working: string[] = [];
    const broken: string[] = [];
    
    for (const link of links) {
        try {
            const response = await page.goto(link, { timeout: 10000 });
            if (response && response.status() < 400) {
                working.push(link);
            } else {
                broken.push(link);
            }
        } catch (error) {
            broken.push(link);
        }
    }
    return { working, broken };
}

export async function checkHeaderFooterLinks() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log(`🔍 Testing Base URL: ${BASE_URL}`);
    await page.goto(BASE_URL);
    
    const headerLinks = await getPageLinks(page, 'header');
console.log('🔗 Header Links:');
    headerLinks.forEach(link => console.log(`- ${link.title}: ${link.href}`));
    const navLinks = await getPageLinks(page, 'nav');
    const footerLinks = await getPageLinks(page, 'footer');
console.log('🔗 Footer Links:');
    footerLinks.forEach(link => console.log(`- ${link.title}: ${link.href}`));
    
    const allLinks = [...new Set([...headerLinks, ...navLinks, ...footerLinks])];
    console.log(`🔗 Total links found: ${allLinks.length}`);
    
    const allLinkHrefs = allLinks.map(link => link.href);
    const { working, broken } = await validateLinks(page, allLinkHrefs);
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Working links: ${working.length}`);
    console.log(`❌ Broken links: ${broken.length}`);
    if (broken.length > 0) {
        console.log(`🚨 Broken URLs:\n${broken.join('\n')}`);
    }
    
    await browser.close();
    return { working, broken };
}
