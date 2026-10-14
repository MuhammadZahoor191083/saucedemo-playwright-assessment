// Single source of test data for the checkout specs.

// Public demo credentials are shown on the SauceDemo login page.
// Override with environment variables (e.g. CI secrets) when needed.
const user = {
  username: process.env.SAUCE_USERNAME || 'standard_user',
  password: process.env.SAUCE_PASSWORD || 'secret_sauce',
};

// `slug` is the suffix of the product's data-test ids, e.g. add-to-cart-<slug>.
const products = [
  { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack' },
  { name: 'Sauce Labs Bolt T-Shirt', slug: 'sauce-labs-bolt-t-shirt' },
];

const customer = {
  firstName: 'Test',
  lastName: 'Buyer',
  postalCode: '44000',
};

// Observed behaviour, not a published spec: tax is 8% of the item total.
const TAX_RATE = 0.08;

module.exports = { user, products, customer, TAX_RATE };
