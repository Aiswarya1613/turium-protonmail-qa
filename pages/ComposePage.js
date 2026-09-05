class ComposePage {
  constructor(page) {
    this.page = page;

    this.composeButton = page.getByTestId("sidebar:compose");
    this.toInput = page.getByTestId("composer:to");
    this.subjectInput = page.getByTestId("composer:subject");
    this.sendButton = page.getByTestId("composer:send-button");
    this.deleteDraftButton = page.getByTestId(
      "composer:delete-draft-button"
    );

    this.bodyEditor = page
      .frameLocator('iframe[data-testid="rooster-iframe"]')
      .locator('[contenteditable="true"]');
  }

  async open() {
    await this.composeButton.click();

    await this.toInput.waitFor({
      state: "visible",
    });

    await this.bodyEditor.waitFor({
      state: "visible",
    });
  }

  async addRecipient(email) {
    await this.toInput.fill(email);

    // Proton converts the typed address into a recipient chip.
    await this.toInput.press("Enter");
  }

  async enterSubject(subject) {
    await this.subjectInput.fill(subject);
  }

  async enterBody(body) {
    await this.bodyEditor.fill(body);
  }

  async send() {
    await this.sendButton.click();
  }
}

module.exports = { ComposePage };