import { test, expect } from '@playwright/test';
import { LoginPage, InventoryPage } from '../pages';
import { MESSAGES, URLS, INVENTORY, TIMEOUTS } from './constants';

test.describe('Login test cases', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // Standard user: baseline success path — inventory loads fully with all products
  test('standard_user - login succeeds and all 6 products are visible', async ({ page }) => {
    await loginPage.login(process.env.STANDARD_USER!, process.env.PASSWORD!);

    const inventoryPage = new InventoryPage(page);
    await expect.soft(page).toHaveURL(URLS.INVENTORY);
    await expect.soft(inventoryPage.title).toHaveText(MESSAGES.INVENTORY_TITLE);
    await expect.soft(inventoryPage.inventoryItems).toHaveCount(INVENTORY.TOTAL_ITEMS);
  });

  // Locked out user: login is completely blocked — never reaches inventory
  test('locked_out_user - login is rejected with a locked out error', async ({ page }) => {
    await loginPage.login(process.env.LOCKED_OUT_USER!, process.env.PASSWORD!);

    await expect.soft(loginPage.errorMessage).toBeVisible();
    await expect.soft(loginPage.errorMessage).toContainText(MESSAGES.LOCKED_OUT_ERROR);
    await expect.soft(page).not.toHaveURL(URLS.INVENTORY);
  });

  // Problem user: login succeeds but all product images are the same broken asset
  test('problem_user - login succeeds but all product images are broken', async ({ page }) => {
    await loginPage.login(process.env.PROBLEM_USER!, process.env.PASSWORD!);

    await expect.soft(page).toHaveURL(URLS.INVENTORY);
    const imgSrcs = await page
      .locator('.inventory_item_img img')
      .evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src')));

    expect.soft(imgSrcs).toHaveLength(INVENTORY.TOTAL_ITEMS);
    const uniqueSrcs = new Set(imgSrcs);
    expect.soft(uniqueSrcs.size).toBe(INVENTORY.UNIQUE_BROKEN_IMAGE_COUNT); // all 6 products share the same broken image
  });

  // Performance glitch user: login succeeds but the response is artificially delayed
  test('performance_glitch_user - login succeeds after a significant delay', async ({ page }) => {
    const start = Date.now();
    await loginPage.login(process.env.PERFORMANCE_GLITCH_USER!, process.env.PASSWORD!);

    await expect.soft(page).toHaveURL(URLS.INVENTORY, { timeout: TIMEOUTS.PERFORMANCE_GLITCH });
    const elapsed = Date.now() - start;
    expect.soft(elapsed).toBeGreaterThan(TIMEOUTS.PERFORMANCE_GLITCH_MIN_DELAY); // artificial delay is ~5 s
  });

  // Error user: login succeeds — broken behaviour surfaces during checkout interactions, not at login
  test('error_user - login succeeds and inventory page loads', async ({ page }) => {
    await loginPage.login(process.env.ERROR_USER!, process.env.PASSWORD!);

    const inventoryPage = new InventoryPage(page);
    await expect.soft(page).toHaveURL(URLS.INVENTORY);
    await expect.soft(inventoryPage.title).toHaveText(MESSAGES.INVENTORY_TITLE);
    await expect.soft(inventoryPage.inventoryItems).toHaveCount(INVENTORY.TOTAL_ITEMS);
  });

  // Visual user: login succeeds, but each product displays a mismatched image
  test('visual_user - login succeeds but product images are visually mismatched', async ({ page }) => {
    await loginPage.login(process.env.VISUAL_USER!, process.env.PASSWORD!);

    await expect.soft(page).toHaveURL(URLS.INVENTORY);
    const imgSrcs = await page
      .locator('.inventory_item_img img')
      .evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src')));

    expect.soft(imgSrcs).toHaveLength(INVENTORY.TOTAL_ITEMS);
    const uniqueSrcs = new Set(imgSrcs);
    // Unlike problem_user, each item has a distinct image src — but the images
    // are assigned to the wrong products, creating visual mismatches
    expect.soft(uniqueSrcs.size).toBeGreaterThan(INVENTORY.UNIQUE_BROKEN_IMAGE_COUNT);
  });
});
