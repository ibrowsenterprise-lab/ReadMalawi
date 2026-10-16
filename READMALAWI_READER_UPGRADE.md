# ReadMalawi reader and partnership improvements — 15 October 2026

## Implemented
- Complete paginated released-catalogue loader shared by library and Buddy; reading no longer waits for authentication.
- Verified the database has 100 released records, 3 pending and 3 rejected. The larger import archive is not the public catalogue.
- Conservative display-title formatting; original metadata retained. Missing authors are not invented.
- Catalogue matching for natural-language requests, explicit limits on length/level/region claims, suggested starting titles and visible discussion links.
- Language availability counts and explicit filtering/translation distinction.
- Dedicated PDF page reader with text view, text size, navigation, saved position and device speech; EPUB text extraction and personal text files supported.
- Personal files stay in the browser; no upload, publication or cloud AI calls. Speech voices are labelled as device/online where supported.
- Librarian-only metadata-quality desk with evidence check, filters, source preview and review CSV. Publication permissions remain unchanged.
- Physical book offers addressed directly to the confirmed coordinator's WhatsApp.
- Current-work/accountability page, proposed school-session example and reader privacy/content-enquiry page.
- Removed unavailable AI service cards and premature investment proposition; clarified present vs proposed activity.

## Validation
Run `npm ci --ignore-scripts` then `npm test`.
Tests cover capped catalogue pagination, no-progress errors, title suggestions without invented authors, matching, unavailable results, private text reading without network calls, safe rendering, speech, sections, save/resume, clear, size validation, EPUB extraction and external content rejection.
Live browser checks are recorded in the final delivery message.

## Items requiring real-world input, not fabricated website content
- All 100 released records have `verified_rights=false` and rely on pre-existing founder release. Publication was not changed. A librarian must verify and record actual permission evidence.
- 27 authors and 100 descriptions need source review. The quality desk exposes the work; display formatting does not certify metadata.
- Cloud reading AI and translation status endpoints report disabled. A provider key, budget, tested languages and deployment are needed before translation or cloud narration can be enabled.
- No live PayChangu donation link or account clearance has been confirmed. Hosted checkout remains inactive; temporary TNM Mpamba and FCB instructions are now authorised, with an MK700 minimum.
- No invented budgets, delivery partners, facilitator qualifications, governance officers, school outcomes or collection/distribution statistics were published.
- Phone screen-lock speech, device voices, scanned/OCR text, DRM and very large files have limitations; text/PDF reading remains available where supported.

## Live verification
- Public library displays 100 released books and 10 original stories, with Chichewa (1), English (82) and Unconfirmed (17) language counts.
- Personal sample opens without sign-in; save-position confirmation works.
- A Question of Power opened as a 182-page PDF; scanned pages correctly report no extractable text.
- English Grammar opened as a 99-page PDF and its cover text was extracted in Text view; page navigation was exercised.
- Signed-out visitors cannot open the librarian desk's records or edit controls.
- Cloud browser reports no installed speech voices. Actual audible speech and phone screen-lock behaviour were not verified; speech flow is covered by deterministic tests.
- Regional recommendation filtering was tightened after live testing: unknown provenance is not treated as a verified African/Malawian match.

## Visitor audit — 16 October 2026

- Public HTTP scan: 12 entry pages and 31 same-site referenced resources; no failed HTTP responses, missing linked fragments or duplicate IDs detected. This is a bounded scan, not a guarantee that every route works.
- Browser: public catalogue loaded 100 released titles; search for grammar found English Grammar; its discussion loaded the correct title and empty approved-comments state. Partnership form required-field validation worked. Private reader sample opened; this browser has no speech voices, and the UI explained that limitation. Physical book offer page showed the coordinator handoff and no guaranteed pickup. No genuine enquiries, comments, sign-in emails or payments were submitted.
- Fixed: moved the book-language selector from the closed navigation menu into the language section; renamed outdated AI & Learning navigation to Study tools; made text-file 2 MB limit explicit.
- Hardened partnership/programme submission and discussion loading/posting against thrown network errors; added request abort limits for writes, duplicate-click guard for partnership enquiry, retained unconfirmed form text, and clear instructions to check receipt before resending.
- A regression test simulates a failed enquiry and rapid repeated submission: one request only, button restored, original message retained, uncertain receipt explained.
- Remaining: real email sign-in delivery, authenticated posting and administrator review, phone speech voices/background behaviour, source permissions and missing catalogue metadata need separate verification.
