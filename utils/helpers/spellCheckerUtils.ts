/**
 * Author: Nandakumar Pothapu Reddy
 * Title: Associate Director of Technology
 * Date: January 23, 2025
 * FileName: spellCheckerUtils.ts
 * This Playwright script performs a spell check on multiple webpages.
 * It reads URLs from JSON files stored in a specified folder, loads each page,
 * injects the Typo.js library for spell checking, and reports any misspelled words.
 * The results are summarized at the end of execution, highlighting links with errors
 * and those that failed to load.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, `../../env/.env.${process.env.ENV || 'dev'}`) });

// Validate required environment variables
const requiredEnvVars = ["BASE_URL", "FOLDER_NAME", "FILE_NAME"];
requiredEnvVars.forEach(key => {
    expect.soft(process.env[key], `Missing required environment variable: ${key}`).not.toBeNull();
});

const BASE_URL: string = process.env.BASE_URL!;
const FOLDER_NAME: string = process.env.FOLDER_NAME!;
const FILE_NAME: string = process.env.FILE_NAME || "teenvoice";
const FOLDER_PATH: string = path.resolve(__dirname, `../../utils/data/url_batches/${FOLDER_NAME}`);

// Utility function for delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

type CheckSpellingParams = {
    page: any;
    link: string;
    typoJsPath: string;
    affContent: string;
    dicContent: string;
    customWords: string[];
};

async function checkSpelling({ page, link, typoJsPath, affContent, dicContent, customWords }: CheckSpellingParams): Promise<string[]> {
    await page.goto(link);

    const typoJsCode = await fs.promises.readFile(typoJsPath, 'utf8');
    await page.addScriptTag({ content: typoJsCode });

    await page.evaluate(({ affContent, dicContent, customWords }: { affContent: string; dicContent: string; customWords: string[] }) => {
        // @ts-ignore
        window.typo = new Typo('en_US', affContent, dicContent);
        customWords.forEach(word => {
            // @ts-ignore
            window.typo.dictionaryTable[word] = null;
        });
    }, { affContent, dicContent, customWords });

    const pageText: string = await page.evaluate(() => document.body.innerText);
    
    const misspelledWords: string[] = await page.evaluate((text: string) => {
        const normalizeWord = (word: string) => word.replace(/[^\w'-]/g, '').toLowerCase();
        const words = text.split(/\s+/).map(normalizeWord).filter(Boolean);
        // @ts-ignore
        return Array.from(new Set(words.filter(word => !window.typo.check(word))));
    }, pageText);

    return misspelledWords;
}

export default function (test: typeof import('@playwright/test').test) {
    test.describe('Spell Check for All Links', () => {
        const typoJsPath: string = path.resolve(__dirname, '../../node_modules/typo-js/typo.js');
        const affPath: string = path.resolve(__dirname, '../../node_modules/typo-js/dictionaries/en_US/en_US.aff');
        const dicPath: string = path.resolve(__dirname, '../../node_modules/typo-js/dictionaries/en_US/en_US.dic');
        const dictionaryFilename: string = process.env.DIC_FILENAME || 'teenvoice';
        const customDicPath: string = path.resolve(__dirname, `../../utils/company-dictionaries/${dictionaryFilename}.dic`);

        let affContent: string, dicContent: string, customWords: string[];
        let totalLinks: number = 0;
        let linksWithErrors: { link: string, misspelledWords: string[] }[] = [];
        let failedLinks: string[] = [];

        test.beforeAll(async () => {
            [affContent, dicContent, customWords] = await Promise.all([
                fs.promises.readFile(affPath, 'utf8'),
                fs.promises.readFile(dicPath, 'utf8'),
                fs.promises.readFile(customDicPath, 'utf8').then(data => data.split('\n').map(word => word.trim()).filter(Boolean))
            ]);
        });

        const distinctLinks = new Set<string>();

        if (!fs.existsSync(FOLDER_PATH)) {
            fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        for (let i = 1; i <= 10; i++) {
            const filePath: string = path.join(FOLDER_PATH, `${FILE_NAME}_${i}.json`);
            if (fs.existsSync(filePath)) {
                const batch: string[] = require(filePath);
                batch.forEach(link => distinctLinks.add(link));
            }
        }

        const linksArray: string[] = Array.from(distinctLinks);
        totalLinks = linksArray.length;

        linksArray.forEach((link, index) => {
            test(`Check spelling on link ${index + 1} of ${totalLinks}: ${link}`, async ({ page }) => {
                try {
                    const misspelledWords = await checkSpelling({ page, link, typoJsPath, affContent, dicContent, customWords });
                    if (misspelledWords.length > 0) {
                        linksWithErrors.push({ link, misspelledWords });
                    }
                    expect.soft(misspelledWords.length).toBe(0);
                } catch (error) {
                    failedLinks.push(link);
                    if (error instanceof Error) {
                        console.error(`Error checking link ${link}: ${error.message}`);
                    } else {
                        console.error(`Error checking link ${link}: ${String(error)}`);
                    }
                    expect.soft(false).toBe(true);
                }

                await delay(1200);
            });
        });

        test.afterAll(() => {
            console.log('\n========= SPELL CHECK SUMMARY =========');
            console.log(`✅ Total Links Checked: ${totalLinks}`);
            console.log(`❌ Links with Spelling Errors: ${linksWithErrors.length}`);
            linksWithErrors.forEach(({ link, misspelledWords }) => {
                console.log(`  - ${link}: ${misspelledWords.join(', ')}`);
            });
            console.log(`🛑 Links that Failed to Load: ${failedLinks.length}`);
            failedLinks.forEach(link => console.log(`  - ${link}`));
            console.log('=======================================\n');
        });
    });
}
