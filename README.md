# saucedemo-claudecode

A Playwright test automation suite for [Sauce Demo](https://www.saucedemo.com), built using the Page Object Model pattern.

---

## Author

**David Numa** — [github.com/dnuma](https://github.com/dnuma)

This project was written entirely with [Claude Code](https://claude.ai/code) (Anthropic's AI CLI), with every single line of code peer reviewed by David Numa.

---

## Tech Stack

- [Playwright](https://playwright.dev) + `@playwright/test`
- JavaScript (Node.js)
- [`@faker-js/faker`](https://fakerjs.dev) — random test data generation
- `dotenv` — credential management

---

## Setup

```bash
npm install
npm run install:browsers   # install Playwright browser binaries
cp env/.env.example env/.env  # create your local credentials file
```

Credentials live in `env/.env` (gitignored). Format:

```
PASSWORD=secret_sauce
STANDARD_USER=standard_user
LOCKED_OUT_USER=locked_out_user
PROBLEM_USER=problem_user
PERFORMANCE_GLITCH_USER=performance_glitch_user
ERROR_USER=error_user
VISUAL_USER=visual_user
```

---

## Running Tests

```bash
npm test                                              # all tests, headless
npm run test:headed                                   # all tests, browser visible
npm run test:ui                                       # Playwright UI mode
npx playwright test tests/login.spec.js              # single spec file
npx playwright test --grep "sort"                    # filter by test title
npx playwright test tests/screenshots.spec.js --update-snapshots  # refresh visual baselines
```

---

## Test Coverage

| Spec                  | Description                                                       | Tests  |
| :-------------------- | :---------------------------------------------------------------- | :----: |
| `login.spec.js`       | Login behaviour for all 6 SauceDemo users                         |   6    |
| `screenshots.spec.js` | Visual regression baselines per user                              |   6    |
| `checkout.spec.js`    | Happy path + edge cases (empty cart, validation, cancel, refresh) |   16   |
| `inventory.spec.js`   | Sorting (A→Z, Z→A, price) and cart badge                          |   6    |
| `product.spec.js`     | Product detail page — navigation, cart interactions               |   4    |
| `navigation.spec.js`  | Cart persistence, logout, reset state, access control             |   5    |
| **Total**             |                                                                   | **43** |

---

## Project Structure

```
pages/          Page Object Model classes (one per SauceDemo page)
  index.js      Barrel export — import all pages from here
tests/
  constants.js  Shared strings, URLs, and numeric values
  *.spec.js     Test specs
env/
  .env          Local credentials (gitignored)
playwright.config.js
```

---

## Architecture Notes

- All page objects extend `BasePage` and receive the Playwright `page` fixture in their constructor.
- All assertions use `expect.soft()` so every check in a test runs and is reported even if one fails.
- `tests/constants.js` is the single source of truth for hardcoded strings and values — nothing is inlined in specs.
- The checkout happy-path tests use `test.describe.serial` with a shared browser session to preserve cart state across tests.
- `@faker-js/faker` is used throughout for random product selection and shipping info generation.
