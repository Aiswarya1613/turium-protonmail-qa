# Proton Mail Web — Test Strategy

## 1. Purpose

This strategy defines a focused, risk-based validation approach for the Proton Mail Web assessment. The goal is to demonstrate reliable functional automation, strong test design, deterministic state validation, maintainable Cypress architecture, and practical engineering judgment rather than maximizing the number of automated scripts.

## 2. Scope

### In Scope
- Authentication and session behavior
- Compose and send
- Draft auto-save and persistence
- Inbox/message organization
- Search, including one advanced/multi-condition scenario
- Filters/automation rules
- Attachments
- One asynchronous workflow: Undo Send
- Two-account end-to-end message verification

### Out of Scope for the Minimal Submission
- Account registration
- Password recovery
- MFA setup/recovery
- Password-protected email
- Scheduled Send automation
- Large-file and attachment-type boundary testing
- Extensive CC/BCC combinations
- Bulk inbox actions
- Full folders/labels CRUD coverage
- Mobile/responsive testing
- Cross-browser matrix
- Performance/load/security penetration testing
- API-assisted setup/cleanup
- Parallel execution

These items are not considered unimportant; they are deliberately excluded from the first submission to keep the suite reliable, maintainable, and achievable within the assessment timebox.

## 3. Test Objective

Validate high-value Proton Mail user journeys across positive, negative, state-transition, and asynchronous behavior while demonstrating:

- deterministic test data;
- stable synchronization without arbitrary sleeps;
- meaningful assertions against actual application state;
- maintainable abstractions;
- secure handling of credentials;
- useful failure evidence and reporting;
- clear separation between automated and exploratory coverage.

## 4. Test Approach

### Functional Testing
Manual exploratory testing was completed first to understand the live application and confirm current behavior before implementation.

### Automation Testing
Cypress with JavaScript will be used for the UI automation suite.

The minimal suite contains 15 high-value automated scenarios, matching all mandatory assessment categories while avoiding low-value duplication.

### End-to-End Testing
Where practical, two Proton test accounts are used:

`Sender → Send → Receiver → Verify`

This provides stronger regression value than validating only the sender-side confirmation state.

### State-Transition Testing
The suite includes workflows such as:

- Draft → Sent
- Inbox → Archive → Inbox
- Inbox → Trash → Inbox
- Unstarred → Starred → Unstarred
- Sent initiation → Undo → Draft
- Filter enabled → matching message starred
- Filter disabled → matching message not automatically starred

### Negative Testing
The minimal suite includes:

- invalid password;
- missing recipient;
- missing subject confirmation behavior.

## 5. Prioritization

- **P0 — Critical:** failure blocks a major user journey.
- **P1 — High:** high user/business impact or high regression value.
- **P2 — Medium:** useful coverage with lower immediate risk.
- **P3 — Low:** edge/cosmetic/low-risk coverage.

## 6. Automation Classification

- **Automate:** stable, repeatable, high-value regression scenario.
- **Manual / Exploratory:** human observation or investigation provides more value.
- **Not worth automating:** brittle, low-value, redundant, or disproportionately expensive to maintain.

## 7. Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Asynchronous page loading | Flaky assertions after navigation/login | Wait for stable application state, not fixed sleeps |
| Transient Undo Send state | Race conditions | Synchronize on Undo UI and resulting mailbox state |
| Email delivery latency | Receiver-side test instability | Use unique subjects and bounded retry/polling through UI state |
| Shared mailbox state | Tests interfere with each other | Generate unique subject data per test |
| Existing messages | False-positive search/action assertions | Target only uniquely generated QA messages |
| Dynamic DOM/UI updates | Brittle selectors | Prefer stable accessible labels/attributes and reusable page abstractions |
| Cross-account session switching | Authentication overhead/state leakage | Use isolated sender/receiver session helpers |
| Test-data buildup | Search ambiguity and slower mailbox actions | Use unique test markers and cleanup where practical |
| Live external application | Environment-dependent behavior | Keep assertions focused on observable user-facing state |

## 8. Test Data Strategy

- Use dedicated Proton sender and receiver test accounts.
- Keep real credentials only in local ignored configuration.
- Commit only an example credential file.
- Generate unique subjects with a timestamp or unique suffix, for example:
  - `QA-AUTO-SEND-<unique-id>`
  - `QA-DRAFT-<unique-id>`
  - `QA-UNDO-<unique-id>`
- Use a small deterministic text attachment fixture.
- Avoid dependencies on pre-existing inbox content.

## 9. Synchronization Strategy

The suite will avoid arbitrary hard-coded waits.

Preferred synchronization methods:

- wait for authenticated mailbox UI after login;
- wait for visible validation dialogs/messages;
- wait for message rows identified by unique subject;
- wait for destination mailbox state after archive/trash/move;
- wait for transient Undo control before interacting with it;
- use Cypress retryability for eventual UI state transitions;
- use bounded timeouts only where external mail delivery may require additional time.

## 10. Assertion Strategy

Assertions should validate actual behavior/state, not only clickability or visibility.

Examples:

- successful login → Inbox/mail navigation is loaded;
- invalid login → exact error message and no authenticated mailbox;
- send → receiver mailbox contains correct sender/subject/body;
- draft persistence → reopened draft retains recipient/subject/body;
- archive → message absent from Inbox and present in Archive;
- filter → matching message is starred when rule is enabled and not auto-starred when disabled;
- Undo Send → message returns to Drafts and is not delivered to receiver.

## 11. Minimal Automated Regression Suite

The initial suite contains exactly 15 scenarios:

- Authentication: 2
- Compose/Send: 3
- Draft/Persistence: 2
- Inbox/Organization: 3
- Search: 2
- Filters: 1
- Async behavior: 1
- Attachments: 1

This intentionally matches the minimum required category coverage while prioritizing reliability over test count.

## 12. Manual / Exploratory Coverage

The following remain manual/exploratory in the minimal submission:

- CC/BCC combinations
- Scheduled Send
- browser Back/refresh/reopen session variations
- folders and labels CRUD
- bulk message actions
- large/unsupported attachment types
- password-protected email
- mobile/responsive behavior
- cross-browser behavior
- usability observations and potential defect reproduction

### Rationale
These scenarios are useful but provide lower immediate regression value than the selected 15, have higher setup/maintenance cost, depend on plan/environment behavior, or are more valuable as exploratory checks within the available assessment time.

## 13. Potential Findings

Two observations from exploration are retained as findings rather than immediately reported as confirmed defects:

1. Trash navigation did not display an item count comparable to some other mailbox states.
   - Classification: UI consistency observation.
   - No confirmed requirement currently establishes that Trash must display a count.

2. An unread message appeared read after Trash → Restore.
   - Classification: potential state-transition inconsistency.
   - Requires deterministic reproduction before being reported as a defect.

The assessment explicitly requires genuine defects/findings rather than manufactured bugs, so uncertain observations remain clearly labelled.

## 14. Entry Criteria

- Sender and receiver accounts are valid.
- Both accounts can log in.
- Sender → Receiver manual mail flow works.
- Cypress is installed and launches successfully.
- Test credentials are configured locally and ignored by Git.

## 15. Exit Criteria for Minimal Submission

- 15 required automated scenarios implemented.
- All mandatory categories represented.
- Negative and asynchronous coverage included.
- Test suite executes with readable results.
- Failure evidence is generated.
- README explains setup, execution, architecture, assumptions, and troubleshooting.
- Test cases and strategy are documented.
- Genuine findings are documented without overstating uncertain behavior.

## 16. PR vs Nightly Execution Strategy

### Every Pull Request — 5 Tests
1. Successful login
2. Invalid password
3. Sender → Receiver email
4. Missing-recipient validation
5. Draft auto-save/reopen

These provide fast coverage of authentication, core messaging, validation, and persistence.

### Nightly
Run the complete 15-test suite, including:
- inbox state transitions;
- advanced search;
- filter behavior;
- Undo Send;
- attachment delivery.

The trade-off is speed versus breadth: PR checks should fail fast on critical regressions, while slower or state-heavy scenarios can run nightly.

## 17. Success Criteria

A successful suite should be:

- deterministic;
- readable;
- easy to install and execute;
- resistant to UI timing issues;
- explicit about test data and assumptions;
- easy for another QA engineer to debug and extend.
