const BasePage = require('./BasePage');

class CheckoutOverviewPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.title = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.taxAmount = page.locator('.summary_tax_label');
    this.orderTotal = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  /**
   * Returns the display names of all items listed in the order summary
   * @returns {Promise<string[]>}
   */
  async getItemNames() {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  /**
   * Returns the item subtotal label text (e.g. 'Item total: $29.99')
   * @returns {Promise<string>}
   */
  async getItemTotal() {
    return this.itemTotal.textContent();
  }

  /**
   * Returns the tax label text (e.g. 'Tax: $2.40')
   * @returns {Promise<string>}
   */
  async getTax() {
    return this.taxAmount.textContent();
  }

  /**
   * Returns the order total label text (e.g. 'Total: $32.39')
   * @returns {Promise<string>}
   */
  async getOrderTotal() {
    return this.orderTotal.textContent();
  }

  /**
   * Clicks the Finish button to place the order
   * @returns {Promise<void>}
   */
  async finish() {
    await this.finishButton.click();
  }

  /**
   * Clicks the Cancel button to return to the inventory page
   * @returns {Promise<void>}
   */
  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = CheckoutOverviewPage;
