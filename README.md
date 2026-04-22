# saucedemo-claudecode

A Playwright test automation suite for [Sauce Demo](https://www.saucedemo.com), built with TypeScript and the Page Object Model pattern.

---

## Author

**David Numa** — [github.com/dnuma](https://github.com/dnuma)

Architected, designed, implemented, and reviewed by David Numa, using [Claude Code](https://claude.ai/code) (Anthropic's AI CLI) as a development tool.

---

## Tech Stack

- [Playwright](https://playwright.dev) + `@playwright/test`
- TypeScript
- [`@faker-js/faker`](https://fakerjs.dev) — random test data generation
- `dotenv` — credential management

---

## Setup

```bash
npm install
npm run install:browsers   # install Playwright browser binaries
```

The `env/.env` is not gitignored because this is a well known public demo site, but in real practice the env MUST be gitignored.

---

## Running Tests

```bash
npm test                                                              # all tests, headless
npm run test:headed                                                   # all tests, browser visible
npm run test:ui                                                       # Playwright UI mode
npm run test:report                                                   # open last HTML report
npx playwright test src/tests/login.spec.ts                          # single spec file
npx playwright test --grep "sort"                                     # filter by test title
npx playwright test --grep "@smoke"                                   # filter by tag
npx playwright test src/tests/screenshots.spec.ts --update-snapshots # refresh visual baselines
```

---

## Test Coverage

| Spec                    | Tags                                  | Description                                                       | Tests  |
| :---------------------- | :------------------------------------ | :---------------------------------------------------------------- | :----: |
| `login.spec.ts`         | `@login` `@smoke` `@regression`       | Login behaviour for all 6 SauceDemo users                         |   6    |
| `screenshots.spec.ts`   | `@screenshots` `@visual` `@regression`| Visual regression baselines per user                              |   6    |
| `checkout.spec.ts`      | `@checkout` `@regression`             | Happy path + edge cases (validation, cancel, empty cart, refresh) |   16   |
| `inventory.spec.ts`     | `@inventory` `@smoke` `@regression`   | Sorting (A→Z, Z→A, price) and cart badge                          |   6    |
| `product.spec.ts`       | `@product` `@smoke` `@regression`     | Product detail page — navigation, cart interactions               |   4    |
| `navigation.spec.ts`    | `@navigation` `@accessControl` `@regression` | Cart persistence, logout, reset state, access control      |   5    |
| **Total**               |                                       |                                                                   | **43** |

---

## Project Structure

```
src/
  fixtures/
    testExtended.fixture.ts   Extended test object — credential fixtures for all 7 users
  interfaces/
    checkout.interface.ts     CartItem and ShippingInfo types shared across checkout tests
  lib/
    constants.ts              Single source of truth for all strings, URLs, and numeric values
  pages/                      Page Object Model classes (one per SauceDemo page)
    BasePage.ts               Parent class — navigate()
    LoginPage.ts
    InventoryPage.ts
    ProductPage.ts
    CartPage.ts
    CheckoutPage.ts           Step 1 — shipping info form
    CheckoutOverviewPage.ts   Step 2 — order summary
    CheckoutCompletePage.ts   Confirmation screen
    index.ts                  Barrel export — always import pages from here
  tests/
    login.spec.ts
    screenshots.spec.ts
    checkout.spec.ts
    inventory.spec.ts
    product.spec.ts
    navigation.spec.ts
    screenshots.spec.ts-snapshots/   Visual baselines (committed, per browser + OS)
env/
  .env                        Local credentials (gitignored)
playwright.config.ts          baseURL, testDir, reporter, browser projects
tsconfig.json                 TypeScript config with path aliases
```

### Path aliases

Configured in `tsconfig.json` for clean imports across the project:

| Alias           | Resolves to              |
| :-------------- | :----------------------- |
| `@pages`        | `src/pages/index.ts`     |
| `@lib/*`        | `src/lib/*`              |
| `@fixtures/*`   | `src/fixtures/*`         |
| `@interfaces/*` | `src/interfaces/*`       |

---

## Architecture Notes

- **Page objects** extend `BasePage`, receive the Playwright `page` fixture in their constructor, and expose locators as `readonly` properties.
- **All assertions use `expect.soft()`** so every check in a test runs and is reported even if one fails.
- **Fixtures** (`testExtended.fixture.ts`) extend Playwright's base `test` with credential fixtures for all 7 users — eliminating `process.env` reads scattered across test files. Tests import `{ test, expect }` from the fixture instead of `@playwright/test`.
- **`src/lib/constants.ts`** is the single source of truth for hardcoded strings, URL patterns, sort option values, and timeouts — nothing is inlined in specs.
- **`test.describe.serial`** is used in `checkout.spec.ts` (happy path) to share a single browser session across 5 sequential tests, preserving cart and checkout state without repeating setup.
- **`@faker-js/faker`** is used throughout for random product selection, random item counts, and generated shipping info.
- **Tags** on every `describe` block allow running subsets of tests — e.g. `--grep "@smoke"` runs the fast functional baseline.

---

## To Do

Things that would be automated given more time:

- **Cross-browser coverage** — extend `playwright.config.ts` to run the full suite against Firefox and WebKit, not just Chromium.
- **Authenticated state via `storageState`** — save a logged-in session to disk once and reuse it across all tests that don't specifically test login, removing the `loginPage.navigate() / login()` boilerplate from every `beforeEach`.
- **`error_user` cart interaction tests** — this user's add-to-cart is silently broken; dedicated tests should assert that the cart badge does *not* update and surface the failure explicitly rather than relying on the happy-path tests to catch it incidentally.
- **`problem_user` and `visual_user` checkout flows** — verify that broken images don't block the purchase flow and that prices/totals remain correct despite the visual defects.
- **Accessibility audit** — integrate [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) and run an a11y scan on the inventory, cart, and checkout pages.
- **Performance assertions on `performance_glitch_user`** — capture `page.metrics()` or the Playwright `trace` timing data to assert an upper bound on login delay, not just a lower bound.
- **CI/CD pipeline** — a GitHub Actions workflow that installs dependencies, runs the full suite in headless mode, and uploads the HTML report as an artifact on every push to `main`.
- **More visual regression coverage** — screenshots currently only capture the inventory page per user; extend to cart, checkout overview, and the order-complete screen.
- **Negative access-control cases** — attempt direct navigation to `/checkout-step-one.html` and `/checkout-step-two.html` without going through the normal flow, asserting the correct redirect or error.

---

## SauceDemo Users

All passwords are `secret_sauce`.

| Username                | Behaviour                                                  |
| :---------------------- | :--------------------------------------------------------- |
| `standard_user`         | Happy path — full functional baseline                      |
| `locked_out_user`       | Login blocked — "locked out" error shown                   |
| `problem_user`          | Logs in but all product images are the same broken asset   |
| `performance_glitch_user` | Logs in with an artificial ~5 s delay                    |
| `error_user`            | Logs in but cart interactions are silently broken          |
| `visual_user`           | Logs in but product images are visually mismatched         |
