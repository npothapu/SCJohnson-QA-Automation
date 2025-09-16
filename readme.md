# Playwright Seed Project

Clean, minimal Playwright setup with multi-browser projects, environment-based config, and an auth setup flow.

## Prerequisites
- Node.js installed
- VS Code extensions (optional): Playwright Test, Prettier

## Setup
Run these at the project root:

```cmd
npm install
npx playwright install
```

## Environment
- Env file path: `utils/env/.env`
- Required vars (examples):
  - `STG_BASE_URL`, `STG_UID`, `STG_PWD`
  - `PROD_BASE_URL`
- ENV selection is handled by npm scripts below. `STAGE` is normalized to `STG`.

## Running tests
Preferred (uses cross-env; works on Windows/macOS/Linux):

```cmd
npm run test:stg    
npm run test:prod   
npm run test:dev    
npm run test:qa     
npm run test:stage  
```

### Run by tag(s)
Use --grep with a tag in your test title (e.g., "@smoke"). You can pass CLI flags after -- when using npm scripts. Tags in this repo include: `@smoke`, `@regression`, `@header-navigation`, `@footer-navigation`, `@link-crawl`.

```cmd
# Direct CLI
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"
npx playwright test --grep "@header-navigation"
npx playwright test --grep "@footer-navigation"
npx playwright test --grep "@link-crawl"
npx playwright test --grep "@smoke|@regression"  

# Via npm scripts (examples)
npm run test:stg -- --grep "@smoke"
npm run test:prod -- --grep "@regression"
npm run test:stg -- --grep "@header-navigation"
npm run test:stg -- --grep "@footer-navigation"
npm run test:stg -- --grep "@smoke|@regression"
```

PowerShell examples (quoting behavior differs from cmd):

```powershell
# Direct CLI
npx playwright test --grep '@smoke'
npx playwright test --grep '@smoke|@regression'
```

Troubleshooting (PowerShell): If you see "Unknown env config 'grep'" or Playwright logs "No tests found" and echoes just "@smoke", run Playwright directly (avoid npm scripts in PowerShell):

```powershell
cross-env ENV=stg npx playwright test -g '@smoke'
```


Note: Some tests also include a tag based on the link name (e.g., `@Impact Stories`). For tags with spaces, keep the quotes, for example:

```cmd
npx playwright test --grep "@Impact Stories"
```

Common Playwright commands:

```cmd
npx playwright test --ui
npx playwright test --project=chromium
npx playwright test --grep "@petitionform" --grep-invert "@mobile"
```

## Auth setup
- A dedicated "setup" project runs `tests/auth.setup.ts` and creates `playwright/.auth/user.json`.
- Other projects depend on setup and reuse `storageState` in STG only.

## References
- Best practices: https://playwright.dev/docs/best-practices
- CLI: https://playwright.dev/docs/test-cli