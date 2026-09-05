const { test, expect } = require("@playwright/test");
const path = require("path");

test.use({
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/receiver.json"
  ),
});

test.describe("Search", () => {
  test("TC-SEARCH-001 - should find an existing message by subject", async ({
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

    // Proton's main search field is readonly and acts
    // as a trigger for the advanced-search overlay.
    const searchTrigger = page.getByTestId(
      "search-keyword"
    );

    await expect(searchTrigger).toBeVisible({
      timeout: 15000,
    });

    await expect(searchTrigger).toHaveAttribute(
      "readonly",
      ""
    );

    await searchTrigger.click();

    // Actual editable search form.
    const searchForm = page.locator(
      'form[name="advanced-search"]'
    );

    await expect(searchForm).toBeVisible({
      timeout: 10000,
    });

    const keywordInput = searchForm.locator(
      'input#search-keyword'
    );

    await expect(keywordInput).toBeEditable();

    await keywordInput.fill(subject);

    await searchForm
      .getByTestId("advanced-search:submit")
      .click();

    // Verify the expected search result is returned.
    const resultRow = page.getByTestId(
      `message-item:${subject}`
    );

    await expect(resultRow).toBeVisible({
      timeout: 20000,
    });

    await expect(resultRow).toContainText(
      subject
    );

    // Open the result to verify it is actionable.
    await resultRow.click();

    await expect(
      page.getByTestId(
        "conversation-header:subject"
      )
    ).toContainText(subject, {
      timeout: 15000,
    });
  });
});