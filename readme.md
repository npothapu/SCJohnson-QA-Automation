<img src="images/christian-connors-trademark-2025.png" width="150" height="150" alt="logo by Christian Conners">

# Welcome to the newest seed project, powered by Playwright (and you!)

- [Welcome to the newest seed project, powered by Playwright (and you!)](#welcome-to-the-newest-seed-project-powered-by-playwright-and-you)
  - [Setup](#setup)
  - [Notes on Architecture](#notes-on-architecture)
    - [Authentication](#authentication)
    - [Configurations](#configurations)
  - [Writing Tests](#writing-tests)
    - [Structure](#structure)
      - [By Testing Approach](#by-testing-approach)
      - [By Test Coverage](#by-test-coverage)
      - [One Other Consideration](#one-other-consideration)
    - [Utilities](#utilities)
      - [Environment Files](#environment-files)
      - [Helpers](#helpers)
      - [Jira Integration](#jira-integration)
    - [Tests, themselves](#tests-themselves)
      - [How About Links for Test Concepts?](#how-about-links-for-test-concepts)
  - [Running Tests](#running-tests)
    - [UI Mode](#ui-mode)
    - [Terminal Commands](#terminal-commands)
 

## Setup
Note: Below local setup and references are for VSCode. IntelliJ will follow mostly the same setup, but VSCode is the perferred IDE for Playwright. See [Getting Started](https://playwright.dev/docs/getting-started-vscode)

Prereq: Ensure you have local admin permissions.

- Clone the repo.
- Save to a local directory, rather than a OneDrive synced directory.
- Install Homebrew
    - Brew will automatically install git.
    - Install Node via Homebrew
    - If you already have git & Node installed, you can skip
- Open a command prompt or terminal at the project root, run the following commands:
    - Install NPM: npm install npm
    - Install Playwright: npm install -D @playwright/test@latest
    - Install Playwright Browsers: npx playwright install --with-deps
    - Install Playwright BDD: npm i -D playwright-bdd
    - Install Cucumber: npm i -D @playwright/test @cucumber/cucumber
    - Install Dependencies
        - Install DotEnv: npm install dotenv
        - Install Cross-Env: npm install cross-env
        - Optional: Install Playwright Xray: npm install playwright-xray *
            * This is still in the package.json deps as of 01/2025, is likely temporary.
- Install these VSCode extensions for ease of use:
    - Cucumber (Gherkin) Full Support
    - Playwright Test for VSCode
    - Prettier - Code formatter
- Turn VSCode setting to periodically fetch from main ON.
- Ensure VSCode is set to Auto Save

## Notes on Architecture
### Authentication
Authentication is performed as a standalone before all property, controlled by auth.setup.ts in the tests directory, data is stored in the playwright directory, user.json (which is created once the auth step runs the first time).
For more information see [Docs](https://playwright.dev/docs/auth).

Note: You can have a seperate auth.setup.ts in different directories, so this may be a consideration for how you organize your test folder structure.

### Configurations
These are handled almost always within the root file, playwright.config.ts. These configurations include browsers used for testing, environment variables, things of this nature. See [Setup](https://playwright.dev/docs/test-global-setup-teardown#setup) for more information.

For more information about multiple browser configuration & multi-environment coverage, see [these](https://playwright.dev/docs/test-projects) docs.

## Writing Tests

### Structure
The way you structure & organize your tests depends on what works best for you & your testing coverage.

It is not optimal to simply store all your tests in a single directory, here are a few examples of a better approach.

#### By Testing Approach
Tests can broken down here into 3 subdirectories:
- content validations, like verifying page titles & other page-based content
- interactions, meaning general user actions, like a user clicks a link on a page, then test verifies new page's title
- user flows, a good example is a simple sign in or sign out test

#### By Test Coverage
In this manner, tests are broken down by site components, for example, a Homepage directory would house tests that
- validate title metadata, & content on the Homepage
- validate that the user can interact with elements on the Homepage

#### One Other Consideration
From the Authentication section above...
Note: You can have a seperate auth.setup.ts in different directories, so this may be a consideration for how you organize your test folder structure.

### Utilities
Utilities, or the utils directory, is where you will house common test items, such as:
- env, where you define testing environments or other common links used throughout testing, like Jira links if you use this integration
- helpers, or where you store methods all tests have in common
- Jira integration scripts
- urls.json <- Another method of handling urls as environment variables

#### Environment Files
You can EITHER use separate environment files or use a single .env file. This depends on your desired level of organization. Keep in mind, the more features added for different user experiences, you may opt for the former version.

Or, if you prefer, you can just use the urls.json file to handle this.

Default / placeholder values are provided for both. The package.json scripts and the current playwright.config.ts are set up to plug in URLs and use the .env files, but can be easily swapped for a urls.json approach.

#### Helpers
This directory contains all the repeated functions throughout all tests, or tests in common. For example, the main helper.ts file contains a close cookie banner method, used on every new session. 

The example file provided, is intended to spark inspiration for repeated initial methods for tests in common. Consider if all Checkout tests have the same initial step. If so, why not add it here, then call the function on your test to keep your code dry?

Another use case would be if a component needs to be hidden across a single subdomain, like a feedback flag that is only present on the production environment, so a method to hide this component to prevent it from complicating tests that should be the exact same across subdomains. If you need to hide it, why not add it to another helper file? It just wants to help!

#### Jira Integration
Keep in mind, find out if your client's Atlassian subscription offers support for this level of integration. If so, try amending the file supplied!

### Tests, themselves
*Note: By now you've noticed this is written in TypeScript, arguably the more intuitive & user friendly sibling of JavaScript. It does come with it's own nuances, like all of us, some notes from the Playwright development team are [here](https://playwright.dev/docs/test-typescript).

[Notes](https://playwright.dev/docs/best-practices) on Best Practices

There are two main ways to write tests, the [traditional](https://playwright.dev/docs/writing-tests) approach & using Playwright's Codegen to [generate](https://playwright.dev/docs/codegen-intro) tests.

#### How About Links for Test Concepts?
- [Actions](https://playwright.dev/docs/input)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Annotations](https://playwright.dev/docs/test-annotations)
- [Emulation](https://playwright.dev/docs/emulation)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Global-Setup-Teardown](https://playwright.dev/docs/test-global-setup-teardown)
- [Parallelism](https://playwright.dev/docs/test-parallel)
- [Parameterize](https://playwright.dev/docs/test-parameterize)


## Running Tests
There are a few ways to run the tests, either simply through the [termainal](https://playwright.dev/docs/running-tests) or using [UIMode](https://playwright.dev/docs/test-ui-mode).

### UI Mode
UI Mode will launch a user interface where you can start, stop, & pause tests while viewing everything you test is written to do. This is an excellent feature when attempting to debug your tests. Be sure to try it out, by using the terminal command: npx playwright test --ui

### Terminal Commands
Here are the more common commands to run tests:

npx playwright test
    Runs the end-to-end tests.

  npx playwright test --ui
    Starts the interactive UI mode.

  npx playwright test --project=chromium
    Runs the tests only on Desktop Chrome.

  npx playwright test example
    Runs the tests in a specific file.

  npx playwright test --debug
    Runs the tests in debug mode.

  npx playwright codegen
    Auto generate tests with Codegen.

  npx playwright test --grep "@petitionform" --grep-invert "@mobile"
    Runs only for desktop

But there's [more](https://playwright.dev/docs/test-cli)!