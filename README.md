# SauceDemo – Playwright E2E purchase test

Automated end-to-end test of the main revenue path of [SauceDemo](https://www.saucedemo.com/), written with **Playwright + JavaScript** as part of an SQA assessment.

## What is covered

**`standard user can buy two products and totals are correct`**

Login → add 2 products → verify cart badge → verify cart contents → enter customer info → verify price math → finish → verify confirmation and empty cart.

| Step | Assertion (business outcome) |
|---|---|
| Add products | "Remove" button appears for each product; badge counts 1, then 2 |
| Cart | Exactly the 2 chosen products (exact name match); each price equals the price shown in the catalogue |
| Overview | Item total = sum of catalogue prices; tax = 8% of item total rounded to the cent; total = item total + tax (all compared in **integer cents**) |
| Complete | URL is `/checkout-complete.html`; header reads "Thank you for your order!"; cart badge is gone |

**`checkout information requires a postal code`** is a small negative test. Submitting without a postal code shows "Error: Postal Code is required" and stays on step one.

## Prerequisites

- Node.js 18+ (tested on Node 24)
- Internet access to https://www.saucedemo.com

## Run it

```bash
npm ci
npx playwright install chromium
npx playwright test
```

Other useful commands:

```bash
npx playwright test --headed      # watch the browser
npx playwright show-report        # open the HTML report
```

## Configuration

| Env variable | Default | Purpose |
|---|---|---|
| `SAUCE_USERNAME` | `standard_user` | Login user |
| `SAUCE_PASSWORD` | `secret_sauce` | Login password |
| `BASE_URL` | `https://www.saucedemo.com` | App under test |

The defaults are SauceDemo's **public demo credentials**, which are printed on its login page. They are fallbacks so the project runs from a fresh clone. For any non-public environment, pass real credentials through environment variables or CI secrets and never commit them.

## Project structure

```
playwright.config.js        baseURL, testIdAttribute = data-test, trace/screenshot, HTML reporter, CI retry
pages/                      Page objects: LoginPage, InventoryPage, CartPage, CheckoutPage
tests/checkout.spec.js      The E2E purchase test + negative postal-code test
test-data/checkout.js       User, products, customer and tax rate in one place
utils/money.js              "$29.99" -> 2999 cents parser
.github/workflows/          GitHub Actions: runs tests on push/PR, uploads HTML report
```

## Design choices

- **Selectors:** only `page.getByTestId()` against SauceDemo's `data-test` attributes (`testIdAttribute: 'data-test'`). No CSS chains, XPath or `nth-child`. All locators were checked against the live DOM before the code was written.
- **Waiting:** only Playwright auto-waiting and web-first `expect`. There is no `waitForTimeout`.
- **Oracle:** expected prices are read from the catalogue page, not hard-coded, and money is compared in cents to avoid floating-point error.
- **Isolation:** each test logs in fresh in its own browser context, so cart state in `localStorage` never leaks between tests.
- **Config:** Chromium only; `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`; 1 retry in CI, 0 locally.

## Verification done

- Passed 3 consecutive full runs locally plus one headed run (Windows 10, Playwright 1.64.1, Chromium).
- **Mutation check:** the tax rate in the test data was changed from 8% to 7%, and the test failed on the tax assertion (expected 322, received 368). This confirms the price assertions really check the values. The change was then reverted.

## Known limitations

- SauceDemo is a public third-party demo site. It may change its DOM, data or availability without notice, which would fail the test for reasons unrelated to our code.
- The 8% tax rate comes from **observed behaviour**, not a specification.
- Only Chromium is covered, and there are no visual-regression or accessibility checks. Testing found an accessibility defect (the cart link is not keyboard-focusable), which this test does not catch because Playwright clicks the link directly.
- The test passes even though SauceDemo has known checkout defects (e.g. empty-cart orders, skipping the info step by URL). It verifies the happy path only and is not a regression test for those defects.
