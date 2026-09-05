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

test.describe("Drafts & Persistence", () => {
  test("TC-DRAFT-001 - should auto-save and reopen a draft with persisted content", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const receiverEmail = process.env.RECEIVER_EMAIL;

    expect(receiverEmail).toBeTruthy();

    const subject = createUniqueSubject(
      "QA-AUTO-DRAFT"
    );

    const body =
      "This message should be saved automatically as a draft.";

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

    await composePage.addRecipient(
      receiverEmail
    );

    await composePage.enterSubject(subject);

    await composePage.enterBody(body);

    /*
     * Do not use a fixed sleep.
     * Closing the composer allows Proton to persist
     * the current unsent message as a draft.
     */
    await composePage.close();

    const draftsLink = page.getByTestId("navigation-link:all-drafts");

    await expect(draftsLink).toBeVisible({timeout: 15000,});

    await draftsLink.click();

    await expect(page).toHaveURL(/all-drafts/, {timeout: 15000,});
 
    const draftRow = page.getByTestId(
      `message-item:${subject}`
    );

    await expect(draftRow).toBeVisible({
      timeout: 20000,
    });

    await expect(draftRow).toContainText(
      subject
    );

    await draftRow.click();

    await expect(
      composePage.subjectInput
    ).toHaveValue(subject);

    /*
     * Recipient should also persist.
     */
    const recipientAddress = page.getByTestId("composer:address");

    await expect(recipientAddress).toBeVisible();

    await expect(recipientAddress).toContainText(receiverEmail);

    /*
     * The body editor is inside Proton's
     * composer iframe.
     */
    await expect(
      composePage.bodyEditor
    ).toContainText(body);
  });
});