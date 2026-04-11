# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playwright test automation for [Sauce Demo](https://www.saucedemo.com) using the Page Object Model (POM) pattern.

## Setup

```bash
npm install
npm run install:browsers   # installs Playwright browser binaries
```

## Commands

```bash
npm test                   # run all tests (headless)
npm run test:headed        # run with browser visible
npm run test:ui            # Playwright UI mode
npm run test:report        # open last HTML report

# Run a single test file
npx playwright test tests/login.spec.js

# Run tests matching a title pattern
npx playwright test --grep "should login"
```

## Architecture

```
pages/          # Page Object Model classes
  index.js      # barrel export — import all pages from here
  BasePage.js   # base class: navigate(), getTitle(), getURL()
  LoginPage.js
  InventoryPage.js
  ProductPage.js
  CartPage.js
  CheckoutPage.js          # step 1 — shipping info form
  CheckoutOverviewPage.js  # step 2 — order summary
  CheckoutCompletePage.js  # confirmation screen
tests/          # Playwright test specs (.spec.js)
playwright.config.js   # baseURL, reporter, browser projects
```

Each page object extends `BasePage`, receives the Playwright `page` fixture in its constructor, and exposes locators as instance properties plus action methods. Tests import page classes from `pages/index.js`.

## SauceDemo test credentials

| User | Password |
|---|---|
| `standard_user` | `secret_sauce` |
| `locked_out_user` | `secret_sauce` |
| `problem_user` | `secret_sauce` |
| `performance_glitch_user` | `secret_sauce` |
| `error_user` | `secret_sauce` |
| `visual_user` | `secret_sauce` |
