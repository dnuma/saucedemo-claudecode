import { test, expect } from "@fixtures/testExtended.fixture";
import { LoginPage, InventoryPage } from "@pages";
import { MESSAGES, URLS, INVENTORY, TIMEOUTS } from "@lib/constants";

test.describe(
  "Login test cases",
  {
    tag: ["@login", "@regression", "@smoke"],
    annotation: [{ type: "Test Case", description: "All login test cases" }],
  },
  () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.navigate();
    });

    // Standard user: baseline success path — inventory loads fully with all products
    test("standard_user - login succeeds and all 6 products are visible", async ({
      page,
      standardUser,
      password,
    }) => {
      await loginPage.login(standardUser, password);

      const inventoryPage = new InventoryPage(page);
      await expect.soft(page).toHaveURL(URLS.INVENTORY);
      await expect
        .soft(inventoryPage.title)
        .toHaveText(MESSAGES.INVENTORY_TITLE);
      await expect
        .soft(inventoryPage.inventoryItems)
        .toHaveCount(INVENTORY.TOTAL_ITEMS);
    });

    // Locked out user: login is completely blocked — never reaches inventory
    test("locked_out_user - login is rejected with a locked out error", async ({
      page,
      lockedOutUser,
      password,
    }) => {
      await loginPage.login(lockedOutUser, password);

      await expect.soft(loginPage.errorMessage).toBeVisible();
      await expect
        .soft(loginPage.errorMessage)
        .toContainText(MESSAGES.LOCKED_OUT_ERROR);
      await expect.soft(page).not.toHaveURL(URLS.INVENTORY);
    });

    // Problem user: login succeeds but all product images are the same broken asset
    test("problem_user - login succeeds but all product images are broken", async ({
      page,
      problemUser,
      password,
    }) => {
      await loginPage.login(problemUser, password);

      await expect.soft(page).toHaveURL(URLS.INVENTORY);
      const imgSrcs = await page
        .locator(".inventory_item_img img")
        .evaluateAll((imgs: HTMLImageElement[]) =>
          imgs.map((img) => img.getAttribute("src")),
        );

      expect.soft(imgSrcs).toHaveLength(INVENTORY.TOTAL_ITEMS);
      const uniqueSrcs = new Set(imgSrcs);
      expect.soft(uniqueSrcs.size).toBe(INVENTORY.UNIQUE_BROKEN_IMAGE_COUNT); // all 6 products share the same broken image
    });

    // Performance glitch user: login succeeds but the response is artificially delayed
    test("performance_glitch_user - login succeeds after a significant delay", async ({
      page,
      performanceGlitchUser,
      password,
    }) => {
      const start = Date.now();
      await loginPage.login(performanceGlitchUser, password);

      await expect
        .soft(page)
        .toHaveURL(URLS.INVENTORY, { timeout: TIMEOUTS.PERFORMANCE_GLITCH });
      const elapsed = Date.now() - start;
      expect
        .soft(elapsed)
        .toBeGreaterThan(TIMEOUTS.PERFORMANCE_GLITCH_MIN_DELAY); // artificial delay is ~5 s
    });

    // Error user: login succeeds — broken behaviour surfaces during checkout interactions, not at login
    test("error_user - login succeeds and inventory page loads", async ({
      page,
      errorUser,
      password,
    }) => {
      await loginPage.login(errorUser, password);

      const inventoryPage = new InventoryPage(page);
      await expect.soft(page).toHaveURL(URLS.INVENTORY);
      await expect
        .soft(inventoryPage.title)
        .toHaveText(MESSAGES.INVENTORY_TITLE);
      await expect
        .soft(inventoryPage.inventoryItems)
        .toHaveCount(INVENTORY.TOTAL_ITEMS);
    });

    // Visual user: login succeeds, but each product displays a mismatched image
    test("visual_user - login succeeds but product images are visually mismatched", async ({
      page,
      visualUser,
      password,
    }) => {
      await loginPage.login(visualUser, password);

      await expect.soft(page).toHaveURL(URLS.INVENTORY);
      const imgSrcs = await page
        .locator(".inventory_item_img img")
        .evaluateAll((imgs: HTMLImageElement[]) =>
          imgs.map((img) => img.getAttribute("src")),
        );

      expect.soft(imgSrcs).toHaveLength(INVENTORY.TOTAL_ITEMS);
      const uniqueSrcs = new Set(imgSrcs);
      // Unlike problem_user, each item has a distinct image src — but the images
      // are assigned to the wrong products, creating visual mismatches
      expect
        .soft(uniqueSrcs.size)
        .toBeGreaterThan(INVENTORY.UNIQUE_BROKEN_IMAGE_COUNT);
    });
  },
);
