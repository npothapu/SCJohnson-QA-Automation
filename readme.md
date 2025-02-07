# Playwright Test Automation Setup

This document provides step-by-step instructions for setting up a Playwright-based test automation framework, including required dependencies and installation commands.

---

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm (comes with Node.js)
- [Playwright](https://playwright.dev/docs/intro)

---

## Installation Steps

### 1. Initialize the Playwright Project
Run the following command to create a new Playwright project:
```sh
npx create-playwright . --quiet --browser=chromium --browser=firefox --browser=webkit
```
This will:
- Initialize an npm project (`npm init -y`)
- Install `@playwright/test`
- Set up Playwright's configuration (`playwright.config.ts`)
- Add example test files (`tests/example.spec.ts`, `tests-examples/demo-todo-app.spec.ts`)
- Download required browsers (Chromium, Firefox, WebKit)

---

### 2. Install Additional Dependencies

Run the following commands to install required npm packages:

#### **Playwright and Dependencies**
```sh
npm install -g @playwright/test@latest  # Install Playwright globally
npx playwright install --with-deps       # Install Playwright browsers and dependencies
```

#### **Essential Libraries**
```sh
npm install typo-js playwright-html-reporter dotenv csv-parser
```
- `typo-js` → Spell-checking in automation scripts.
- `playwright-html-reporter` → Generates an HTML report of test executions.
- `dotenv` → Load environment variables from a `.env` file.
- `csv-parser` → Parse CSV files for data-driven testing.

#### **Image Comparison**
```sh
npm install resemblejs canvas
npm i --save-dev @types/resemblejs
```
- `resemblejs` → Image comparison for visual regression testing.
- `canvas` → Required for image processing in Node.js.
- `@types/resemblejs` → TypeScript definitions for `resemblejs`.

#### **Performance Testing (Lighthouse)**
```sh
npm install lighthouse chrome-launcher playwright fs
```
- `lighthouse` → Web performance auditing.
- `chrome-launcher` → Launch Chrome for Lighthouse tests.
- `fs` → File system utilities.

---

## Running Tests

### Execute All Tests
```sh
npx playwright test
```

### Run Tests in UI Mode
```sh
npx playwright test --ui
```

### Run Tests in a Specific Browser
```sh
npx playwright test --project=chromium
```

### Run a Specific Test File
```sh
npx playwright test tests/example.spec.ts
```

### Debug Tests
```sh
npx playwright test --debug
```

### Generate Tests Using Codegen
```sh
npx playwright codegen
```

---

## Environment-Specific Execution

### Set Environment Variable and Run Tests
#### Windows (PowerShell)
```sh
$env:ENV="qa"; npx playwright test
```

#### macOS/Linux (Bash)
```sh
ENV=qa npx playwright test
```

### Using Environment Variables from `.env` File
Create a `.env` file in the project root:
```sh
BASE_URL=https://example.com
TEST_FOLDER=tests
TEST_FILENAME=example.spec.ts
```
Run tests with these variables:
```sh
npx playwright test --config=playwright.config.ts
```
Or specify them inline:
```sh
BASE_URL=https://example.com TEST_FOLDER=tests TEST_FILENAME=example.spec.ts npx playwright test
```

---

## Configuration Files
- `playwright.config.ts` → Playwright test configuration.
- `.env` → Stores environment variables.
- `tests/` → Contains test scripts.

For more details, visit the official [Playwright documentation](https://playwright.dev/docs/intro).

**Happy Testing! 🎭**

