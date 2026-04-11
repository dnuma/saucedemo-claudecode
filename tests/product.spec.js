const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const { LoginPage, InventoryPage, ProductPage } = require('../pages');
const { URLS } = require('./constants');

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.STANDARD_USER, process.env.PASSWORD);
    await page.waitForURL(URLS.INVENTORY);
  });

  test('clicking a product navigates to its detail page with matching name and price', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    const prices = await inventoryPage.getItemPrices();
    const i = faker.number.int({ min: 0, max: names.length - 1 });

    await inventoryPage.clickItemByName(names[i]);

    const productPage = new ProductPage(page);
    await expect.soft(page).not.toHaveURL(URLS.INVENTORY);
    await expect.soft(productPage.productName).toHaveText(names[i]);
    await expect.soft(productPage.productPrice).toHaveText(prices[i]);
  });

  test('adding to cart from the detail page updates the cart badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    await inventoryPage.clickItemByName(faker.helpers.arrayElement(names));

    const productPage = new ProductPage(page);
    await productPage.addToCart();

    await expect.soft(productPage.cartBadge).toHaveText('1');
    await expect.soft(productPage.removeButton).toBeVisible();
    await expect.soft(productPage.addToCartButton).not.toBeVisible();
  });

  test('removing from cart on the detail page clears the cart badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    await inventoryPage.clickItemByName(faker.helpers.arrayElement(names));

    const productPage = new ProductPage(page);
    await productPage.addToCart();
    await productPage.removeFromCart();

    await expect.soft(productPage.cartBadge).not.toBeVisible();
    await expect.soft(productPage.addToCartButton).toBeVisible();
    await expect.soft(productPage.removeButton).not.toBeVisible();
  });

  test('back to products button returns to the inventory page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    await inventoryPage.clickItemByName(faker.helpers.arrayElement(names));

    const productPage = new ProductPage(page);
    await productPage.goBackToInventory();

    await expect.soft(page).toHaveURL(URLS.INVENTORY);
    await expect.soft(inventoryPage.inventoryItems).toHaveCount(6);
  });
});
