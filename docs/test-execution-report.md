# Proton Mail Automation - Test Execution Report

## Execution Summary

| Item | Result |
|---|---|
| Application | Proton Mail Web |
| Automation Framework | Playwright |
| Language | JavaScript |
| Browser | Chromium / Chrome |
| Execution Mode | Headed |
| Total Automated Tests | 15 |
| Passed | 15 |
| Failed | 0 |
| Skipped | 0 |
| Pass Rate | 100% |
| Total Execution Time | 6.6 minutes |
| Execution Date | 05 September 2026 |

## Final Regression Command

```bash
npx playwright test tests/authentication/authentication.spec.js tests/compose/compose.spec.js tests/drafts/drafts.spec.js tests/inbox/mailbox-state.spec.js tests/search/search.spec.js tests/attachments/attachments.spec.js tests/async/undo-send.spec.js tests/filters/filters.spec.js --headed --reporter=list,html