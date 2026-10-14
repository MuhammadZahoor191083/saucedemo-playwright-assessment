const { toCents } = require('../utils/money');

/** Covers all three checkout steps: information, overview and complete. */
class CheckoutPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');

    // Step one: Your Information
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');

    // Step two: Overview
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    // Complete
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation({ firstName, lastName, postalCode }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  /** Read the overview's price summary as integer cents. */
  async summaryInCents() {
    return {
      subtotal: toCents(await this.subtotal.innerText()),
      tax: toCents(await this.tax.innerText()),
      total: toCents(await this.total.innerText()),
    };
  }

  async finish() {
    await this.finishButton.click();
  }
}

module.exports = { CheckoutPage };
