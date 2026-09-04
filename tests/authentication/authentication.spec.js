const { test, expect } = require("@playwright/test");
const { LoginPage } = require("../../pages/LoginPage");

// Authentication may contain sensitive user/session information.
// Other functional tests can retain traces on failure.
test.use({
  trace: "off",
  video: "off",
});

test.describe("Authentication", () => {
  test("TC-AUTH-001 - should login successfully with valid credentials", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    const senderEmail = process.env.SENDER_EMAIL;
    const senderPassword = process.env.SENDER_PASSWORD;

    expect(senderEmail).toBeTruthy();
    expect(senderPassword).toBeTruthy();

    await loginPage.goto();

    await loginPage.login(
      senderEmail,
      senderPassword
    );

    await page.waitForURL(/mail\.proton\.me/, {
      timeout: 30000,
    });

    const inboxLink = page.locator(
      '[data-testid="navigation-link:inbox"]'
    );

    const composeButton = page.locator(
      '[data-testid="sidebar:compose"]'
    );

    await expect(inboxLink).toBeVisible({
      timeout: 30000,
    });

    await expect(composeButton).toBeVisible();

    await expect(composeButton).toHaveText(
      "New message"
    );

    expect(new URL(page.url()).hostname).toBe(
      "mail.proton.me"
    );
  });

  test("TC-AUTH-002 - should reject login with an invalid password", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    const senderEmail = process.env.SENDER_EMAIL;

    expect(senderEmail).toBeTruthy();

    await loginPage.goto();

    await loginPage.login(
      senderEmail,
      "InvalidPassword-QA-123456789!"
    );

    await expect(
      page.getByText(
        "The password is not correct. Please try again with a different password.",
        { exact: true }
      )
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(loginPage.loginForm).toBeVisible();

    expect(new URL(page.url()).hostname).toBe(
      "account.proton.me"
    );
  });
});