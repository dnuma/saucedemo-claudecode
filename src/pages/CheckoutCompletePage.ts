import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

class CheckoutCompletePage extends BasePage {
  readonly confirmationHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationHeader = page.locator('.complete-header');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async backToHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}

export default CheckoutCompletePage;
