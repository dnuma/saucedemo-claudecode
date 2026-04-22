import { test, expect } from "@fixtures/testExtended.fixture";
import { LoginPage } from "@pages";
import { URLS, TIMEOUTS } from "@lib/constants";

test.describe(
  "Login Screenshots",
  {
    tag: ["@screenshots", "@visual", "@regression"],
    annotation: [
      {
        type: "Test Case",
        description: "Visual test cases using screenshots comparission",
      },
    ],
  },
  () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.navigate();
    });

    // standard_user: clean inventory — baseline for comparison against other users
    test("standard_user - inventory page after login", async ({
      page,
      standardUser,
      password,
    }) => {
      await loginPage.login(standardUser, password);
      await page.waitForURL(URLS.INVENTORY);
      await expect(page).toHaveScreenshot("standard-user-inventory.png", {
        fullPage: true,
      });
    });

    // locked_out_user: never leaves the login page — screenshot captures the error state
    test("locked_out_user - error message on login page", async ({
      page,
      lockedOutUser,
      password,
    }) => {
      await loginPage.login(lockedOutUser, password);
      await expect(page).toHaveScreenshot("locked-out-user-error.png", {
        fullPage: true,
      });
    });

    // problem_user: inventory loads but all product images are the same broken asset
    test("problem_user - inventory with broken images", async ({
      page,
      problemUser,
      password,
    }) => {
      await loginPage.login(problemUser, password);
      await page.waitForURL(URLS.INVENTORY);
      await expect(page).toHaveScreenshot("problem-user-inventory.png", {
        fullPage: true,
      });
    });

    // performance_glitch_user: login is artificially delayed — extended timeout before screenshot
    test("performance_glitch_user - inventory after delayed login", async ({
      page,
      performanceGlitchUser,
      password,
    }) => {
      await loginPage.login(performanceGlitchUser, password);
      await page.waitForURL(URLS.INVENTORY, {
        timeout: TIMEOUTS.PERFORMANCE_GLITCH,
      });
      await expect(page).toHaveScreenshot(
        "performance-glitch-user-inventory.png",
        { fullPage: true },
      );
    });

    // error_user: inventory loads normally — broken behaviour surfaces during cart interactions
    test("error_user - inventory page after login", async ({
      page,
      errorUser,
      password,
    }) => {
      await loginPage.login(errorUser, password);
      await page.waitForURL(URLS.INVENTORY);
      await expect(page).toHaveScreenshot("error-user-inventory.png", {
        fullPage: true,
      });
    });

    // visual_user: inventory loads but product images are visually mismatched
    test("visual_user - inventory with mismatched images", async ({
      page,
      visualUser,
      password,
    }) => {
      await loginPage.login(visualUser, password);
      await page.waitForURL(URLS.INVENTORY);
      // visual_user renders mismatched images that vary slightly between runs — allow 2% pixel drift
      await expect(page).toHaveScreenshot("visual-user-inventory.png", {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  },
);
