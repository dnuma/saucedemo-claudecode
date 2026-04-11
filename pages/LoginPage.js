const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Navigates to the login page
   * @returns {Promise<void>}
   */
  async navigate() {
    await super.navigate('/');
  }

  /**
   * Fills in the login form and submits it
   * @param {string} username - The username to log in with
   * @param {string} password - The password to log in with
   * @returns {Promise<void>}
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Returns the text content of the error message
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  /**
   * Returns whether the error message is currently visible
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }
}

module.exports = LoginPage;
