const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.title = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Fills in the shipping information form fields
   * @param {string} firstName - The shopper's first name
   * @param {string} lastName - The shopper's last name
   * @param {string} postalCode - The shipping postal code
   * @returns {Promise<void>}
   */
  async fillShippingInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Clicks the Continue button to proceed to the order overview
   * @returns {Promise<void>}
   */
  async continue() {
    await this.continueButton.click();
  }

  /**
   * Clicks the Cancel button to return to the cart page
   * @returns {Promise<void>}
   */
  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = CheckoutPage;
