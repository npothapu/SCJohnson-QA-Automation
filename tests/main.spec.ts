/**
 * Author: Nandakumar Reddy
 * Title: Associate Director of Technology
 * FileName: main.spec.ts
 * Description: This script contains Playwright tests for website link validation, 
 * screenshot comparison, and navigation link checking. Each test case is linked 
 * to a JIRA ticket for tracking.
 */

import dotenv from 'dotenv'; // Load environment variables
import { test } from '@playwright/test';
import { runLinkCheck } from '../utils/helpers/linkCheckerUtils';
import { extractAndSaveLinks } from '../utils/helpers/extractLinksUtil';
import { checkHeaderFooterLinks } from '../utils/helpers/headerfooterLinks';
import { captureAndCompareScreenshot } from '../utils/helpers/visualTesting';

dotenv.config(); // Load environment variables

// JIRA Tickets
const JIRA_TICKETS = {
    extractLinks: 'https://jira.uhub.biz/browse/VYRNASCJBP-15',
    checkLinks: 'https://jira.uhub.biz/browse/VYRNASCJBP-16',
    headerfooterLinks: 'https://jira.uhub.biz/browse/VYRNASCJBP-17',
    screenshotTest: 'https://jira.uhub.biz/browse/VYRNASCJBP-18'
};

test.describe.parallel("Website Testing Suite", () => {

    test(`Extract and save distinct links - [JIRA: ${JIRA_TICKETS.extractLinks}]`, async ({ browser }) => {
        test.setTimeout(90000);
        console.log(`Refer to JIRA ticket: ${JIRA_TICKETS.extractLinks}`);
        await extractAndSaveLinks(browser);
    });

    test(`Check all links for broken URLs - [JIRA: ${JIRA_TICKETS.checkLinks}]`, async ({ page }, testInfo) => {
        test.setTimeout(90000);
        console.log(`Refer to JIRA ticket: ${JIRA_TICKETS.checkLinks}`);
        await runLinkCheck(page, testInfo, test);
    });

    test('Check all navigation header and footer links', async () => {
        test.setTimeout(90000);
        await checkHeaderFooterLinks();
    });

    // test(`Check all header links for broken URLs - [JIRA: ${JIRA_TICKETS.headerLinks}]`, async ({ page }) => {
    //     test.setTimeout(90000);
    //     console.log(`Refer to JIRA ticket: ${JIRA_TICKETS.headerLinks}`);
    //     await runHeaderLinkCheck(page);
    // });

});
