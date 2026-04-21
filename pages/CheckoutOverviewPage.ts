import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

class CheckoutOverviewPage extends BasePage {
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly itemTotal: Locator;
  readonly taxAmount: Locator;
  readonly orderTotal: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.taxAmount = page.locator('.summary_tax_label');
    this.orderTotal = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  async getItemPrices(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_price').allTextContents();
  }

  async getItemTotal(): Promise<string> {
    return (await this.itemTotal.textContent()) ?? '';
  }

  async getTax(): Promise<string> {
    return (await this.taxAmount.textContent()) ?? '';
  }

  async getOrderTotal(): Promise<string> {
    return (await this.orderTotal.textContent()) ?? '';
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

export default CheckoutOverviewPage;
