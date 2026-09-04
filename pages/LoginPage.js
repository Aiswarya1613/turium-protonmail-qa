class LoginPage {
  constructor(page) {
    this.page = page;

    this.loginForm = page.locator('[data-testid="login-form"]');
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");

    this.signInButton = page.getByRole("button", {
      name: "Sign in",
      exact: true,
    });
  }

  async goto() {
    await this.page.goto("https://account.proton.me/mail", {
      waitUntil: "domcontentloaded",
    });

    await this.loginForm.waitFor({
      state: "visible",
    });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}

module.exports = { LoginPage };