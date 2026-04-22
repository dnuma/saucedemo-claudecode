import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { LoginPage, InventoryPage, CartPage, ProductPage } from "../pages";
import { MESSAGES, URLS } from "../lib/constants";

// ─── Authenticated navigation ─────────────────────────────────────────────────
test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.STANDARD_USER!, process.env.PASSWORD!);
    await page.waitForURL(URLS.INVENTORY);
  });

  test("cart items persist after navigating to a product page and back", async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    const [itemToAdd, itemToVisit] = faker.helpers.arrayElements(names, 2);

    await inventoryPage.addItemToCartByName(itemToAdd);
    await inventoryPage.clickItemByName(itemToVisit);

    const productPage = new ProductPage(page);
    await productPage.goBackToInventory();
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect.soft(cartPage.cartItems).toHaveCount(1);
    const cartNames = await cartPage.getItemNames();
    expect.soft(cartNames).toContain(itemToAdd);
  });

  test("logout clears the session and redirects to the login page", async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();

    const loginPage = new LoginPage(page);
    await expect.soft(page).not.toHaveURL(URLS.INVENTORY);
    await expect.soft(loginPage.loginButton).toBeVisible();
    await expect.soft(loginPage.usernameInput).toBeVisible();
  });

  test("reset app state empties the cart", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getItemNames();
    const selected = faker.helpers.arrayElements(
      names,
      faker.number.int({ min: 1, max: 3 }),
    );

    for (const name of selected) {
      await inventoryPage.addItemToCartByName(name);
    }
    await expect.soft(inventoryPage.cartBadge).toBeVisible();

    await inventoryPage.resetAppState();

    await expect.soft(inventoryPage.cartBadge).not.toBeVisible();
    await expect.soft(await inventoryPage.getCartBadgeCount()).toBe(0);
  });
});

// ─── Access control ───────────────────────────────────────────────────────────
test.describe("Access Control", () => {
  test("accessing the inventory page without logging in redirects to the login page", async ({
    page,
  }) => {
    await page.goto("/inventory.html");

    await expect.soft(page).not.toHaveURL(URLS.INVENTORY);
    const loginPage = new LoginPage(page);
    await expect.soft(loginPage.loginButton).toBeVisible();
    await expect
      .soft(loginPage.errorMessage)
      .toContainText(MESSAGES.ACCESS_DENIED_INVENTORY);
  });

  test("accessing the cart page without logging in redirects to the login page", async ({
    page,
  }) => {
    await page.goto("/cart.html");

    await expect.soft(page).not.toHaveURL(URLS.CART);
    const loginPage = new LoginPage(page);
    await expect.soft(loginPage.loginButton).toBeVisible();
    await expect
      .soft(loginPage.errorMessage)
      .toContainText(MESSAGES.ACCESS_DENIED_CART);
  });
});
