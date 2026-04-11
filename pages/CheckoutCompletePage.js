const BasePage = require('./BasePage');

class CheckoutCompletePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.confirmationHeader = page.locator('.complete-header');
    this.confirmationText = page.locator('.complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /**
   * Returns the confirmation header text (e.g. 'Thank you for your order!')
   * @returns {Promise<string>}
   */
  async getConfirmationHeader() {
    return this.confirmationHeader.textContent();
  }

  /**
   * Returns the confirmation body text displayed below the header
   * @returns {Promise<string>}
   */
  async getConfirmationText() {
    return this.confirmationText.textContent();
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
