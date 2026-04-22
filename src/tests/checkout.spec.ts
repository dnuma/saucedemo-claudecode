import { test, expect, Page } from "@fixtures/testExtended.fixture";
import { faker } from "@faker-js/faker";
import {
  LoginPage,
  InventoryPage,
  CartPage,
  CheckoutPage,
  CheckoutOverviewPage,
  CheckoutCompletePage,
} from "@pages";
import { MESSAGES, URLS, INVENTORY } from "@lib/constants";
import { CartItem, ShippingInfo } from "@interfaces/checkout.interface";

const parsePrice = (text: string): number =>
  parseFloat(text.replace(/[^0-9.]/g, ""));

// ─── Happy Path ───────────────────────────────────────────────────────────────
// Serial mode keeps a single browser session across all tests so cart and
// checkout state is preserved from one test to the next.
test.describe.serial(
  "Checkout - Happy Path",
  {
    tag: ["@checkout", "@regression", "@smokeTesting"],
    annotation: [{ type: "Test Case", description: "Checkout test cases, happy path only" }],
  },
  () => {
    let sharedPage!: Page;
    let cartItems: CartItem[] = [];
    let shippingInfo!: ShippingInfo;

    test.beforeAll(async ({ browser, standardUser, password }) => {
      sharedPage = await browser.newPage();

      const loginPage = new LoginPage(sharedPage);
      await loginPage.navigate();
      await loginPage.login(standardUser, password);
      await sharedPage.waitForURL(URLS.INVENTORY);

      // Fetch every product name and price from the inventory
      const inventoryPage = new InventoryPage(sharedPage);
      const allNames = await inventoryPage.getItemNames();
      const allPrices = await inventoryPage.getItemPrices();

      // Pick a random subset (1–4 items) and add each to the cart
      const count = faker.number.int({ min: 1, max: 4 });
      const indices = faker.helpers.arrayElements(
        [...Array(allNames.length).keys()],
        count,
      );

      for (const i of indices) {
        const price = parseFloat(allPrices[i].replace("$", "").trim());
        cartItems.push({ name: allNames[i], price });
        await inventoryPage.addItemToCartByName(allNames[i]);
      }

      shippingInfo = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        postalCode: faker.location.zipCode("#####"),
      };
    });

    test.afterAll(async () => {
      await sharedPage.close();
    });

    // ── Test 1 ────────────────────────────────────────────────────────────────
    test("randomly selected items appear in the cart with correct prices", async () => {
      const cartPage = new CartPage(sharedPage);
      await cartPage.navigate();

      await expect.soft(cartPage.cartItems).toHaveCount(cartItems.length);

      const cartNames = await cartPage.getItemNames();
      const cartPrices = await cartPage.getItemPrices();

      for (const { name, price } of cartItems) {
        const index = cartNames.indexOf(name);
        expect
          .soft(index, `"${name}" should be in the cart`)
          .toBeGreaterThanOrEqual(0);
        const cartPrice = parseFloat(cartPrices[index].replace("$", "").trim());
        expect
          .soft(cartPrice, `price of "${name}" in cart`)
          .toBeCloseTo(price, 2);
      }
    });

    // ── Test 2 ────────────────────────────────────────────────────────────────
    test("checkout overview lists each item at the correct price", async () => {
      const cartPage = new CartPage(sharedPage);
      await cartPage.navigate();
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(sharedPage);
      await checkoutPage.fillShippingInfo(
        shippingInfo.firstName,
        shippingInfo.lastName,
        shippingInfo.postalCode,
      );
      await checkoutPage.continue();
      await sharedPage.waitForURL(URLS.CHECKOUT_OVERVIEW);

      const overviewPage = new CheckoutOverviewPage(sharedPage);
      const overviewNames = await overviewPage.getItemNames();
      const overviewPrices = await overviewPage.getItemPrices();

      for (const { name, price } of cartItems) {
        const index = overviewNames.indexOf(name);
        expect
          .soft(index, `"${name}" should appear in the overview`)
          .toBeGreaterThanOrEqual(0);
        const overviewPrice = parseFloat(
          overviewPrices[index].replace("$", "").trim(),
        );
        expect
          .soft(overviewPrice, `price of "${name}" in overview`)
          .toBeCloseTo(price, 2);
      }
    });

    // ── Test 3 ────────────────────────────────────────────────────────────────
    test("overview subtotal matches the sum of individual item prices", async () => {
      const overviewPage = new CheckoutOverviewPage(sharedPage);
      const subtotal = parseFloat(
        (await overviewPage.getItemTotal()).replace("Item total: $", "").trim(),
      );

      const expectedSubtotal = parseFloat(
        cartItems.reduce((sum, { price }) => sum + price, 0).toFixed(2),
      );

      expect
        .soft(subtotal, "subtotal should equal sum of item prices")
        .toBeCloseTo(expectedSubtotal, 2);
    });

    // ── Test 4 ────────────────────────────────────────────────────────────────
    test("overview total equals subtotal plus tax", async () => {
      const overviewPage = new CheckoutOverviewPage(sharedPage);

      const subtotal = parseFloat(
        (await overviewPage.getItemTotal()).replace("Item total: $", "").trim(),
      );
      const tax = parseFloat(
        (await overviewPage.getTax()).replace("Tax: $", "").trim(),
      );
      const total = parseFloat(
        (await overviewPage.getOrderTotal()).replace("Total: $", "").trim(),
      );

      expect
        .soft(total, "total should equal subtotal + tax")
        .toBeCloseTo(subtotal + tax, 2);
    });

    // ── Test 5 ────────────────────────────────────────────────────────────────
    test("order completes successfully after finishing checkout", async () => {
      const overviewPage = new CheckoutOverviewPage(sharedPage);
      await overviewPage.finish();

      const completePage = new CheckoutCompletePage(sharedPage);
      await sharedPage.waitForURL(URLS.CHECKOUT_COMPLETE);
      await expect.soft(completePage.confirmationHeader).toBeVisible();
      await expect
        .soft(completePage.confirmationHeader)
        .toContainText(MESSAGES.ORDER_COMPLETE_HEADER);
    });
  },
);

// ─── Edge Cases ───────────────────────────────────────────────────────────────
test.describe(
  "Checkout - Edge Cases",
  {
    tag: ["@checkout", "@regression"],
    annotation: [
      {
        type: "Test Case",
        description: "Checkout test cases, edge cases",
      },
    ],
  },
  () => {
    test.beforeEach(async ({ page, standardUser, password }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(standardUser, password);
      await page.waitForURL(URLS.INVENTORY);
    });

    async function goToOverview(
      page: Page,
      itemName: string,
    ): Promise<CheckoutOverviewPage> {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(itemName);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();
      await page.waitForURL(URLS.CHECKOUT_OVERVIEW);

      return new CheckoutOverviewPage(page);
    }

    // ── EC-01 ──────────────────────────────────────────────────────────────────
    test("missing first name shows validation error", async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(INVENTORY.PRODUCT_BACKPACK);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        "",
        faker.person.lastName(),
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();

      await expect.soft(checkoutPage.errorMessage).toBeVisible();
      await expect
        .soft(checkoutPage.errorMessage)
        .toContainText(MESSAGES.ERROR_FIRST_NAME_REQUIRED);
      await expect.soft(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    });

    // ── EC-02 ──────────────────────────────────────────────────────────────────
    test("missing last name shows validation error", async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(INVENTORY.PRODUCT_BACKPACK);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        "",
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();

      await expect.soft(checkoutPage.errorMessage).toBeVisible();
      await expect
        .soft(checkoutPage.errorMessage)
        .toContainText(MESSAGES.ERROR_LAST_NAME_REQUIRED);
      await expect.soft(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    });

    // ── EC-03 ──────────────────────────────────────────────────────────────────
    test("missing postal code shows validation error", async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(INVENTORY.PRODUCT_BACKPACK);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        faker.person.lastName(),
        "",
      );
      await checkoutPage.continue();

      await expect.soft(checkoutPage.errorMessage).toBeVisible();
      await expect
        .soft(checkoutPage.errorMessage)
        .toContainText(MESSAGES.ERROR_POSTAL_CODE_REQUIRED);
      await expect.soft(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    });

    // ── EC-04 ──────────────────────────────────────────────────────────────────
    test("all fields empty shows first name validation error", async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(INVENTORY.PRODUCT_BACKPACK);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo("", "", "");
      await checkoutPage.continue();

      await expect.soft(checkoutPage.errorMessage).toBeVisible();
      await expect
        .soft(checkoutPage.errorMessage)
        .toContainText(MESSAGES.ERROR_FIRST_NAME_REQUIRED);
      await expect.soft(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
    });

    // ── EC-05 ──────────────────────────────────────────────────────────────────
    test("cancelling checkout step 1 returns to cart with items intact", async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addItemToCartByName(INVENTORY.PRODUCT_BACKPACK);
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.cancel();

      await expect.soft(page).toHaveURL(URLS.CART);
      await expect.soft(cartPage.cartItems).toHaveCount(1);
    });

    // ── EC-06 ──────────────────────────────────────────────────────────────────
    test("cancelling checkout overview returns to inventory", async ({
      page,
    }) => {
      const overviewPage = await goToOverview(page, INVENTORY.PRODUCT_BACKPACK);
      await overviewPage.cancel();

      await expect.soft(page).toHaveURL(URLS.INVENTORY);
    });

    // ── EC-07 ──────────────────────────────────────────────────────────────────
    test("removing an item from the cart updates the count correctly", async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      const allNames = await inventoryPage.getItemNames();
      const [firstItem, secondItem] = faker.helpers.arrayElements(allNames, 2);

      await inventoryPage.addItemToCartByName(firstItem);
      await inventoryPage.addItemToCartByName(secondItem);
      await expect.soft(inventoryPage.cartBadge).toHaveText("2");

      await inventoryPage.openCart();
      const cartPage = new CartPage(page);
      await cartPage.removeItemByName(firstItem);

      await expect.soft(cartPage.cartItems).toHaveCount(1);
      await expect.soft(inventoryPage.cartBadge).toHaveText("1");

      const remaining = await cartPage.getItemNames();
      expect.soft(remaining[0]).toBe(secondItem);
    });

    // ── EC-08 ──────────────────────────────────────────────────────────────────
    test("checking out with an empty cart shows zero totals", async ({
      page,
    }) => {
      const cartPage = new CartPage(page);
      await cartPage.navigate();

      await expect.soft(cartPage.cartItems).toHaveCount(0);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();
      await page.waitForURL(URLS.CHECKOUT_OVERVIEW);

      const overviewPage = new CheckoutOverviewPage(page);
      expect.soft(parsePrice(await overviewPage.getItemTotal())).toBe(0);
      expect.soft(parsePrice(await overviewPage.getTax())).toBe(0);
      expect.soft(parsePrice(await overviewPage.getOrderTotal())).toBe(0);
    });

    // ── EC-09 ──────────────────────────────────────────────────────────────────
    test("adding all 6 items shows correct overview and totals", async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      const allNames = await inventoryPage.getItemNames();
      const allPrices = await inventoryPage.getItemPrices();

      for (const name of allNames) {
        await inventoryPage.addItemToCartByName(name);
      }
      await expect
        .soft(inventoryPage.cartBadge)
        .toHaveText(String(INVENTORY.TOTAL_ITEMS));

      await inventoryPage.openCart();
      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();
      await page.waitForURL(URLS.CHECKOUT_OVERVIEW);

      const overviewPage = new CheckoutOverviewPage(page);
      const overviewNames = await overviewPage.getItemNames();

      await expect
        .soft(overviewPage.cartItems)
        .toHaveCount(INVENTORY.TOTAL_ITEMS);
      for (const name of allNames) {
        expect
          .soft(overviewNames, `"${name}" should be in overview`)
          .toContain(name);
      }

      const expectedSubtotal = parseFloat(
        allPrices.reduce((sum, p) => sum + parsePrice(p), 0).toFixed(2),
      );
      expect
        .soft(parsePrice(await overviewPage.getItemTotal()))
        .toBeCloseTo(expectedSubtotal, 2);
    });

    // ── EC-10 ──────────────────────────────────────────────────────────────────
    test("back home after order completion returns to inventory with empty cart", async ({
      page,
    }) => {
      const overviewPage = await goToOverview(page, INVENTORY.PRODUCT_BACKPACK);
      await overviewPage.finish();
      await page.waitForURL(URLS.CHECKOUT_COMPLETE);

      const completePage = new CheckoutCompletePage(page);
      await completePage.backToHome();

      await expect.soft(page).toHaveURL(URLS.INVENTORY);
      const inventoryPage = new InventoryPage(page);
      await expect.soft(inventoryPage.cartBadge).not.toBeVisible();
    });

    // ── EC-11 ──────────────────────────────────────────────────────────────────
    test("refreshing the checkout overview preserves all items and totals", async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      const allNames = await inventoryPage.getItemNames();
      const allPrices = await inventoryPage.getItemPrices();

      const count = faker.number.int({ min: 1, max: 4 });
      const indices = faker.helpers.arrayElements(
        [...Array(allNames.length).keys()],
        count,
      );
      const selectedItems = indices.map((i) => ({
        name: allNames[i],
        price: parsePrice(allPrices[i]),
      }));

      for (const { name } of selectedItems) {
        await inventoryPage.addItemToCartByName(name);
      }

      await inventoryPage.openCart();
      const cartPage = new CartPage(page);
      await cartPage.proceedToCheckout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.location.zipCode("#####"),
      );
      await checkoutPage.continue();
      await page.waitForURL(URLS.CHECKOUT_OVERVIEW);

      await page.reload();
      await expect.soft(page).toHaveURL(URLS.CHECKOUT_OVERVIEW);

      const overviewPage = new CheckoutOverviewPage(page);
      const overviewNames = await overviewPage.getItemNames();

      await expect
        .soft(overviewPage.cartItems)
        .toHaveCount(selectedItems.length);
      for (const { name } of selectedItems) {
        expect
          .soft(overviewNames, `"${name}" should survive page reload`)
          .toContain(name);
      }

      const expectedSubtotal = parseFloat(
        selectedItems.reduce((sum, { price }) => sum + price, 0).toFixed(2),
      );
      expect
        .soft(parsePrice(await overviewPage.getItemTotal()))
        .toBeCloseTo(expectedSubtotal, 2);
    });
  },
);
