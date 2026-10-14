const { toCents } = require('../utils/money');

class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  /** The product card (data-test="inventory-item") whose name matches exactly. */
  item(name) {
    return this.page
      .getByTestId('inventory-item')
      .filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  /** Read the listed price of a product, in cents. */
  async priceInCents(name) {
    return toCents(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  async addToCart(slug) {
    await this.page.getByTestId(`add-to-cart-${slug}`).click();
  }

  removeButton(slug) {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async openCart() {
    await this.cartLink.click();
  }
}

module.exports = { InventoryPage };
