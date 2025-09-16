import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: "./utils/env/.env" });

const rawEnv = process.env.ENV?.toUpperCase() || 'STG';
const environment = rawEnv === 'STAGE' ? 'STG' : rawEnv;

let baseUrl: string = '';
let userid: string = '';
let pwd: string = '';
let httpCredentials: { username: string; password: string } | undefined = undefined;

switch (environment) {
  case 'STG':
    baseUrl = process.env.STG_BASE_URL ?? '';
    userid = process.env.STG_UID ?? '';
    pwd = process.env.STG_PWD ?? '';
    httpCredentials = { username: userid, password: pwd };
    break;
  case 'PROD':
    baseUrl = process.env.PROD_BASE_URL ?? '';
    httpCredentials = undefined; // No basic auth for PROD
    break;
  default:
    throw new Error(`Unknown environment: ${environment}`);
}

if (!baseUrl) {
  throw new Error(`No URL configured for environment '${environment}'. Please check the .env file.`);
}

const AUTH_STATE = "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./tests",
  snapshotPathTemplate: path.join(
    __dirname,
    "utils",
    "visual",
    `${process.env.NODE_ENV}`,
    "{arg}{ext}"
  ),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 8,
  reporter: process.env.DOCKER ? "blob" : "html",

  use: {
    baseURL: baseUrl,
    ...(httpCredentials && { httpCredentials }),
    screenshot: 'only-on-failure',
    trace: "on-first-retry",
    },
  
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(environment === "STG" ? { storageState: AUTH_STATE } : {}),
      },
      dependencies: ["setup"],
      testMatch: /.*(?<!mobile)\.spec\.ts$/,
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        ...(environment === "STG" ? { storageState: AUTH_STATE } : {}),
      },
      dependencies: ["setup"],
      testMatch: /.*(?<!mobile)\.spec\.ts$/,
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        ...(environment === "STG" ? { storageState: AUTH_STATE } : {}),
      },
      dependencies: ["setup"],
      testMatch: /.*(?<!mobile)\.spec\.ts$/,
    },
    {
      name: 'iPhone-12',
      use: {
        ...devices['iPhone 12'],
        browserName: 'webkit',
        ...(environment === "STG" ? { storageState: AUTH_STATE } : {}),
      },
      dependencies: ["setup"],
      testMatch: /.*mobile\.spec\.ts$/,
    },
    {
      name: 'Galaxy S20',
      use: {
        ...devices['Galaxy S20'],
        browserName: 'chromium',
        hasTouch: true,
        ...(environment === "STG" ? { storageState: AUTH_STATE } : {}),
      },
      dependencies: ["setup"],
      testMatch: /.*mobile\.spec\.ts$/,
    },
  ],
});