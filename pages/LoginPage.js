const { expect } = require('@playwright/test');

class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Log in and wait until the inventory page is shown. */
  async login({ username, password }) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
  }
}

module.exports = { LoginPage };
