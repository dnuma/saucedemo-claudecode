const BasePage = require('./BasePage');

class InventoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.title = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('.product_sort_container');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
  }

  /**
   * Navigates directly to the inventory page
   * @returns {Promise<void>}
   */
  async navigate() {
    await super.navigate('/inventory.html');
  }

  /**
   * Returns the display names of all products on the page
   * @returns {Promise<string[]>}
   */
  async getItemNames() {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  /**
   * Returns the prices of all products on the page
   * @returns {Promise<string[]>}
   */
  async getItemPrices() {
    return this.inventoryItems.locator('.inventory_item_price').allTextContents();
  }

  /**
   * Adds a product to the cart by its name
   * @param {string} name - The name of the product to add
   * @returns {Promise<void>}
   */
  async addItemToCartByName(name) {
    const item = this.inventoryItems.filter({ hasText: name });
    await item.locator('[data-test^="add-to-cart"]').click();
  }

  /**
   * Clicks a product title to open its detail page
   * @param {string} name - The name of the product to open
   * @returns {Promise<void>}
   */
  async clickItemByName(name) {
    await this.inventoryItems.locator('.inventory_item_name').filter({ hasText: name }).click();
  }

  /**
   * Sorts the product list using the sort dropdown
   * @param {string} option - The sort option value (e.g. 'az', 'za', 'lohi', 'hilo')
   * @returns {Promise<void>}
   */
  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  /**
   * Returns the current cart item count from the badge, or 0 if the badge is not visible
   * @returns {Promise<number>}
   */
  async getCartBadgeCount() {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    return parseInt(await this.cartBadge.textContent(), 10);
  }

  /**
   * Clicks the cart icon to navigate to the cart page
   * @returns {Promise<void>}
   */
  async openCart() {
    await this.cartLink.click();
  }

  /**
   * Opens the burger menu and clicks the logout link
   * @returns {Promise<void>}
   */
  async logout() {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }

  /**
   * Opens the burger menu and clicks Reset App State, clearing the cart
   * @returns {Promise<void>}
   */
  async resetAppState() {
    await this.burgerMenuButton.click();
    await this.resetAppStateLink.click();
  }
}

module.exports = InventoryPage;
