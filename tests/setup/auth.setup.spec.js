const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const { LoginPage } = require("../../pages/LoginPage");

const authDir = path.resolve(
  __dirname,
  "../../playwright/.auth"
);

fs.mkdirSync(authDir, {
  recursive: true,
});

async function authenticateAndSave(
  page,
  email,
  password,
  fileName
) {
  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    email,
    password
  );

  await page.waitForURL(/mail\.proton\.me/, {
    timeout: 30000,
  });

  await expect(
    page.locator(
      '[data-testid="navigation-link:inbox"]'
    )
  ).toBeVisible({
    timeout: 30000,
  });

  await page.context().storageState({
    path: path.join(authDir, fileName),
  });
}

test("authenticate sender account", async ({ page }) => {
  expect(process.env.SENDER_EMAIL).toBeTruthy();
  expect(process.env.SENDER_PASSWORD).toBeTruthy();

  await authenticateAndSave(
    page,
    process.env.SENDER_EMAIL,
    process.env.SENDER_PASSWORD,
    "sender.json"
  );
});

test("authenticate receiver account", async ({ page }) => {
  expect(process.env.RECEIVER_EMAIL).toBeTruthy();
  expect(process.env.RECEIVER_PASSWORD).toBeTruthy();

  await authenticateAndSave(
    page,
    process.env.RECEIVER_EMAIL,
    process.env.RECEIVER_PASSWORD,
    "receiver.json"
  );
});