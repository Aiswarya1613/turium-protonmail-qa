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

/*
 * Opens Proton's search overlay and submits
 * the requested search criteria.
 */
async function submitSearch(
  page,
  subject,
  locationTestId = null
) {
  await page.goto("https://mail.proton.me", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByTestId("navigation-link:inbox")
  ).toBeVisible({
    timeout: 30000,
  });

  /*
   * Proton's top search input is readonly.
   * Clicking it opens the actual search overlay.
   */
  const searchTrigger =
    page.getByTestId("search-keyword");

  await expect(searchTrigger).toBeVisible({
    timeout: 15000,
  });

  await searchTrigger.click();

  const searchForm = page.locator(
    'form[name="advanced-search"]'
  );

  await expect(searchForm).toBeVisible({
    timeout: 10000,
  });

  const keywordInput = searchForm.locator(
    "input#search-keyword"
  );

  await expect(keywordInput).toBeEditable();

  await keywordInput.fill(subject);

  /*
   * Optional second search condition.
   * location-2 represents Sent.
   */
  if (locationTestId) {
    const locationButton =
      searchForm.getByTestId(
        locationTestId
      );

    await expect(locationButton).toBeVisible();

    await locationButton.click();
  }

  await searchForm
    .getByTestId(
      "advanced-search:submit"
    )
    .click();
}

/*
 * Search indexing is eventually consistent.
 *
 * Repeat the complete user search operation until
 * Proton exposes the expected result or the bounded
 * retry window expires.
 */
async function waitForSearchResult(
  page,
  subject,
  locationTestId = null
) {
  await expect(async () => {
    await submitSearch(
      page,
      subject,
      locationTestId
    );

    await expect(
      page.getByTestId(
        `message-item:${subject}`
      )
    ).toBeVisible({
      timeout: 5000,
    });
  }).toPass({
    timeout: 90000,
    intervals: [
      2000,
      5000,
      10000,
      15000,
    ],
  });

  return page.getByTestId(
    `message-item:${subject}`
  );
}

test.describe("Search", () => {
  test(
    "TC-SEARCH-001 - should find a newly received message by unique subject",
    async ({ page, browser }) => {
      test.setTimeout(150_000);

      const receiverEmail =
        process.env.RECEIVER_EMAIL;

      expect(receiverEmail).toBeTruthy();

      const subject = createUniqueSubject(
        "QA-SEARCH-SIMPLE"
      );

      const body =
        "Simple search automation verification.";

      /*
       * STEP 1:
       * Create fresh test data using sender account.
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
       * STEP 2:
       * Prove delivery independently from Search.
       */
      await page.goto(
        "https://mail.proton.me",
        {
          waitUntil: "domcontentloaded",
        }
      );

      await expect(
        page.getByTestId(
          "navigation-link:inbox"
        )
      ).toBeVisible({
        timeout: 30000,
      });

      const receivedRow =
        page.getByTestId(
          `message-item:${subject}`
        );

      await expect(
        receivedRow
      ).toBeVisible({
        timeout: 60000,
      });

      /*
       * STEP 3:
       * Perform simple subject search.
       *
       * Search indexing may lag behind delivery,
       * so retry the actual search operation.
       */
      const resultRow =
        await waitForSearchResult(
          page,
          subject
        );

      await expect(
        resultRow
      ).toContainText(subject);

      await resultRow.click();

      await expect(
        page.getByTestId(
          "conversation-header:subject"
        )
      ).toContainText(subject, {
        timeout: 15000,
      });
    }
  );

  test(
    "TC-SEARCH-002 - should find a message using subject and Sent location filters",
    async ({ browser }) => {
      test.setTimeout(150_000);

      const receiverEmail =
        process.env.RECEIVER_EMAIL;

      expect(receiverEmail).toBeTruthy();

      const subject = createUniqueSubject(
        "QA-SEARCH-ADV"
      );

      const body =
        "Advanced search automation verification.";

      /*
       * This test owns its own sender session
       * and its own unique message.
       */
      const senderContext =
        await browser.newContext({
          storageState: path.resolve(
            __dirname,
            "../../playwright/.auth/sender.json"
          ),
        });

      const page =
        await senderContext.newPage();

      try {
        await page.goto(
          "https://mail.proton.me",
          {
            waitUntil: "domcontentloaded",
          }
        );

        await expect(
          page.getByTestId(
            "navigation-link:inbox"
          )
        ).toBeVisible({
          timeout: 30000,
        });

        /*
         * STEP 1:
         * Create a fresh message.
         */
        const composePage =
          new ComposePage(page);

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
          page.getByText(
            "Message sent.",
            {
              exact: true,
            }
          )
        ).toBeVisible({
          timeout: 15000,
        });

        /*
         * We deliberately do NOT wait for the new row
         * to appear in Sent here.
         *
         * That mailbox-list assertion was the source
         * of the beforeAll timeout and is unnecessary
         * to the purpose of this test.
         */

        /*
         * STEP 2:
         * Advanced search with two conditions:
         *
         * 1. Unique subject
         * 2. Location = Sent
         *
         * Retry because Proton search indexing can
         * lag behind successful send completion.
         */
        const resultRow =
          await waitForSearchResult(
            page,
            subject,
            "location-2"
          );

        await expect(
          resultRow
        ).toContainText(subject);

        await resultRow.click();

        await expect(
          page.getByTestId(
            "conversation-header:subject"
          )
        ).toContainText(subject, {
          timeout: 15000,
        });
      } finally {
        await senderContext.close();
      }
    }
  );
});