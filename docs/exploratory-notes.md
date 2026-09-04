# Proton Mail Exploratory Testing Notes

## Environment

- Application: Proton Mail Web
- Browser: Google Chrome
- OS: Windows 10
- Execution mode: Manual exploratory testing
- Test Account A: Sender test account
- Test Account B: Receiver test account
- Viewport: Desktop
- Test date: 2026-09-04

> Note: Real account credentials are intentionally excluded from this document and are stored only in local ignored configuration.

## Objectives

- Understand critical Proton Mail user journeys before automation.
- Identify high-risk regression scenarios.
- Identify positive, negative, boundary, and state-transition behavior.
- Identify workflows suitable for stable UI automation.
- Identify scenarios better suited for manual/exploratory testing.
- Identify genuine defects, usability issues, inconsistencies, and automation risks without manufacturing defects.

---

## 1. Authentication & Session

### AUTH-EXP-01 — Valid Login

**Observed**
- Login with valid credentials succeeds.
- A Proton Mail loading/intermediate screen is displayed before the mailbox becomes available.
- The Inbox is displayed after loading completes.
- The mailbox UI is a better indicator of successful authentication than only checking the URL.

**Automation notes**
- Avoid asserting login success only through URL change.
- Wait for a stable authenticated application element/state, such as the Inbox/mail navigation area.
- Synchronize with the application loading state rather than using fixed sleeps.

### AUTH-EXP-02 — Invalid Password

**Observed**
- Login is rejected when a valid username is combined with an invalid password.
- Exact error message observed:

> The password is not correct. Please try again with a different password.

- Username and password fields are visually marked as invalid after submission.

**Automation notes**
- This is a strong deterministic negative-login candidate.
- Assert the exact error message and that the user remains unauthenticated.

### AUTH-EXP-03 — Username / Required-Field Validation

**Blank username**
- Submission is blocked.
- Exact inline validation observed:

> This field is required

**Invalid username**
- Submission is rejected.
- A toast message is displayed:

> Invalid username

**Blank password**
- The observed behavior is equivalent to the blank-username required-field validation.

**Automation notes**
- Blank required-field validation is deterministic and inexpensive.
- Invalid username behavior is also suitable for automation, but only one negative login scenario is required for the minimal suite.

### AUTH-EXP-04 — Session Persistence and Navigation

**Observed**
- Pressing `F5` did not visibly change the page during the exploratory session.
- Clicking the browser refresh/reload control showed the Proton Mail loading screen and then returned to the mailbox.
- Navigating from Inbox to Drafts and then using browser Back returned to the previous mailbox page.
- Closing the tab and reopening Proton Mail showed the loading screen and then restored the authenticated session.
- Session state therefore persisted during the observed reopen flow.

**Automation notes**
- Refresh/session persistence is a useful state-oriented scenario, but it is lower priority than successful and failed login for the first minimal automation pass.
- Browser/session behavior can be environment-sensitive, so it should not be over-asserted.

---

## 2. Compose & Send

### MAIL-EXP-01 — Sender → Receiver End-to-End Send

**Test data**
- Unique subject pattern used: `QA-AUTO-SEND-<timestamp>`
- Sender: Sender test account
- Receiver: Receiver test account

**Observed**
- Message composition and send completed successfully.
- After Send was clicked, a transient sending state was shown.
- After sending completed, a confirmation/Undo state was displayed.
- The receiver account received the message.
- Sender, recipient, subject, and body content were verified from the receiver side.

**Automation notes**
- Strong P0 end-to-end candidate.
- Use unique subjects to make the message deterministic and searchable.
- Validate receiver-side message state rather than only sender-side success UI.

### MAIL-EXP-02 — Missing Recipient

**Observed**
- The Send button can be clicked with no recipient.
- A blocking dialog appears.

**Exact text**
- Title: `Recipient missing`
- Message: `Please add at least one recipient.`

- The composer remains available after the warning.
- The message is persisted in Drafts.
- The draft can be reopened.

**Automation notes**
- Strong negative compose candidate.
- Assert the dialog and preserved draft state.

### MAIL-EXP-03 — Empty Subject

**Observed**
- Sending with a valid recipient but no subject displays a confirmation dialog rather than immediately failing.

**Exact text**
- Title: `Subject missing`
- Message:
  `You have not given your email any subject.`
  `Do you want to send the message anyway?`

**Actions available**
- `Send anyway`
- `Cancel`

**Automation notes**
- Good validation/state-transition scenario.
- For the minimal suite, missing-recipient validation has slightly higher regression value because a recipient is mandatory while subject is optional after confirmation.

### MAIL-EXP-04 — CC/BCC

**Observed**
- CC is not shown as an expanded field until the user selects `CC`.
- BCC behaves the same way.
- The same receiver address could be added in multiple recipient fields.
- The message was successfully sent and received.

**Automation notes**
- Valuable functional coverage but not required for the first minimal suite.
- Can be added later if time remains.

---

## 3. Drafts & Persistence

### DRAFT-EXP-01 — Auto-Save and Reopen

**Observed**
- A composed unsent message is automatically saved as a draft.
- The UI displays a saved timestamp/status near the Send button.
- After the composer is closed, the message remains in Drafts.
- Selecting the draft reopens the composer with the saved content.
- Refreshing while a draft is open shows the Proton Mail loading screen and returns to the Drafts page.
- After refresh, the composer itself is not automatically reopened; the saved draft remains available in the Drafts list.

**Automation notes**
- Good persistence scenario.
- The stable assertion should be the draft's presence plus the persisted To/Subject/Body after reopening.
- Do not assert that the composer remains open across refresh because observed behavior shows it does not.

### DRAFT-EXP-02 — Draft → Sent Transition

**Observed**
- Editing a draft updates the saved timestamp/status.
- Sending the edited draft removes it from Drafts.
- The message appears in Sent.
- The receiver account receives the final edited message.

**Automation notes**
- Strong state-transition candidate.
- This scenario validates persistence plus movement from Draft to Sent and receiver delivery.

---

## 4. Inbox & Message Organization

### INBOX-EXP-01 — Read / Unread

**Observed**
- Unread messages are visually emphasized with darker/bolder styling.
- Read messages appear in a lighter/grey style.
- The unread message counter decreases when a message is read.
- State survives refresh.

**Automation notes**
- Prefer asserting semantic state or counter/state changes rather than visual color alone.

### INBOX-EXP-02 — Star / Unstar

**Observed**
- Starring a message fills the star icon and places the message in the Starred section.
- Unstarring removes the filled state and removes the message from Starred.
- State survives refresh.

**Automation notes**
- Strong, deterministic organization-state candidate.

### INBOX-EXP-03 — Archive / Restore

**Observed**
- Archiving removes the message from Inbox immediately.
- A transient `message archived` notification with Undo is shown.
- The message appears in Archive.
- Selecting the archived message and using the move-to-Inbox action restores it.
- A transient Undo notification is shown for the restore/move action.
- State survives refresh.

**Automation notes**
- Strong inbox organization candidate.
- Assert destination state (Inbox vs Archive), not only the toast.

### INBOX-EXP-04 — Trash / Restore

**Observed**
- Moving a message to Trash removes it from Inbox immediately.
- An Undo notification is displayed.
- The message appears in Trash.
- Restoring from Trash returns it to Inbox.
- During exploration, a message that was unread before deletion was observed as read after restoration.
- State survives refresh.

**Automation notes**
- Trash/restore is a useful message-state transition.
- The unread → read observation should be treated as a potential finding until reproduced deterministically and checked against intended behavior.

---

## 5. Search

### SEARCH-EXP-01 — Simple Search

**Observed**
- Searching for known QA-generated message data returns matching messages.
- Search results can be cleared to return to the mailbox view.

**Automation notes**
- Use a unique generated subject to avoid dependence on pre-existing mailbox content.

### SEARCH-EXP-02 — No Results

**Observed**
- Searching for `ZZZ-NO-SUCH-MESSAGE-938472` returned the no-result state.

**Exact text observed**
- `No results found`
- `You can either update your search query or clear it`

**Automation notes**
- Deterministic negative-search candidate.
- Useful but lower business value than positive search for the minimal suite.

### SEARCH-EXP-03 — Advanced / Multi-Condition Search

**Observed**
- Advanced filtering/search options were available.
- A sender-based condition could be applied.
- `Primary` was available as the relevant mailbox/category option in the observed UI instead of a generic `Inbox` option.
- The resulting search state was reflected in the URL/query and mailbox contents.

**Automation notes**
- The assessment requires one advanced/multi-condition search scenario.
- Build this around stable fields actually observed in the current UI rather than assuming documentation labels.

---

## 6. Attachments

### ATTACH-EXP-01 — Upload, Remove, Re-upload, Send, Receive

**Observed**
- A local text file was uploaded successfully.
- The attachment area displays attachment size/count.
- Selecting `Show` reveals the attachment filename and changes the control to `Hide`.
- The file can be removed using the close/remove control.
- The file can be uploaded again.
- The message can be sent successfully with the attachment.
- The receiver account receives the message and the attachment is present.

**Automation notes**
- Strong end-to-end attachment candidate.
- Keep the test fixture small and deterministic.
- Assert filename presence on sender and receiver side.

---

## 7. Asynchronous Workflow — Undo Send

### ASYNC-EXP-01 — Undo Send

**Observed**
- After Send is selected, Proton Mail displays a transient Undo option.
- The Undo option remains available for approximately 10 seconds in the observed configuration.
- Clicking Undo prevents receiver delivery.
- The message returns to Drafts rather than remaining in Sent.
- The receiver did not receive the undone message.

**Automation notes**
- Strong asynchronous candidate.
- Do not use an arbitrary `cy.wait(10000)`.
- Synchronize against the appearance and disappearance/state transition of the Undo UI and the resulting Draft/Sent state.
- Receiver non-delivery should be verified within a bounded, documented observation window.

---

## 8. Filters / Automation Rules

### FILTER-EXP-01 — Matching vs Disabled Filter

**Filter configured**
- Condition: Sender matches/contains Sender test account
- Action: Star matching message

**Observed — Enabled**
- A new message from the sender was automatically starred in the receiver mailbox.

**Observed — Disabled**
- After disabling the filter, a new sender message was received without being automatically starred.

**Automation notes**
- This directly covers matching vs non-active rule behavior.
- Good required filter scenario, but UI setup is more complex than core mail flows.
- Keep it in the suite because at least one automated filter scenario is required by the assessment.

---

## 9. Potential Findings / Risks

### FINDING-01 — Trash item count not displayed

**Classification**
- Potential UI inconsistency / usability observation
- Not yet confirmed as a product defect

**Observed**
- During exploratory testing, message/item count information was visible for Archive-related state, while the Trash navigation item did not show a comparable count.

**Why this is not yet filed as a confirmed defect**
- The exploratory session does not establish that Proton Mail is expected to display a Trash count.
- This could be intentional product behavior.
- It should only be promoted to a defect after confirming expected behavior through product requirements/documentation or a reproducible inconsistency with equivalent navigation items.

### FINDING-02 — Unread message restored from Trash becomes read

**Classification**
- Potential state-transition inconsistency
- Requires reproducibility check before filing as a defect

**Observed**
1. A message was unread in Inbox.
2. The message was moved to Trash.
3. The message was restored to Inbox.
4. The restored message appeared as read.

**Risk**
- If unread/read state is expected to persist through Trash → Restore, this could represent lost message state.

**Next validation**
- Repeat the flow with a newly created unread test message.
- Confirm whether the behavior occurs consistently.
- If reproducible, document exact steps, expected behavior rationale, actual state, screenshots, and environment before deciding whether to report it as a defect.

---

## 10. Exploratory Risk Summary

| Area | Main risk identified | Initial automation priority |
|---|---|---|
| Authentication | Invalid credentials, session state | P0/P1 |
| Compose/Send | Delivery failure, recipient validation | P0 |
| Drafts | Loss of persisted content / incorrect state transition | P1 |
| Inbox actions | Incorrect message organization/state | P1 |
| Search | Incorrect or stale result filtering | P1 |
| Attachments | Attachment lost between compose and receive | P1 |
| Undo Send | Timing/state race conditions | P1 |
| Filters | Rule does not apply or applies when disabled | P1 |

## 11. Automation Engineering Risks Identified

- Proton Mail contains asynchronous loading states between authentication/navigation transitions.
- Send and Undo Send contain transient states that must not be automated with fixed sleeps.
- Mailbox tests can become order-dependent if they reuse existing messages.
- Tests should create unique subjects/test data for isolation.
- Cross-account workflows require deterministic switching between sender and receiver sessions.
- Assertions should validate mailbox/message state, not only visibility of buttons or toast notifications.
- Generated test data should be cleaned up where practical to prevent mailbox pollution.
- Selectors should favor stable accessible attributes/labels where available and avoid brittle DOM-depth selectors.

