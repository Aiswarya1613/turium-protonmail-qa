const { test, expect } = require("@playwright/test");
const path = require("path");

const { ComposePage } = require("../../pages/ComposePage");

const senderState = path.resolve(
  __dirname,
  "../../playwright/.auth/sender.json"
);

const receiverState = path.resolve(
  __dirname,
  "../../playwright/.auth/receiver.json"
);

test.use({
  storageState: senderState,
});

function createUniqueSubject(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

async function openSenderMailbox(page) {
  await page.goto("https://mail.proton.me", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByTestId("navigation-link:inbox")
  ).toBeVisible({
    timeout: 30000,
  });
}

test.describe("Compose & Send", () => {
  test("TC-MAIL-001 - should send an email and deliver it to the receiver", async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);

  const receiverEmail =
    process.env.RECEIVER_EMAIL;

  expect(receiverEmail).toBeTruthy();

  const subject = createUniqueSubject(
    "QA-AUTO-SEND"
  );

  const body =
    "Proton Mail automation assessment test message.";

  await openSenderMailbox(page);

  const composePage = new ComposePage(page);

  await composePage.open();
  await composePage.addRecipient(receiverEmail);
  await composePage.enterSubject(subject);
  await composePage.enterBody(body);
  await composePage.send();

  await expect(
    page.getByText("Message sent.", {
      exact: true,
    })
  ).toBeVisible({
    timeout: 15000,
  });

  // Sender-side validation is complete.
  await page.close();

  const receiverContext =
    await browser.newContext({
      storageState: receiverState,
    });

  const receiverPage =
    await receiverContext.newPage();

  try {
    await receiverPage.goto(
      "https://mail.proton.me",
      {
        waitUntil: "domcontentloaded",
      }
    );

    await expect(
      receiverPage.getByTestId(
        "navigation-link:inbox"
      )
    ).toBeVisible({
      timeout: 45000,
    });

    const messageRow =
      receiverPage.getByTestId(
        `message-item:${subject}`
      );

    await expect(messageRow).toBeVisible({
      timeout: 45000,
    });

    await expect(
      messageRow
    ).toContainText(subject);

    await messageRow.click();

    const conversationSubject =
      receiverPage.getByTestId(
        "conversation-header:subject"
      );

    await expect(
      conversationSubject
    ).toContainText(subject, {
      timeout: 15000,
    });

    await expect(
      receiverPage
        .getByText(
          process.env.SENDER_EMAIL,
          {
            exact: false,
          }
        )
        .first()
    ).toBeVisible({
      timeout: 15000,
    });
  } finally {
    await receiverContext.close();
  }
});

  test("TC-MAIL-002 - should show validation when recipient is missing", async ({
    page,
    }) => {
    const subject = createUniqueSubject(
        "QA-AUTO-NO-RECIPIENT"
    );

    await openSenderMailbox(page);

    const composePage = new ComposePage(page);

    await composePage.open();
    await composePage.enterSubject(subject);
    await composePage.enterBody(
        "Negative recipient validation test."
    );

    await composePage.send();

    await expect(
        page.getByText("Recipient missing", {
        exact: true,
        })
    ).toBeVisible({
        timeout: 10000,
    });

    await expect(
        page.getByText(
        "Please add at least one recipient.",
        {
            exact: true,
        }
        )
    ).toBeVisible();

    await expect(
        page.getByRole("button", {
        name: "Got it",
        exact: true,
        })
    ).toBeVisible();

    // Sending is blocked and the composer remains open.
    await expect(
        composePage.sendButton
    ).toBeVisible();
    });

  test("TC-MAIL-003 - should show confirmation when subject is missing", async ({
    page,
    }) => {
    const receiverEmail =
        process.env.RECEIVER_EMAIL;

    expect(receiverEmail).toBeTruthy();

    await openSenderMailbox(page);

    const composePage = new ComposePage(page);

    await composePage.open();
    await composePage.addRecipient(receiverEmail);

    await composePage.enterBody(
        "Empty subject validation test."
    );

    await composePage.send();

    await expect(
        page.getByText("Subject missing", {
        exact: true,
        })
    ).toBeVisible({
        timeout: 10000,
    });

    await expect(
        page
            .getByText(
            /You have not given your email any subject\./
            )
            .first()
        ).toBeVisible();

    await expect(
        page
            .getByText(
            /Do you want to send the message anyway\?/
            )
            .first()
        ).toBeVisible();
    
    const sendAnywayButton =
        page.getByRole("button", {
        name: "Send anyway",
        exact: true,
        });

    const cancelButton =
        page.getByRole("button", {
        name: "Cancel",
        exact: true,
        });

    await expect(sendAnywayButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    // Cancel so the negative test does not actually send mail.
    await cancelButton.click();

    await expect(
        composePage.sendButton
    ).toBeVisible();
    });
});