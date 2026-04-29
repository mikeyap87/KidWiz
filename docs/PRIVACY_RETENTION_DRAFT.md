# KidWiz Privacy And Retention Draft

This is the plain-English policy draft for local review. It is not legal advice and should be reviewed before KidWiz is used with real families.

## Parent Consent

- A parent should approve child profiles before real child use.
- A parent should approve AI tutoring before live tutor prompts are used with a child.
- Sensitive learning topics stay locked until a parent intentionally unlocks them.
- KidWiz should record which parent approved the unlock, what was approved, and when it happened.

## Parent Data Rights

- Parents should be able to export a readable family archive.
- Parents should be able to delete the signed-in cloud copy.
- KidWiz should keep child-authored reflections separate from parent notes.
- Story choices, quiz answers, and learning progress should be treated as practice signals, not diagnoses or permanent labels.

## Retention Draft

| Data area | Draft retention |
| --- | --- |
| Learning progress | Keep while the family account is active, unless the parent deletes it. |
| Child journals | Parent-controlled export and deletion by child, category, or full account. |
| Parent notes | Parent-owned and removable with the family account. |
| Tutor prompts | Keep only for a short review window needed for parent review, safety QA, and abuse prevention. |
| AI safety events | Store separately from ordinary learning records and keep parent-visible. |
| Dormant accounts | Delete or anonymize after a clear parent notice window. |

## Current Prototype Behavior

- Local demo state still lives in the browser by default.
- `Export data` downloads a readable JSON file for the current family workspace.
- `Delete cloud` removes the signed-in Supabase family workspace and AI safety event rows.
- Deleting the cloud copy does not erase the local browser preview.
- The Supabase migration still needs to be applied and tested with a signed-in parent account before this is treated as real persistence.

## Before Public Child Use

- Review this draft with legal/privacy guidance.
- Decide the exact tutor-prompt retention window.
- Decide the dormant-account notice period.
- Add a parent-visible consent acceptance step to real account setup.
- Add repeatable AI safety evidence for safe prompts, blocked prompts, parent summaries, no-key fallback, and export/delete behavior.
