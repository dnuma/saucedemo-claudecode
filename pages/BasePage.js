class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigates to the given path relative to the base URL
   * @param {string} path - The path to navigate to
   * @returns {Promise<void>}
   */
  async navigate(path = '/') {
    await this.page.goto(path);
  }
}

module.exports = BasePage;
