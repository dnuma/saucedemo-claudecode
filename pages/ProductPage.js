const BasePage = require('./BasePage');

class ProductPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.productName = page.locator('.inventory_details_name');
    this.productDescription = page.locator('.inventory_details_desc');
    this.productPrice = page.locator('.inventory_details_price');
    this.productImage = page.locator('.inventory_details_img');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.removeButton = page.locator('[data-test^="remove"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  /**
   * Returns the name of the product displayed on the detail page
   * @returns {Promise<string>}
   */
  async getProductName() {
    return this.productName.textContent();
  }

  /**
   * Returns the description of the product displayed on the detail page
   * @returns {Promise<string>}
   */
  async getProductDescription() {
    return this.productDescription.textContent();
  }

  /**
   * Returns the price of the product displayed on the detail page
   * @returns {Promise<string>}
   */
  async getProductPrice() {
    return this.productPrice.textContent();
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

  /**
   * Clicks the cart icon to navigate to the cart page
   * @returns {Promise<void>}
   */
  async openCart() {
    await this.cartLink.click();
  }
}

module.exports = ProductPage;
