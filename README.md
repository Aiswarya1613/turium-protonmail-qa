# Proton Mail Web Automation QA Assessment

Automation QA assessment for the Proton Mail web application.

The project contains a focused Playwright regression suite covering authentication, email composition and delivery, drafts, inbox actions, search, attachments, filters, and asynchronous mail behavior.

The final submitted regression run contains **15 automated scenarios**, all of which passed successfully.

---

## Final Execution Result

| Metric | Result |
|---|---:|
| Automated scenarios | 15 |
| Passed | 15 |
| Failed | 0 |
| Skipped | 0 |
| Pass rate | 100% |
| Final execution time | 6.6 minutes |
| Browser | Chrome |
| Execution mode | Headed |

Detailed results are documented in:

```text
docs/test-execution-report.md
```

---

# Tech Stack

- Playwright
- JavaScript
- Node.js
- dotenv
- Git / GitHub
- Proton Mail Web

Validated locally with:

```text
Node.js: v21.7.1
npm: 10.7.0
Playwright: 1.62.1
```

---

# Why Playwright

The assessment was initially started with Cypress because that is the automation framework I have previously worked with professionally.

During implementation, Proton's authentication application repeatedly returned an application-level error page when executed through Cypress, although the same login worked manually.

I isolated the problem by creating a minimal browser smoke test using Playwright. Proton Mail loaded reliably in that environment, so I migrated the assessment automation to Playwright rather than spending the assessment time trying to work around an environment-specific Cypress compatibility issue.

The test strategy and exploratory findings were retained; only the browser automation implementation was changed.

This decision was made to prioritize reliable functional coverage and maintainable automation over framework preference.

---

# Project Structure

```text
turium-protonmail-qa/
│
├── docs/
│   ├── exploratory-notes.md
│   ├── test-cases.md
│   ├── test-strategy.md
│   └── test-execution-report.md
│
├── pages/
│   ├── LoginPage.js
│   └── ComposePage.js
│
├── playwright/
│   └── .auth/
│       ├── sender.json
│       └── receiver.json
│
├── tests/
│   ├── async/
│   │   └── undo-send.spec.js
│   │
│   ├── attachments/
│   │   └── attachments.spec.js
│   │
│   ├── authentication/
│   │   └── authentication.spec.js
│   │
│   ├── compose/
│   │   └── compose.spec.js
│   │
│   ├── drafts/
│   │   └── drafts.spec.js
│   │
│   ├── filters/
│   │   └── filters.spec.js
│   │
│   ├── fixtures/
│   │   └── qa-attachment.txt
│   │
│   ├── inbox/
│   │   └── mailbox-state.spec.js
│   │
│   ├── search/
│   │   └── search.spec.js
│   │
│   └── setup/
│       └── auth.setup.spec.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

Authentication storage-state files are ignored by Git and must not be committed.

---

# Test Accounts

The automation uses two dedicated Proton Mail accounts:

- Sender account
- Receiver account

This allows real end-to-end validation such as:

```text
Sender
  ↓
Compose email
  ↓
Send
  ↓
Receiver
  ↓
Verify delivery/state
```

Credentials are provided through environment variables and are not stored in source control.

---

# Environment Configuration

Create a local `.env` file in the project root.

Use `.env.example` as the template.

Example:

```env
SENDER_EMAIL=sender-account@proton.me
SENDER_PASSWORD=your-password

RECEIVER_EMAIL=receiver-account@proton.me
RECEIVER_PASSWORD=your-password
```

Do not commit `.env`.

The following are also excluded from source control:

```text
.env
playwright/.auth/
node_modules/
test-results/
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Aiswarya1613/turium-protonmail-qa.git
```

Move into the project:

```bash
cd turium-protonmail-qa
```

Install dependencies:

```bash
npm install
```

Install Playwright browser binaries if required:

```bash
npx playwright install
```

Create the `.env` file using `.env.example`.

---

# Authentication Setup

The suite uses Playwright `storageState` so every functional test does not repeatedly perform UI login.

Generate authenticated sender and receiver sessions with:

```bash
npx playwright test tests/setup/auth.setup.spec.js --headed
```

Successful execution should generate:

```text
playwright/.auth/sender.json
playwright/.auth/receiver.json
```

These files contain authenticated browser state and are intentionally excluded from Git.

If the stored session expires, rerun the authentication setup.

---

# Running the Regression Suite

The submitted regression suite consists of 15 tests.

Run:

```bash
npx playwright test tests/authentication/authentication.spec.js tests/compose/compose.spec.js tests/drafts/drafts.spec.js tests/inbox/mailbox-state.spec.js tests/search/search.spec.js tests/attachments/attachments.spec.js tests/async/undo-send.spec.js tests/filters/filters.spec.js --headed --reporter=list,html
```

The final submitted execution result was:

```text
15 passed (6.6m)
```

---

# Running Individual Areas

Authentication:

```bash
npx playwright test tests/authentication/authentication.spec.js --headed
```

Compose and send:

```bash
npx playwright test tests/compose/compose.spec.js --headed
```

Drafts:

```bash
npx playwright test tests/drafts/drafts.spec.js --headed
```

Inbox actions:

```bash
npx playwright test tests/inbox/mailbox-state.spec.js --headed
```

Search:

```bash
npx playwright test tests/search/search.spec.js --headed
```

Attachments:

```bash
npx playwright test tests/attachments/attachments.spec.js --headed
```

Undo Send:

```bash
npx playwright test tests/async/undo-send.spec.js --headed
```

Filters:

```bash
npx playwright test tests/filters/filters.spec.js --headed
```

---

# HTML Report

Generate the HTML report by running the regression suite with:

```bash
--reporter=list,html
```

Open the most recent report using:

```bash
npx playwright show-report
```

Playwright also captures diagnostic evidence such as screenshots, video, traces, and error context for failed executions according to the configured reporting settings.

---

# Automated Coverage

## Authentication

### TC-AUTH-001
Valid user can authenticate successfully.

### TC-AUTH-002
Login is rejected for an invalid password.

---

## Compose & Send

### TC-MAIL-001
Sender sends an email and delivery is verified using the receiver account.

### TC-MAIL-002
Attempting to send without a recipient displays recipient validation.

### TC-MAIL-003
Sending without a subject displays the subject confirmation flow.

---

## Drafts & Persistence

### TC-DRAFT-001
A composed message is automatically saved and can be reopened with persisted content.

### TC-DRAFT-002
An existing draft can be edited and transitioned successfully to Sent.

---

## Inbox & Organization

### TC-INBOX-001
A newly received unread message transitions to read after opening.

### TC-INBOX-002
A message can be archived and restored through Undo.

### TC-INBOX-003
A message can be moved to Trash and restored through Undo.

---

## Search

### TC-SEARCH-001
A newly received message can be located using a unique subject.

### TC-SEARCH-002
Advanced search combines a unique subject with the Sent location.

---

## Attachments

### TC-ATTACH-001
A local file can be uploaded successfully to the email composer.

---

## Asynchronous Behaviour

### TC-ASYNC-001
Undo Send restores the message instead of leaving it permanently sent.

---

## Filters

### TC-FILTER-001
When the existing sender filter is enabled, a matching message received from the sender account is automatically starred.

The test disables the filter during cleanup.

---

# Coverage Matrix

| Assessment Area | Automated |
|---|---:|
| Authentication | 2 |
| Compose / Send | 3 |
| Draft / Persistence | 2 |
| Inbox / Organization | 3 |
| Search | 2 |
| Filters | 1 |
| Async Behaviour | 1 |
| Attachments | 1 |
| **Total** | **15** |

---

# Automation Design

## Page Objects

Reusable interactions are extracted into page abstractions rather than duplicated in every test.

Examples:

```text
pages/LoginPage.js
pages/ComposePage.js
```

`ComposePage` centralizes common composer behavior such as:

- opening the composer
- entering recipients
- entering subjects
- interacting with the iframe-based message editor
- sending messages
- closing the composer

This keeps test files focused on scenario behavior rather than low-level UI mechanics.

---

## Authentication State Reuse

Functional tests use stored authentication states:

```text
sender.json
receiver.json
```

This reduces repeated login operations and makes functional tests faster and less dependent on authentication UI behavior.

Authentication itself remains separately covered by dedicated tests.

---

## Unique Test Data

Scenarios that create messages generate unique subjects using timestamps and random suffixes.

Example:

```text
QA-SEARCH-SIMPLE-<timestamp>-<suffix>
QA-INBOX-READ-<timestamp>-<suffix>
QA-FILTER-MATCH-<timestamp>-<suffix>
```

This prevents collisions with messages from previous executions and reduces dependency between test runs.

---

# Synchronization & Flakiness Strategy

The suite avoids relying on unnecessary fixed sleeps.

Instead, synchronization is based primarily on observable application state.

Examples:

- waiting for the Proton Mail navigation to become visible before considering the SPA ready
- waiting for receiver-side delivery using the unique subject
- waiting for message-state transitions
- waiting for validation dialogs
- waiting for Undo actions
- using bounded retry for search indexing

## Search Eventual Consistency

During implementation I observed that a newly delivered message can become visible in the mailbox before it is available through Proton's search index.

Instead of adding a large fixed sleep, the search tests retry the complete search operation within a bounded time window using Playwright's retry mechanism.

This keeps the test responsive when indexing is fast while still handling legitimate indexing delay.

---

# Test Isolation

Persistent mailbox state initially caused instability in some tests.

For example, repeatedly reusing one existing email for read/unread or star/unstar testing meant the result could depend on the state left by a previous execution.

Those scenarios were redesigned to use newly generated messages with unique subjects where appropriate.

The resulting tests establish their own test data and make fewer assumptions about previous mailbox state.

---

# Manual / Exploratory Coverage

Not every explored scenario was automated.

Manual exploratory testing included additional behavior such as:

- blank username/password validation
- session persistence after refresh/reopen
- CC/BCC behavior
- duplicate recipient behavior
- draft auto-save timing
- star/unstar behavior
- archive and Trash behavior
- advanced-search exploration
- search no-result state
- attachment removal
- attachment delivery to receiver
- filter enabled vs disabled behavior
- Undo Send timing window

Detailed observations are available in:

```text
docs/exploratory-notes.md
```

---

# Engineering Trade-offs

## 1. Which tests did you deliberately choose NOT to automate, and why?

I deliberately did not automate every exploratory scenario.

Examples include:

- visual differences between read and unread message styling
- every combination of CC/BCC recipients
- all attachment file formats and download behaviors
- detailed browser back/forward behavior
- UI/cosmetic observations
- repeated testing of every filter configuration option
- long-running scheduled-send scenarios

These scenarios either provide more value through exploratory observation, would add significant execution time, or would require additional setup for relatively low regression value.

I focused automation on repeatable workflows with meaningful business impact and stable assertions.

---

## 2. Which 5 tests would you run on every pull request? Which would you run nightly?

### Pull Request

I would prioritize:

1. TC-AUTH-001 — valid authentication
2. TC-MAIL-001 — sender-to-receiver delivery
3. TC-MAIL-002 — missing recipient validation
4. TC-DRAFT-001 — draft persistence
5. TC-SEARCH-001 — basic message search

These cover core user journeys and important regression risks while keeping feedback reasonably fast.

### Nightly

I would run the complete regression suite, including:

- advanced search
- cross-account Inbox state validation
- Archive/Trash restoration
- attachments
- filter behavior
- Undo Send
- additional browser configurations if available

The nightly suite can tolerate a longer execution time and include workflows dependent on asynchronous server behavior.

---

## 3. How would you diagnose a test that passes locally but fails intermittently in CI?

I would first determine whether the failure is caused by:

- application timing
- unstable test data
- environment differences
- authentication/session expiration
- browser/version differences
- network latency
- selector instability
- dependency on execution order

I would review:

- Playwright trace
- screenshot
- video
- console output
- network activity
- exact failing assertion

I would then reproduce the test repeatedly in isolation and as part of the complete suite.

I would avoid immediately increasing timeouts because that can hide the real issue.

During this assessment, this approach helped identify shared mutable mailbox data and search-indexing delay as separate sources of instability.

---

## 4. How would you reduce flakiness if the UI changes frequently?

I would:

- prefer stable `data-testid` attributes
- use accessible role/name locators where appropriate
- avoid CSS classes that exist only for presentation
- centralize reusable selectors inside page/component abstractions
- assert user-visible state instead of implementation details
- establish explicit test preconditions
- generate isolated test data
- avoid arbitrary sleeps
- use bounded retries only for genuinely eventually-consistent workflows

If a component changes, updating its page abstraction should fix multiple tests rather than requiring changes throughout the suite.

---

## 5. How would you scale this suite from 20 tests to 200+ tests?

I would separate the suite by domain and responsibility, for example:

```text
authentication/
compose/
drafts/
inbox/
search/
filters/
attachments/
```

I would expand reusable page/component abstractions and introduce dedicated helpers for:

- account/session management
- message creation
- test-data cleanup
- search
- mailbox state
- API-assisted setup where appropriate

I would also:

- tag tests by smoke/regression/nightly
- execute independent tests in parallel where safe
- use CI environment variables/secrets
- avoid shared mutable test data
- introduce API/direct-data setup for expensive UI prerequisites where supported
- monitor flaky tests separately
- keep PR coverage fast while moving slower workflows to scheduled suites

The goal would be to increase coverage without increasing duplication or making every test dependent on long UI setup flows.

---

# Known Automation Considerations

## Proton SPA Loading

In some executions Proton reached `DOMContentLoaded` while the application was still displaying its loading screen.

Tests therefore verify an application-specific UI element before assuming the mailbox is ready.

## Search Indexing

Search results may become available later than mailbox delivery.

The search scenarios handle this through bounded retry of the user search operation.

## Live Application

The tests run against the live Proton Mail service.

Execution time can therefore vary depending on:

- network conditions
- Proton response time
- email delivery latency
- search indexing latency

---

# Documentation

Additional assessment deliverables:

```text
docs/test-strategy.md
docs/test-cases.md
docs/exploratory-notes.md
docs/test-execution-report.md
```

---

# Final Result

The submitted Playwright regression suite contains:

```text
15 automated scenarios
15 passed
0 failed
100% final pass rate
```

The implementation prioritizes reliable end-to-end behavior, test isolation, reusable automation components, meaningful assertions, and practical synchronization strategies.