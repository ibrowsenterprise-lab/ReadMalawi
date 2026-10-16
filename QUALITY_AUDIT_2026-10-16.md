# ReadMalawi audit — 16 October 2026

Scope: visitor journeys, developer reliability, partner trust and AI readiness. This is a bounded audit, not a claim that every device or future failure has been tested.

## Confirmed defects fixed

- Cancelled personal file reads and PDF text extraction could alter shared reader state after a newer book opened. Generation checks now precede those mutations. Tests delay both a file read and PDF extraction, open a new book, then resolve the old work and verify the new content and bookmark identifier remain intact.
- Clear notes hid the Smart Study Sprint result but left its source-derived quotation and keywords in the DOM. It now clears those nodes and disables export through the cleared generated state.
- Guided Buddy interpreted “donate money for books” as a physical book offer. Explicit cash/financial requests now lead to the financial-support page, while physical book offers retain their own route. Reading instructions use the visible “Read here” button label.
- Story speech exposed a play control without an available English voice. It now waits for an English voice, updates on voiceschanged, and distinguishes device voices from online speech services.
- Escape did not close the embedded Buddy when keyboard focus was inside its iframe. The same close action now handles Escape there and returns focus to the launcher.
- The private partner inbox discarded the displayed list before refresh and did not recover from thrown connection failures. Failed refreshes now preserve displayed records, show an error and restore Refresh. Saves block overlapping writes, temporarily lock edited fields, time out and preserve notes after failure. Success messages no longer call live enquiries test records.

The preceding audit commit also prevents overlapping email-link requests and handles sign-out failures visibly.

## Verification

- All 12 npm test groups passed, including focused race, privacy, routing, speech and inbox recovery tests. Tests use synthetic content and mocked services; they do not email visitors or create real enquiries or payments.
- Public resource scan: 33 HTML pages, 74 deployed HTML/JS/CSS/JSON resources loaded successfully. Repository-only package manifests return 404 on the static website as expected; they are not visitor links.
- Internal HTML page targets and fragments resolved. Logo and portrait are checked separately because they are not text resources.
- Database policies: feedback SELECT is restricted to administrators; anonymous feedback query returned zero rows. Anonymous partnership SELECT is denied at table privileges. Both tables have RLS enabled; partnership submissions require consent and enforce field-length/status constraints. No access permissions were broadened.
- AI readiness endpoint returned ai_enabled=false. No AI model was activated, no provider keys were inspected and no reader content was sent to a model.
- Partner content describes current digital work, future institutional pilots, legal status, temporary receiving accounts and voluntary contribution purposes without invented impact figures or funding outcomes.

## Unresolved work requiring evidence or user/device participation

- Catalogue: 100 released records; 27 missing/unverified author fields, 100 empty descriptions, 100 without verified_rights=true. The permission flag alone does not establish the legal status of each work. A librarian must inspect title pages and retain publication-permission evidence before marking records verified. No author, description, permission or impact evidence was invented during this audit.
- Android/iOS speech, voice quality, screen locking and real mobile accessibility require physical-device testing. Cloud-browser voice availability is not evidence of phone behaviour.
- Actual sign-in email delivery and authenticated administrator journeys need the owner's participation. Automated tests cover failure/success handling, not mailbox deliverability.
- Proposed school programmes require a named facilitator, safeguarding responsibilities, capacity, actual costing and reporting arrangements agreed with the institution. None has been presented as a completed programme.
- PayChangu and OneKhusa remain paused. No hosted gateway was activated; minimum voluntary contribution remains MK700 through the approved TNM Mpamba and FCB instructions.
- Advanced AI requires a separate evaluation before activation: reviewed English/Chichewa examples, multilingual accuracy, prompt-injection tests with untrusted book metadata, personal-information handling, account-change history isolation, quota/cost checks and disclosure of external processing. Dormant code is not proof of model quality or safety.
- Existing security advisor output includes password-leak protection disabled and five RLS-without-policy informational entries on protected service/audit tables. Public sign-in currently uses email links. These findings were not resolved by changing access policy during a UI audit.

No claims of a flawless site, measured literacy improvement, physical book delivery or verified model performance are made.
