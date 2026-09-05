# Proton Mail - Defect & Findings Report

## Summary

During exploratory and automated testing of Proton Mail Web, no critical or blocking functional defects were identified in the core workflows tested.

Two observations were identified during exploratory testing:

1. Trash message count is not displayed in the navigation while counts are visible for some other mailbox sections.
2. A message restored from Trash after being deleted while unread appeared as read.

The first is documented as a usability/UI consistency observation.  
The second is documented as a behavior requiring product clarification because the expected read/unread restoration behavior is not known.

No defect has been manufactured where expected behavior could not be confidently established.

---

# Finding 1 - Trash folder does not display message count

## Title

Trash navigation does not display a message count while other mailbox sections expose counts.

## Type

Usability / UI consistency observation

## Severity

Low

## Priority

P3

## Environment

- Application: Proton Mail Web
- Browser: Google Chrome
- OS: Windows
- Test accounts: Dedicated Proton Mail sender and receiver accounts
- Date observed: 04-05 September 2026

## Preconditions

1. User is authenticated in Proton Mail.
2. Inbox contains one or more messages.
3. At least one message can be moved to Trash.

## Steps to Reproduce

1. Open Proton Mail.
2. Observe the mailbox navigation.
3. Note message counters displayed against sections such as Inbox or other folders where applicable.
4. Move a message from Inbox to Trash.
5. Expand/open the Trash section.
6. Observe the Trash navigation item.

## Expected Result

For consistency with mailbox navigation patterns, Trash could display the number of messages currently present in the folder.

## Actual Result

Messages are present in Trash, but no message count is displayed beside the Trash navigation item.

## Reproducibility

Observed consistently during exploratory testing.

## Impact

Low functional impact.

The user can still open Trash and access deleted messages. However, the lack of a count creates an inconsistent navigation experience compared with mailbox sections that expose counters.

## Evidence

Observed during manual exploratory testing and recorded in:

```text
docs/exploratory-notes.md