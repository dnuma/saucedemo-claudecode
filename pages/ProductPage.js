const BasePage = require('./BasePage');

class ProductPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.productName = page.locator('.inventory_details_name');
    this.productPrice = page.locator('.inventory_details_price');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.removeButton = page.locator('[data-test^="remove"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  /**
   * Clicks the Add to Cart button on the product detail page
   * @returns {Promise<void>}
   */
  async addToCart() {
    await this.addToCartButton.click();
  }

  /**
   * Clicks the Remove button to remove the product from the cart
   * @returns {Promise<void>}
   */
  async removeFromCart() {
    await this.removeButton.click();
  }

  /**
   * Clicks the back button to return to the inventory page
   * @returns {Promise<void>}
   */
  async goBackToInventory() {
    await this.backButton.click();
  }
}

module.exports = ProductPage;
