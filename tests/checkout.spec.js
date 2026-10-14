// @ts-check
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { user, products, customer, TAX_RATE } = require('../test-data/checkout');

/** 2999 -> "$29.99" (the format SauceDemo uses on item prices). */
const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

// Each test gets a fresh browser context (Playwright default), so cart state
// in localStorage never leaks between tests.
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user);
});

test('standard user can buy two products and totals are correct', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  // Prices are read from the catalogue, not hard-coded, so the oracle
  // follows the data the user actually saw.
  const expectedPrices = {};

  await test.step('add products and verify cart badge', async () => {
    await expect(inventory.title).toHaveText('Products');
    for (const [index, product] of products.entries()) {
      expectedPrices[product.name] = await inventory.priceInCents(product.name);
      await inventory.addToCart(product.slug);
      await expect(inventory.removeButton(product.slug)).toBeVisible();
      await expect(inventory.cartBadge).toHaveText(String(index + 1));
    }
  });

  await test.step('cart lists exactly the chosen products with their prices', async () => {
    await inventory.openCart();
    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.items).toHaveCount(products.length);
    for (const product of products) {
      await expect(cart.item(product.name).getByTestId('inventory-item-price')).toHaveText(
        formatPrice(expectedPrices[product.name]),
      );
    }
    const names = await cart.itemNames.allInnerTexts();
    expect(names.sort()).toEqual(products.map((p) => p.name).sort());
  });

  await test.step('enter customer information', async () => {
    await cart.checkout();
    await expect(checkout.title).toHaveText('Checkout: Your Information');
    await checkout.fillInformation(customer);
    await checkout.continue();
  });

  await test.step('overview shows correct item total, tax and total', async () => {
    await expect(checkout.title).toHaveText('Checkout: Overview');
    await expect(checkout.itemNames).toHaveCount(products.length);

    const expectedSubtotal = Object.values(expectedPrices).reduce((sum, c) => sum + c, 0);
    const expectedTax = Math.round(expectedSubtotal * TAX_RATE);
    const summary = await checkout.summaryInCents();

    expect(summary.subtotal, 'item total = sum of catalogue prices').toBe(expectedSubtotal);
    expect(summary.tax, 'tax = 8% of item total, rounded to the cent').toBe(expectedTax);
    expect(summary.total, 'total = item total + tax').toBe(expectedSubtotal + expectedTax);
  });

  await test.step('finish order and verify confirmation and empty cart', async () => {
    await checkout.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventory.cartBadge).toHaveCount(0);
  });
});

test('checkout information requires a postal code', async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await inventory.addToCart(products[0].slug);
  await inventory.openCart();
  await cart.checkout();
  await checkout.fillInformation({ ...customer, postalCode: '' });
  await checkout.continue();

  await expect(checkout.error).toHaveText('Error: Postal Code is required');
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});
