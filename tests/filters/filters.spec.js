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
 * Open Proton Mail and wait for the real
 * application UI to become available.
 */
async function openMailbox(page) {
  await expect(async () => {
    await page.goto(
      "https://mail.proton.me/u/1/inbox#category=primary",
      {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      }
    );

    await expect(
      page.getByTestId("navigation-link:inbox")
    ).toBeVisible({
      timeout: 10000,
    });
  }).toPass({
    timeout: 60000,
    intervals: [1000, 3000, 5000, 10000],
  });
}

/*
 * Navigate to:
 *
 * Settings
 * → All settings
 * → Filters
 *
 * Important:
 * Proton may preserve the Settings drawer even
 * after navigating back to Inbox.
 *
 * Therefore this function handles both states:
 *
 * 1. Settings drawer already open
 * 2. Settings drawer closed
 */
async function openFilters(page) {
  await openMailbox(page);

  const allSettingsButton = page.getByTestId(
    "drawer-quick-settings:all-settings-button"
  );

  /*
   * If the Settings drawer is NOT already open,
   * open it normally.
   */
  if (!(await allSettingsButton.isVisible())) {
    await page
      .getByTestId("heading:userdropdown")
      .click();

    await page
      .getByTestId(
        "settings-drawer-app-button:settings-icon"
      )
      .click();

    await expect(
      allSettingsButton
    ).toBeVisible({
      timeout: 10000,
    });
  }

  /*
   * Whether the drawer was already open or
   * we just opened it, continue from here.
   */
  await allSettingsButton.click();

  const sidebar =
    page.getByTestId("account:sidebar");

  await expect(sidebar).toBeVisible({
    timeout: 30000,
  });

  await sidebar
    .getByRole("link", {
      name: "Filters",
      exact: true,
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Custom filters",
      exact: true,
    })
  ).toBeVisible({
    timeout: 30000,
  });

  await expect(
    page.getByText("QA Sender Filter", {
      exact: true,
    })
  ).toBeVisible({
    timeout: 15000,
  });
}

/*
 * Locate the toggle belonging specifically
 * to QA Sender Filter.
 */
function getFilterControls(page) {
  const filterName = page.getByText(
    "QA Sender Filter",
    {
      exact: true,
    }
  );

  const filterRow = filterName.locator(
    'xpath=ancestor::*[.//input[@type="checkbox"]][1]'
  );

  const toggleInput = filterRow
    .locator('input[type="checkbox"]')
    .first();

  const toggleControl = filterRow
    .locator(".toggle-container-text")
    .first();

  return {
    toggleInput,
    toggleControl,
  };
}

/*
 * Explicitly establish the desired filter state.
 *
 * This makes the test independent of any manual
 * activity or previous test execution.
 */
async function setFilterState(
  page,
  enabled
) {
  await openFilters(page);

  const {
    toggleInput,
    toggleControl,
  } = getFilterControls(page);

  await expect(toggleInput).toHaveCount(1);

  await expect(
    toggleControl
  ).toBeVisible({
    timeout: 10000,
  });

  const currentState =
    await toggleInput.isChecked();

  /*
   * Only toggle when a state change is required.
   */
  if (currentState !== enabled) {
    await toggleControl.click();
  }

  /*
   * Verify the resulting configuration.
   */
  if (enabled) {
    await expect(
      toggleInput
    ).toBeChecked({
      timeout: 10000,
    });
  } else {
    await expect(
      toggleInput
    ).not.toBeChecked({
      timeout: 10000,
    });
  }
}

test.describe("Filters", () => {
  test(
    "TC-FILTER-001 - should automatically star a matching message when sender filter is enabled",
    async ({ page, browser }) => {
      test.setTimeout(180_000);

      const receiverEmail =
        process.env.RECEIVER_EMAIL;

      expect(receiverEmail).toBeTruthy();

      const subject =
        createUniqueSubject(
          "QA-FILTER-MATCH"
        );

      /*
       * Separate authenticated sender session.
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
        /*
         * ======================================
         * STEP 1
         * Enable QA Sender Filter
         * ======================================
         */
        await setFilterState(
          page,
          true
        );

        /*
         * ======================================
         * STEP 2
         * Send a fresh matching email
         * ======================================
         */
        await openMailbox(senderPage);

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
          "Filter automation verification message."
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

        /*
         * ======================================
         * STEP 3
         * Open receiver Inbox
         * ======================================
         */
        await openMailbox(page);

        const receivedMessage =
          page.getByTestId(
            `message-item:${subject}`
          );

        await expect(
          receivedMessage
        ).toBeVisible({
          timeout: 60000,
        });

        /*
         * ======================================
         * STEP 4
         * Verify actual filter rule behaviour
         * ======================================
         *
         * The filter is configured to automatically
         * star messages from the sender account.
         */
        await expect(
          receivedMessage.locator(
            '[data-testid="item-star-true"]:visible'
          )
        ).toBeVisible({
          timeout: 15000,
        });

        console.log(
          `Filter verified successfully for message: ${subject}`
        );
      } finally {
        /*
         * ======================================
         * STEP 5
         * Cleanup
         * ======================================
         *
         * Always leave QA Sender Filter disabled.
         */
        try {
          await setFilterState(
            page,
            false
          );

          console.log(
            "QA Sender Filter disabled successfully during cleanup."
          );
        } catch (error) {
          console.warn(
            "Unable to disable QA Sender Filter during cleanup:",
            error.message
          );
        }

        await senderContext.close();
      }
    }
  );
});