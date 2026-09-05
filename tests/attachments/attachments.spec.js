const { test, expect } = require("@playwright/test");
const path = require("path");

const { ComposePage } = require("../../pages/ComposePage");

test.use({
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/sender.json"
  ),
});

test.describe("Attachments", () => {
  test("TC-ATTACH-001 - should upload a file to a new message", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const attachmentPath = path.resolve(
      __dirname,
      "../fixtures/qa-attachment.txt"
    );

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

    /*
     * Proton exposes the actual <input type="file">
     * behind the attachment button.
     */
    const fileInput = page.getByTestId(
      "composer-attachments-button"
    );

    await fileInput.setInputFiles(
      attachmentPath
    );

    const attachmentHeader = page.getByTestId(
      "attachment-list:header"
    );

    await expect(attachmentHeader).toBeVisible({
      timeout: 15000,
    });

    // Verify exactly one attachment was accepted.
    await expect(
      page.getByTestId(
        "attachment-list:pure-attachment-number"
      )
    ).toHaveText("1");

    await expect(
      attachmentHeader.getByText(
        "file attached",
        {
          exact: true,
        }
      )
    ).toBeVisible();

    /*
     * Proton initially collapses attachment details,
     * so expand them before checking the file.
     */
    const toggle = page.getByTestId(
      "attachment-list:toggle"
    );

    await expect(toggle).toHaveText("Show");

    await toggle.click();

    await expect(toggle).toHaveText("Hide");

    const attachmentItem = page.getByTestId(
      "attachment-item"
    );

    await expect(attachmentItem).toBeVisible({
      timeout: 10000,
    });

    const attachmentPrimaryAction =
      page.getByTestId(
        "attachment-item:qa-attachment.txt--primary-action"
    );

    await expect(attachmentPrimaryAction).toBeVisible();

    await expect(
      attachmentPrimaryAction
    ).toHaveAttribute(
      "aria-label",
      /qa-attachment\.txt/
    );
  });
});