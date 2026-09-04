# Proton Mail Web — Detailed Test Cases

## Legend

**Priority**
- P0 — Critical
- P1 — High
- P2 — Medium
- P3 — Low

**Automation Classification**
- Automate
- Manual / Exploratory
- Not worth automating

---

## Automated Test Cases

### TC-AUTH-001 — Login with valid credentials

- **Area:** Authentication
- **Priority:** P0
- **Classification:** Automate
- **Preconditions:** Valid sender test account exists and user is logged out.
- **Test Data:** Valid sender username/password from local secure configuration.
- **Steps:**
  1. Open Proton Mail sign-in.
  2. Enter valid username.
  3. Enter valid password.
  4. Select Sign in.
  5. Wait for the authenticated mailbox state.
- **Expected Result:**
  - Login succeeds.
  - Proton Mail finishes loading.
  - Authenticated mailbox navigation/Inbox is displayed.
- **Automation Notes:** Assert stable mailbox state rather than URL alone.

### TC-AUTH-002 — Reject invalid password

- **Area:** Authentication
- **Priority:** P0
- **Classification:** Automate
- **Preconditions:** Valid sender username exists and user is logged out.
- **Test Data:** Valid username + intentionally invalid password.
- **Steps:**
  1. Open sign-in.
  2. Enter valid username.
  3. Enter invalid password.
  4. Select Sign in.
- **Expected Result:**
  - Login is rejected.
  - Exact error appears: `The password is not correct. Please try again with a different password.`
  - Authenticated mailbox is not displayed.

---

### TC-MAIL-001 — Send message from sender and verify at receiver

- **Area:** Compose / Send
- **Priority:** P0
- **Classification:** Automate
- **Preconditions:** Sender and receiver accounts are valid.
- **Test Data:**
  - Unique subject: `QA-AUTO-SEND-<unique-id>`
  - Body: deterministic QA test message
- **Steps:**
  1. Log in as sender.
  2. Compose a new message.
  3. Enter receiver address.
  4. Enter unique subject and body.
  5. Send.
  6. Log in/switch to receiver.
  7. Locate message by unique subject.
  8. Open message.
- **Expected Result:**
  - Message is sent successfully.
  - Receiver receives the message.
  - Sender, recipient, subject, and body are correct.
- **Automation Notes:** Highest-value E2E workflow.

### TC-MAIL-002 — Validate missing recipient

- **Area:** Compose / Send
- **Priority:** P0
- **Classification:** Automate
- **Preconditions:** Sender logged in.
- **Test Data:**
  - No recipient
  - Subject: unique negative-test subject
  - Body: `Negative test`
- **Steps:**
  1. Open composer.
  2. Leave recipient blank.
  3. Enter subject/body.
  4. Select Send.
- **Expected Result:**
  - Message is not sent.
  - Dialog title: `Recipient missing`
  - Message: `Please add at least one recipient.`
  - Composer remains available.
- **Automation Notes:** Strong required negative case.

### TC-MAIL-003 — Confirm empty-subject warning

- **Area:** Compose / Send
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Sender logged in.
- **Test Data:** Valid receiver; subject blank; body populated.
- **Steps:**
  1. Open composer.
  2. Enter receiver.
  3. Leave subject blank.
  4. Enter body.
  5. Select Send.
- **Expected Result:**
  - Confirmation dialog appears.
  - Title: `Subject missing`
  - User is offered `Send anyway` and `Cancel`.
- **Automation Notes:** Validate warning behavior without necessarily completing delivery.

---

### TC-DRAFT-001 — Auto-save and reopen draft with persisted content

- **Area:** Draft / Persistence
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Sender logged in.
- **Test Data:** Unique subject/body and valid receiver.
- **Steps:**
  1. Compose message.
  2. Enter recipient, subject, and body.
  3. Wait for saved state.
  4. Close composer.
  5. Open Drafts.
  6. Locate draft by unique subject.
  7. Reopen it.
- **Expected Result:**
  - Draft exists.
  - Recipient, subject, and body are preserved.
- **Automation Notes:** Assert actual persisted fields.

### TC-DRAFT-002 — Edit draft and transition to Sent

- **Area:** Draft / Persistence
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Existing unique draft.
- **Test Data:** Updated body text.
- **Steps:**
  1. Open draft.
  2. Modify body.
  3. Confirm saved-state update.
  4. Send message.
  5. Open Drafts.
  6. Check for subject.
  7. Open Sent.
  8. Check for subject.
- **Expected Result:**
  - Draft no longer appears in Drafts.
  - Message appears in Sent.
  - Updated content is retained.
- **Automation Notes:** State-transition validation.

---

### TC-INBOX-001 — Star and unstar message

- **Area:** Inbox / Organization
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Receiver has a uniquely identifiable test message.
- **Steps:**
  1. Locate target message in Inbox.
  2. Star it.
  3. Open Starred.
  4. Verify target message exists.
  5. Unstar it.
  6. Verify it no longer appears in Starred.
- **Expected Result:**
  - Star state is correctly applied and removed.
  - Organization state is reflected in Starred mailbox.

### TC-INBOX-002 — Archive and restore message

- **Area:** Inbox / Organization
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Receiver has a unique target message in Inbox.
- **Steps:**
  1. Archive target message.
  2. Verify it is absent from Inbox.
  3. Open Archive.
  4. Verify target message exists.
  5. Move it back to Inbox.
  6. Verify it is present in Inbox.
- **Expected Result:**
  - Message transitions Inbox → Archive → Inbox correctly.
- **Automation Notes:** Assert destination state, not only toast messages.

### TC-INBOX-003 — Move message to Trash and restore

- **Area:** Inbox / Organization
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Receiver has a unique target message in Inbox.
- **Steps:**
  1. Move target message to Trash.
  2. Verify it is absent from Inbox.
  3. Open Trash.
  4. Verify target message exists.
  5. Restore/move it back to Inbox.
  6. Verify it is present in Inbox.
- **Expected Result:**
  - Message transitions Inbox → Trash → Inbox correctly.
- **Automation Notes:** Read/unread preservation is not asserted until the exploratory finding is confirmed.

---

### TC-SEARCH-001 — Search by unique subject

- **Area:** Search
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** A uniquely identified QA message exists.
- **Steps:**
  1. Open receiver mailbox.
  2. Search using the unique subject.
  3. Review results.
- **Expected Result:**
  - Target message appears in search results.
  - Returned message matches expected unique subject.

### TC-SEARCH-002 — Advanced multi-condition search

- **Area:** Search
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Receiver contains at least one message from sender test account.
- **Test Data:** Sender address + available mailbox/category condition such as Primary.
- **Steps:**
  1. Open advanced search/filter controls.
  2. Apply sender condition.
  3. Apply the available mailbox/category condition.
  4. Execute search.
- **Expected Result:**
  - Results satisfy both configured conditions.
  - Target sender message appears.
- **Automation Notes:** Use the current live UI options observed during exploration rather than assuming an `Inbox` label.

---

### TC-FILTER-001 — Apply enabled sender filter and verify disabled behavior

- **Area:** Filters
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Receiver logged in; a test filter can be created.
- **Filter Rule:** Sender matches sender test account → Star message.
- **Steps:**
  1. Create/enable the sender filter.
  2. Send a unique message from sender to receiver.
  3. Verify the received message is automatically starred.
  4. Disable the filter.
  5. Send another unique message from sender.
  6. Verify the second message is received without automatic starring.
- **Expected Result:**
  - Enabled matching rule stars the message.
  - Disabled rule does not apply to the next matching message.
- **Automation Notes:** Clean up filter after execution where practical.

---

### TC-ASYNC-001 — Undo Send prevents delivery

- **Area:** Async Behavior
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Sender logged in; Undo Send configured with observed ~10-second window.
- **Test Data:** Unique subject.
- **Steps:**
  1. Compose and send unique message.
  2. Wait for Undo control to become available.
  3. Select Undo within the allowed window.
  4. Verify message returns to Drafts.
  5. Verify message is not present as delivered in receiver mailbox within a bounded observation window.
- **Expected Result:**
  - Send is cancelled.
  - Message returns to Drafts.
  - Receiver does not receive the message.
- **Automation Notes:** No arbitrary `cy.wait(10000)`; synchronize on UI/state.

---

### TC-ATTACH-001 — Send and receive attachment

- **Area:** Attachments
- **Priority:** P1
- **Classification:** Automate
- **Preconditions:** Sender and receiver accounts valid; small local fixture exists.
- **Test Data:** `qa-attachment.txt`
- **Steps:**
  1. Compose new message.
  2. Upload fixture.
  3. Verify filename is attached.
  4. Send message.
  5. Open receiver mailbox.
  6. Locate unique message.
  7. Open message.
  8. Verify attachment filename is present.
- **Expected Result:**
  - Attachment is accepted at compose time.
  - Message is delivered.
  - Receiver sees the expected attachment filename.

---

## Manual / Exploratory Test Cases

### TC-MAN-001 — CC/BCC combinations
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Useful recipient-handling coverage but lower value than mandatory minimal scenarios; combinations can expand quickly.

### TC-MAN-002 — Scheduled Send
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Time-dependent and potentially plan/environment sensitive. Undo Send gives stronger asynchronous coverage within the timebox.

### TC-MAN-003 — Session refresh/back/reopen behavior
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Browser/session behavior can vary by environment and is less critical than core authentication for the minimal suite.

### TC-MAN-004 — Folder and label CRUD
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Valuable organization coverage but omitted to keep the first suite focused and stable.

### TC-MAN-005 — Bulk inbox actions
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Requires larger controlled data setup and gives less immediate value than single-message state transitions.

### TC-MAN-006 — Password-protected/security-sensitive email
- **Priority:** P2
- **Classification:** Manual / Exploratory
- **Reason:** Environment/plan constraints and additional security-state setup make this better suited to focused manual exploration within the assessment timebox.

### TC-MAN-007 — Cross-browser execution
- **Priority:** P2
- **Classification:** Manual / Exploratory for minimal round
- **Reason:** Bonus area. Chrome is used as the baseline browser first; cross-browser can be added if time remains.

---

## Coverage Rationale

The 15 automated scenarios were selected because they provide high regression value across the complete mandatory assessment scope with minimal redundancy.

The suite intentionally emphasizes:

- critical authentication;
- real sender-to-receiver delivery;
- negative validation;
- persisted drafts;
- mailbox state transitions;
- deterministic search;
- rule-based automation;
- attachment continuity;
- asynchronous Undo Send behavior.

The suite avoids maximizing count at the expense of reliability. Each automated scenario validates a meaningful application state and is designed to be independently understandable and maintainable.
