const { test, expect } = require("@playwright/test");
const path = require("path");

test.use({
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/receiver.json"
  ),
});

test.describe("Inbox State Management", () => {
  test("TC-INBOX-001 - should unstar and star a message", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const subject = "Filter testing";

    await page.goto("https://mail.proton.me", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByTestId("navigation-link:inbox")
    ).toBeVisible({
      timeout: 30000,
    });

    // Open Starred and verify the known starred message.
    const starredLink = page.getByTestId(
      "navigation-link:starred"
    );

    await starredLink.click();

    await expect(page).toHaveURL(/\/starred/, {
      timeout: 15000,
    });

    const starredRow = page.getByTestId(
      `message-item:${subject}`
    );

    await expect(starredRow).toBeVisible({
      timeout: 15000,
    });

    const starredButton = starredRow
      .getByTestId("item-star-true")
      .first();

    await expect(starredButton).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Unstar the message.
    await starredButton.click();

    // An unstarred message should disappear from Starred.
    await expect(starredRow).not.toBeVisible({
      timeout: 15000,
    });

    // Verify the same message is still present in Inbox.
    const inboxLink = page.getByTestId(
      "navigation-link:inbox"
    );

    await inboxLink.click();

    await expect(page).toHaveURL(/\/inbox/, {
      timeout: 15000,
    });

    const inboxRow = page.getByTestId(
      `message-item:${subject}`
    );

    await expect(inboxRow).toBeVisible({
      timeout: 15000,
    });

    const unstarredButton = inboxRow
      .getByTestId("item-star-false")
      .first();

    await expect(unstarredButton).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    // Restore the original starred state.
    await unstarredButton.click();

    const restoredStarButton = inboxRow
      .getByTestId("item-star-true")
      .first();

    await expect(restoredStarButton).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Final verification: it returns to the Starred folder.
    await starredLink.click();

    await expect(
      page.getByTestId(`message-item:${subject}`)
    ).toBeVisible({
      timeout: 15000,
    });
  });
});