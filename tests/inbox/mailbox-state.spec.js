const { test, expect } = require("@playwright/test");
const path = require("path");
const { ComposePage } = require("../../pages/ComposePage");

test.use({
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/receiver.json"
  ),
});

function createUniqueSubject(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

test.describe("Inbox State Management", () => {
  test("TC-INBOX-001 - should transition a newly received message from unread to read", async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);

  const senderEmail = process.env.SENDER_EMAIL;
  const receiverEmail = process.env.RECEIVER_EMAIL;

  expect(senderEmail).toBeTruthy();
  expect(receiverEmail).toBeTruthy();

  const subject = createUniqueSubject(
    "QA-INBOX-READ"
  );

  const body =
    "Inbox read state automation verification.";

  /*
   * Create fresh test data using the sender account.
   * This removes dependency on previous mailbox state.
   */
  const senderContext =
    await browser.newContext({
      storageState: path.resolve(
        __dirname,
        "../../playwright/.auth/sender.json"
      ),
    });

  const senderPage =
    await senderContext.newPage();

  try {
    await senderPage.goto(
      "https://mail.proton.me",
      {
        waitUntil: "domcontentloaded",
      }
    );

    await expect(
      senderPage.getByTestId(
        "navigation-link:inbox"
      )
    ).toBeVisible({
      timeout: 30000,
    });

    const composePage =
      new ComposePage(senderPage);

    await composePage.open();

    await composePage.addRecipient(
      receiverEmail
    );

    await composePage.enterSubject(
      subject
    );

    await composePage.enterBody(
      body
    );

    await composePage.send();

    await expect(
      senderPage.getByText(
        "Message sent.",
        {
          exact: true,
        }
      )
    ).toBeVisible({
      timeout: 15000,
    });
  } finally {
    await senderContext.close();
  }

  /*
   * Receiver side.
   * Every run now receives a brand-new unread message.
   */
  await page.goto(
    "https://mail.proton.me",
    {
      waitUntil: "domcontentloaded",
    }
  );

  const inboxLink = page.getByTestId(
    "navigation-link:inbox"
  );

  await expect(inboxLink).toBeVisible({
    timeout: 30000,
  });

  const messageRow = page.getByTestId(
    `message-item:${subject}`
  );

  /*
   * Delivery is asynchronous, so wait for the
   * uniquely generated message to arrive.
   */
  await expect(messageRow).toBeVisible({
    timeout: 45000,
  });

  /*
   * A newly delivered, unopened message
   * should initially be unread.
   */
  await expect(messageRow).toHaveClass(
    /\bunread\b/,
    {
      timeout: 15000,
    }
  );

  /*
   * Opening it performs the normal user action
   * that transitions it to read.
   */
  await messageRow.click();

  await expect(
    page.getByTestId(
      "conversation-header:subject"
    )
  ).toContainText(subject, {
    timeout: 15000,
  });

  /*
   * For an opened/read message Proton exposes
   * the inverse "Mark as unread" action.
   */
  await expect(
    page.getByTestId("toolbar:unread")
  ).toBeVisible({
    timeout: 15000,
  });

  /*
   * Return to Inbox and verify the persisted state.
   * There is no competing "mark unread" mutation now.
   */
  await page
    .getByTestId("toolbar:back-button")
    .click();

  const readMessageRow =
    page.getByTestId(
      `message-item:${subject}`
    );

  await expect(
    readMessageRow
  ).toBeVisible({
    timeout: 15000,
  });

  await expect(
    readMessageRow
  ).toHaveClass(
    /\bread\b/,
    {
      timeout: 20000,
    }
  );
});

  test("TC-INBOX-002 - should archive a message and restore it using Undo", async ({
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

    const messageRow = page.getByTestId(
        `message-item:${subject}`
    );

    await expect(messageRow).toBeVisible({
        timeout: 15000,
    });

    // Select the message.
    const messageCheckbox =
        messageRow.getByTestId("item-checkbox");

    await messageCheckbox.check();

    await expect(
        messageCheckbox
    ).toBeChecked();

    // Archive the selected message.
    const archiveButton = page.getByTestId(
        "toolbar:movetoarchive"
    );

    await expect(archiveButton).toBeVisible();

    await archiveButton.click();

    // It should immediately disappear from Inbox.
    await expect(messageRow).not.toBeVisible({
        timeout: 15000,
    });

    /*
    * Proton provides an Undo action after archiving.
    * Use it to restore the original mailbox state.
    */
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

    await undoButton.click();

    // Verify the same message returns to Inbox.
    await expect(
        page.getByTestId(`message-item:${subject}`)
    ).toBeVisible({
        timeout: 15000,
    });
    });
  test("TC-INBOX-003 - should move a message to Trash and restore it using Undo", async ({
    page,
    }) => {
    test.setTimeout(60_000);

    const subject = "Filter testing";

    await page.goto("https://mail.proton.me", {
        waitUntil: "domcontentloaded",
    });

    const inboxLink = page.getByTestId(
        "navigation-link:inbox"
    );

    await expect(inboxLink).toBeVisible({
        timeout: 30000,
    });

    await inboxLink.click();

    const messageRow = page.getByTestId(
        `message-item:${subject}`
    );

    await expect(messageRow).toBeVisible({
        timeout: 15000,
    });

    // Select the message.
    const messageCheckbox =
        messageRow.getByTestId("item-checkbox");

    await messageCheckbox.check();

    await expect(
        messageCheckbox
    ).toBeChecked();

    // Move the selected message to Trash.
    const trashButton = page.getByTestId(
        "toolbar:movetotrash"
    );

    await expect(trashButton).toBeVisible();

    await trashButton.click();

    // The message should disappear from Inbox.
    await expect(messageRow).not.toBeVisible({
        timeout: 15000,
    });

    /*
    * Proton provides Undo after moving the
    * message to Trash.
    */
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

    await undoButton.click();

    // Verify the same message returns to Inbox.
    await expect(
        page.getByTestId(`message-item:${subject}`)
    ).toBeVisible({
        timeout: 15000,
    });
    });
});