import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage, InventoryPage } from '../pages';
import { URLS, INVENTORY, SORT } from './constants';

const parsePrice = (text: string): number => parseFloat(text.replace(/[^0-9.]/g, ''));

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.STANDARD_USER!, process.env.PASSWORD!);
    await page.waitForURL(URLS.INVENTORY);
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  test('default sort is Name A to Z', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect.soft(names).toEqual(sorted);
  });

  test('sort Name Z to A shows items in reverse alphabetical order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy(SORT.ZA);
    const names = await inventoryPage.getItemNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect.soft(names).toEqual(sorted);
  });

  test('sort Price low to high shows cheapest item first', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy(SORT.LOW_TO_HIGH);
    const prices = (await inventoryPage.getItemPrices()).map(parsePrice);
    const sorted = [...prices].sort((a, b) => a - b);
    expect.soft(prices).toEqual(sorted);
  });

  test('sort Price high to low shows most expensive item first', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy(SORT.HIGH_TO_LOW);
    const prices = (await inventoryPage.getItemPrices()).map(parsePrice);
    const sorted = [...prices].sort((a, b) => b - a);
    expect.soft(prices).toEqual(sorted);
  });

  // ── Cart badge ────────────────────────────────────────────────────────────

  test('cart badge is not visible when no items are in the cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await expect.soft(inventoryPage.cartBadge).not.toBeVisible();
  });

  test('cart badge increments correctly as items are added one by one', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    const count = faker.number.int({ min: 1, max: names.length });
    const selected = faker.helpers.arrayElements(names, count);

    for (let i = 0; i < selected.length; i++) {
      await inventoryPage.addItemToCartByName(selected[i]);
      await expect.soft(inventoryPage.cartBadge).toHaveText(String(i + 1));
    }

    await expect.soft(inventoryPage.cartBadge).toHaveText(String(INVENTORY.TOTAL_ITEMS === count ? INVENTORY.TOTAL_ITEMS : count));
  });
});
