/**
 * Author: Nandakumar Pothapu Reddy
 * Title: Associate Director of Technology
 * FileName: linkCheckerUtils.ts
 * Description:
 *   This file is responsible for extracting, validating, and testing hyperlinks on a given webpage.
 *   It performs the following functions:
 *   - Extracts all links from the page, identifying valid and invalid links.
 *   - Sends HTTP requests to each valid link to check its status.
 *   - Categorizes links based on HTTP status codes:
 *     ✅ 200-299: Successful responses
 *     🔄 300-399: Redirects
 *     ❌ 400-499: Client errors (e.g., 404 Not Found, 403 Forbidden)
 *     🚨 500-599: Server errors (e.g., 500 Internal Server Error)
 *   - Logs a detailed test summary, including total checked links and failures.
 *   - Soft-asserts any failures for CI/CD test tracking.
 *   - Supports Playwright test integration for automated link validation.
 * 
 * Date: February 7, 2025
 */


import path from "path";
import dotenv from "dotenv";
import { expect, test as playwrightTest, Page, TestInfo } from "@playwright/test";

dotenv.config({ path: path.resolve(__dirname, `../../env/.env.${process.env.ENV || 'dev'}`) });

interface LinkInfo {
    text: string;
    href: string;
}

interface LinkCheckResult {
    validHrefs: Set<string>;
    invalidLinks: LinkInfo[];
}

interface CheckLinksResult {
    passedLinks: number;
    redirectLinks: string[];
    clientErrorLinks: string[];
    serverErrorLinks: string[];
}

/**
 * Extracts all valid and invalid links from the page.
 */
async function getAllLinksFromPage(page: Page): Promise<LinkCheckResult> {
    const links: LinkInfo[] = await page.$$eval("a", anchors =>
        anchors.map(link => ({
            href: link.getAttribute("href") || "NULL",
            text: link.innerText.trim() || "[No Text]",
        }))
    );

    const invalidLinks: LinkInfo[] = [];
    const validHrefs: Set<string> = new Set();

    links.forEach(({ href, text }) => {
        if (!href || href === "NULL") {
            invalidLinks.push({ text, href: "NULL" });
        } else if (!href.startsWith("mailto:") && !href.startsWith("#")) {
            try {
                validHrefs.add(new URL(href, page.url()).href);
            } catch {
                invalidLinks.push({ text, href });
            }
        }
    });

    return { validHrefs, invalidLinks };
}

/**
 * Checks all extracted links and categorizes them based on response codes.
 */
async function checkLinks(page: Page, linkUrls: Set<string>, test: typeof playwrightTest): Promise<CheckLinksResult> {
    let passedLinks = 0;
    const redirectLinks: string[] = [];
    const clientErrorLinks: string[] = [];
    const serverErrorLinks: string[] = [];

    console.log(`🔗 Total Links Found: ${linkUrls.size}`);

    for (const url of linkUrls) {
        await test.step(`Checking link: ${url}`, async () => {
            try {
                const response = await page.request.get(url);
                const status = response.status();

                if (status >= 200 && status < 300) {
                    passedLinks++;
                } else if (status >= 300 && status < 400) {
                    redirectLinks.push(`${url} [${status}]`);
                } else if (status >= 400 && status < 500) {
                    clientErrorLinks.push(`${url} [${status}]`);
                } else if (status >= 500) {
                    serverErrorLinks.push(`${url} [${status}]`);
                }
            } catch {
                clientErrorLinks.push(`${url} [Failed to Respond]`);
            }
        });
    }

    return { passedLinks, redirectLinks, clientErrorLinks, serverErrorLinks };
}

/**
 * Logs the test summary.
 */
function logTestSummary(
    totalLinks: number,
    passedLinks: number,
    redirectLinks: string[],
    clientErrorLinks: string[],
    serverErrorLinks: string[],
    invalidLinks: LinkInfo[]
): void {
    console.log("\n=== ✅ Link Check Summary ✅ ===");
    console.log(`🔗 Total Links Checked: ${totalLinks}`);
    console.log(`✅ Passed Links: ${passedLinks}`);
    console.log(`🔄 Redirects (300s): ${redirectLinks.length}`);
    console.log(`❌ Client Errors (400s): ${clientErrorLinks.length}`);
    console.log(`🚨 Server Errors (500s): ${serverErrorLinks.length}`);

    if (redirectLinks.length > 0) {
        console.log("\n🔄 Redirected URLs:");
        redirectLinks.forEach(link => console.log(link));
    }

    if (clientErrorLinks.length > 0) {
        console.log("\n❌ Client Error URLs:");
        clientErrorLinks.forEach(link => console.log(link));
    }

    if (serverErrorLinks.length > 0) {
        console.log("\n🚨 Server Error URLs:");
        serverErrorLinks.forEach(link => console.log(link));
    }

    if (invalidLinks.length > 0) {
        console.log(`\n⚠️ Invalid Links Detected: ${invalidLinks.length}`);
        invalidLinks.forEach(({ text, href }) =>
            console.warn(`❌ Link Text: "${text}" | Href: ${href}`)
        );
    }

    // Soft assertion for test failure tracking
    expect.soft(clientErrorLinks.length + serverErrorLinks.length, "Some links returned errors").toBe(0);
}

/**
 * Runs the full link check process.
 */
async function runLinkCheck(page: Page, testInfo: TestInfo, test: typeof playwrightTest): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
        console.error(`❌ BASE_URL is not set in the environment variables`);
        throw new Error("BASE_URL is missing in the environment file!");
    }

    console.log(`🔍 Running tests for environment: ${process.env.ENV}`);
    console.log(`🌍 Testing BASE_URL: ${baseUrl}`);

    await page.goto(baseUrl);
    const { validHrefs, invalidLinks } = await getAllLinksFromPage(page);

    const { passedLinks, redirectLinks, clientErrorLinks, serverErrorLinks } = await checkLinks(page, validHrefs, test);

    testInfo.attach("checked-links.txt", {
        body: Array.from(validHrefs).join("\n"),
    });

    logTestSummary(validHrefs.size, passedLinks, redirectLinks, clientErrorLinks, serverErrorLinks, invalidLinks);
}

export { runLinkCheck };
