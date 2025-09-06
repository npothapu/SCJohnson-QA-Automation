import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: "./utils/env/.env" });

let baseUrl: string = process.env.BASE_URL || '';
let environment = process.env.ENV?.toLowerCase() || 'default';

if (!baseUrl) {
  switch (environment) {
    case 'stg':
      baseUrl = process.env.STG_BASE_URL || '';
      break;
    case 'prod':
      baseUrl = process.env.PROD_BASE_URL || '';
      break;
    default:
      baseUrl = process.env.BASE_URL || '';
      environment = 'default';
  }

  if (!baseUrl) {
    throw new Error(`No URL configured for environment '${environment}'. 
    Please check your .env file or provide a DEBUG_URL.`);
  }
}

process.env.NODE_ENV = environment;

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
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.DOCKER ? "blob" : "html",
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});