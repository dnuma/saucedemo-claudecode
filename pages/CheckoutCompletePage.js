const BasePage = require('./BasePage');

class CheckoutCompletePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.confirmationHeader = page.locator('.complete-header');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /**
   * Clicks the Back Home button to return to the inventory page
   * @returns {Promise<void>}
   */
  async backToHome() {
    await this.backHomeButton.click();
  }
}

module.exports = CheckoutCompletePage;
