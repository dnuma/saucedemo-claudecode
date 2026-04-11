const BasePage = require('./BasePage');

class CartPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.title = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /**
   * Navigates directly to the cart page
   * @returns {Promise<void>}
   */
  async navigate() {
    await super.navigate('/cart.html');
  }

  /**
   * Returns the number of items currently in the cart
   * @returns {Promise<number>}
   */
  async getCartItemCount() {
    return this.cartItems.count();
  }

  /**
   * Returns the display names of all items in the cart
   * @returns {Promise<string[]>}
   */
  async getItemNames() {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  /**
   * Returns the prices of all items in the cart
   * @returns {Promise<string[]>}
   */
  async getItemPrices() {
    return this.cartItems.locator('.inventory_item_price').allTextContents();
  }

  /**
   * Removes an item from the cart by its name
   * @param {string} name - The name of the item to remove
   * @returns {Promise<void>}
   */
  async removeItemByName(name) {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator('[data-test^="remove"]').click();
  }

  /**
   * Clicks the Continue Shopping button to return to the inventory page
   * @returns {Promise<void>}
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  /**
   * Clicks the Checkout button to proceed to the checkout flow
   * @returns {Promise<void>}
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = CartPage;
