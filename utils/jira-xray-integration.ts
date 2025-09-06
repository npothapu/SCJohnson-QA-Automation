#!/usr/bin/env node

/***************************************************************************************************
 *                                                                                                 *
 *  Integrates test results with Jira Xray - uses PAT for authentication                           *
 *                                                                                                 *  
 *  How To Create PAT:                                                                             *
 *  https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html       * 
 *                                                                                                 *
 *  Can be imported into your project and run as standalone function                               * 
 *                                                                                                 *
 *  Lives in package.json as an npm script:                                                        *
 *      - Plug in your Jira credentials                                                            *    
 *      - Use 'npm run update-jira-status'                                                         *
 *                                                                                                 *
 ***************************************************************************************************/

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface JiraConfig {
    baseUrl: string;
    token: string;
};

interface TestCaseStatus {
    testCaseNumber: string;
    status: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportFilePath = path.resolve(__dirname, '../../playwright-json/results.json');

export async function updateJiraTestCaseStatus(jiraConfig: JiraConfig): Promise<void> {
    const testCaseStatuses = parseTestReport(reportFilePath);
    for (const { testCaseNumber, status } of testCaseStatuses) {
        await updateTestCaseStatusInJira(testCaseNumber, status, jiraConfig);
    };
};

function parseTestReport(reportFile: string): TestCaseStatus[] {
    const reportContent = fs.readFileSync(reportFile, 'utf-8');
    const report = JSON.parse(reportContent);

    const testCaseStatuses: TestCaseStatus[] = [];
    for (const suite of report.suites) {
        for (const spec of suite.specs) {
            for (const test of spec.tests) {
                const match = spec.title.match(/^(\d+) - /);
                if (match) {
                    testCaseStatuses.push({
                        testCaseNumber: match[1],
                        status: test.results[0].status
                    });
                }
            }
        }
    }
    return testCaseStatuses;
};

export async function updateTestCaseStatusInJira(testCaseNumber: string, status: string, jiraConfig: JiraConfig): Promise<void> {
    const { baseUrl, token } = jiraConfig;
    const url = `${process.env.JIRA_BASE_URL}/rest/api/2/issue/${testCaseNumber}`;

    const data = JSON.stringify({
        fields: {
            status: {
                name: status
            }
        }
    });

    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode === 204) {
                resolve();
            } else {
                reject(new Error(`Failed to update Jira test case status: ${res.statusCode} ${res.statusMessage}`));
            }
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
};

// If the script is run directly from the command line
if (import.meta.url === `file://${__filename}`) {
    const jiraConfig: JiraConfig = {
        baseUrl: process.env.JIRA_BASE_URL || '',
        token: process.env.JIRA_PAT || ''
    };

    updateJiraTestCaseStatus(jiraConfig)
        .then(() => console.log('Test case statuses updated successfully'))
        .catch(err => {
            console.error('Failed to update test case statuses:', err);
            process.exit(1);
    });
};