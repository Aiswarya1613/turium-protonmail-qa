const { test, expect } = require("@playwright/test");
const path = require("path");

const { ComposePage } = require("../../pages/ComposePage");

test.use({
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/sender.json"
  ),
});

function createUniqueSubject(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

test.describe("Asynchronous Mail Behaviour", () => {
  test("TC-ASYNC-001 - should undo a sent message and restore it as a draft", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const receiverEmail =
      process.env.RECEIVER_EMAIL;

    expect(receiverEmail).toBeTruthy();

    const subject = createUniqueSubject(
      "QA-AUTO-UNDO-SEND"
    );

    const body =
      "Undo Send automation verification message.";

    await page.goto("https://mail.proton.me", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByTestId("navigation-link:inbox")
    ).toBeVisible({
      timeout: 30000,
    });

    const composePage = new ComposePage(page);

    await composePage.open();
    await composePage.addRecipient(receiverEmail);
    await composePage.enterSubject(subject);
    await composePage.enterBody(body);

    await composePage.send();

    /*
     * Proton shows the send confirmation and provides
     * a short Undo window.
     */
    await expect(
      page.getByText("Message sent.", {
        exact: true,
      })
    ).toBeVisible({
      timeout: 15000,
    });

    const undoButton = page.getByRole(
      "button",
      {
        name: "Undo",
        exact: true,
      }
    );

    await expect(undoButton).toBeVisible({
      timeout: 10000,
    });

    // Act during Proton's Undo Send window.
    await undoButton.click();

    /*
     * Undo should restore the unsent message
     * to the composer.
     */
    await expect(
      composePage.subjectInput
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      composePage.subjectInput
    ).toHaveValue(subject);

    await expect(
      composePage.bodyEditor
    ).toContainText(body);

    const recipientAddress =
      page.getByTestId("composer:address");

    await expect(
      recipientAddress
    ).toContainText(receiverEmail);

    /*
     * Close the restored composer and verify that
     * the message persists in Drafts.
     */
    await composePage.close();

    const draftsLink = page.getByTestId(
      "navigation-link:all-drafts"
    );

    await expect(draftsLink).toBeVisible();
    await draftsLink.click();

    await expect(page).toHaveURL(
      /all-drafts/,
      {
        timeout: 15000,
      }
    );

    const restoredDraft =
      page.getByTestId(
        `message-item:${subject}`
      );

    await expect(
      restoredDraft
    ).toBeVisible({
      timeout: 20000,
    });

    await expect(
      restoredDraft
    ).toContainText(subject);
  });
});