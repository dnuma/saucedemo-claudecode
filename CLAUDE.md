# CLAUDE.md

Guidelines and context for Claude Code working in the Sauce Demo Playwright repository.

## Project Context
* **Target:** [Sauce Demo](https://www.saucedemo.com)
* **Tech Stack:** Playwright (Node.js), TypeScript, `@faker-js/faker` for random test data
* **Pattern:** Page Object Model (POM) with centralized barrel exports

## Setup
```bash
npm install                  # Install dependencies (includes @playwright/test, dotenv, @faker-js/faker)
npm run install:browsers     # Install Playwright browser binaries
```

Credentials are loaded from `env/.env` via `dotenv.config({ path: './env/.env' })` at the top of `playwright.config.ts`. The `env/` directory is gitignored — recreate it locally if missing.

## Commands
```bash
npm test                             # Run all tests (headless)
npm run test:headed                  # Run tests with browser visible
npm run test:ui                      # Open Playwright UI Mode
npm run test:report                  # View last HTML report
npx playwright test tests/login.spec.ts          # Run a single spec file
npx playwright test --grep "sort"                # Run tests matching a title pattern
npx playwright test tests/screenshots.spec.ts --update-snapshots  # Regenerate visual baselines
```

## Architecture

```
pages/          Page Object Model classes
  BasePage.ts       Parent class: navigate()
  index.ts          Barrel export — always import pages from here
  LoginPage.ts
  InventoryPage.ts
  ProductPage.ts
  CartPage.ts
  CheckoutPage.ts           Step 1 — shipping info form
  CheckoutOverviewPage.ts   Step 2 — order summary
  CheckoutCompletePage.ts   Confirmation screen
tests/
  constants.ts      Shared MESSAGES, URLS, INVENTORY, SORT, TIMEOUTS — import here instead of hardcoding strings
  login.spec.ts
  screenshots.spec.ts
  checkout.spec.ts
  inventory.spec.ts
  product.spec.ts
  navigation.spec.ts
  screenshots.spec.ts-snapshots/   Visual baselines (committed, per browser+OS)
env/
  .env              Credentials — gitignored, must be created locally
playwright.config.ts   baseURL, reporter, browser projects, dotenv loader
tsconfig.json          TypeScript compiler options
```

## Conventions
* **Page objects** extend `BasePage`, receive the Playwright `page` fixture in the constructor, and expose locators as instance properties and interactions as named methods.
* **All assertions use `expect.soft()`** so every check in a test runs and is reported even if one fails.
* **`test.describe.serial`** is used in `checkout.spec.ts` (happy path) to share a single browser session across tests, preserving cart and checkout state without repeating setup.
* **`tests/constants.ts`** is the single source of truth for all hardcoded strings, URLs, and numeric values. Add new constants there rather than inlining them in specs.
* **`@faker-js/faker`** is used for random product selection and shipping info generation. Import as `import { faker } from '@faker-js/faker'`.
* **`process.env`** variables are typed as `string | undefined` in TypeScript — use the non-null assertion (`!`) at call sites where the env var is guaranteed to be set via `env/.env`.

## Known selector quirks
* The inventory sort dropdown does **not** have a `data-test` attribute on this version of SauceDemo. Use `.product_sort_container` (class selector) — do not change it back to `[data-test="product_sort_container"]`.

## SauceDemo test credentials
All passwords are `secret_sauce`. Stored in `env/.env`.

| Username | Behaviour |
| :--- | :--- |
| `standard_user` | Happy path / functional baseline |
| `locked_out_user` | Login blocked — "locked out" error shown |
| `problem_user` | Logs in but all product images are the same broken asset |
| `performance_glitch_user` | Logs in with an artificial ~5 s delay |
| `error_user` | Logs in but cart interactions are silently broken |
| `visual_user` | Logs in but product images are visually mismatched |
