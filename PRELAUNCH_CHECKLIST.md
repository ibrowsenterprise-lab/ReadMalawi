# ReadMalawi — Prelaunch Test and Final Launch Gate

**Current project state:** DEVELOPMENT / TESTING. Public Render accessibility does not mean ReadMalawi is officially launched. Founder's explicit approval is required to change this state.

## Always-on testing rules

1. All data and enquiry submissions created before the official launch are TEST data, including the BUA Construction trial. Keep existing data intact unless the founder authorises specific record cleanup after review.
2. Never automatically email test respondents, solicit payment, issue an invoice, offer an actual service contract, book a session, distribute copyrighted PDFs or record a test as a real paying customer.
3. Keep the public free-reading core accessible; do not treat a future commercial contract as a reason to charge readers for third-party original-provider links.
4. Store no production secrets in GitHub or browser JavaScript. The public Supabase key is publishable; all privileged operations require private credentials and server-side access controls.
5. Keep member uploads PRIVATE until documented rights review and librarian approval. Do not bulk-approve legacy PDF candidates merely because their filenames look like books.
6. Document real impact only after verification. ReadMalawi's historic WhatsApp sharing is not proof of school/prison physical book distributions or registered charity status.

## Testing markers in this branch

- \`readmalawi-config.js\` has \`sitePhase: "testing"\`, \`customerNotificationsEnabled: false\`, \`bookingsEnabled: false\`, \`paymentsEnabled: false\`, \`donationsEnabled: false\`.
- \`assets/testing-notice.js\` shows a non-obstructive development banner on supported website pages. This banner is informational, **not an authentication or server-side security boundary**.
- \`assets/programme-enquiry.html\` and \`assets/partners.js\` prefix newly submitted text with \`[READMALAWI TEST]\`. Their own success messages explicitly describe test data, not real customer follow-up.
- \`assets/partner-inbox.js\` distinguishes marked test records and, while the site is in testing mode, renders email addresses as text rather than clickable email links. A production transition alone must NOT automatically contact old test records.
- The original Oct 12 BUA Construction form trial is labelled as a test in private admin notes, preserving original submission text.

## Manual acceptance test matrix

**Public pages (mobile Android + desktop browser)**

- [ ] Homepage loads without errors; temporary TEST banner is readable; links work.
- [ ] Free library shows 10 ReadMalawi stories and 10 original-provider catalogue links. Check individual reading stories and external provider link destinations.
- [ ] Reading Buddy guided mode works. The advanced AI coach must state whether it is *actually* enabled.
- [ ] Smart Study Sprint works with permitted text (below 80 characters rejected, 80–3,000 characters accepted; text stays in browser; .txt export contains only user-provided passage and rule-based aid).
- [ ] The programme form keeps its test label after page reload; wrong/missing fields block submission; valid test request displays a TEST acknowledgement.
- [ ] Partnership form remains for non-commercial sponsor/resource enquiries and displays a TEST acknowledgement.
- [ ] No donation, payment, subscription, checkout or paid booking is reachable.

**Private admin and database**

- [ ] Enquiry is stored in \`public.readmalawi_partnership_enquiries\` with \`[READMALAWI TEST]\` marker and no automated email.
- [ ] Authenticated librarian can see submitted test details, filter by service/status/test marker, and save test follow-up notes.
- [ ] Signed-out visitors and non-librarian accounts cannot list, read, update or export private enquiries.
- [ ] No real email is sent; mailto links are suppressed in test mode.
- [ ] RLS controls on book uploads, private storage and publication review are independently checked; no unknown legacy PDFs are exposed.
- [ ] Test records are preserved until explicit cleanup approval. Do not simply delete every database record or remove the evidence trail.

**Privacy, rights, accessibility, launch readiness**

- [ ] Validate on a small screen, a desktop browser, slow internet and assistive-tech keyboard navigation.
- [ ] Review actual privacy notice, consent and records retention before collecting real customer data.
- [ ] Check safeguarding and human review rules for school/children content and local language translations.
- [ ] Set prices only after approved costing; agree legal service provider, authorisation, contracts and compliant payment verification.
- [ ] Configure optional AI backend only when privately budgeted and tested, with use limits and safe handling of permitted text.
- [ ] Confirm the published production policy does not call an unregistered initiative a charity/NGO.

## Final launch procedure (explicit permission required)

1. Founder's written approval identifies release version/commit and specifically authorises moving from TESTING to PRODUCTION.
2. Verify every acceptance test and address blockers. Recheck any public visitor paths and browser console errors.
3. Review, archive or remove test data **only as specifically approved**. Keep necessary audit records privately.
4. Deploy reviewed production configuration; no client email notifications, paid checkout or invoicing is enabled merely by changing \`sitePhase\`. Those require a separate expressly approved deployment, verified backend controls and end-to-end tests.
5. Verify Render's reported live SHA matches the approved GitHub SHA, then conduct final mobile and laptop smoke tests.
6. Announce launch only after founder confirmation; record the official date and first verified programme results.

## Verified test evidence — 13 October 2026

- [x] Android librarian inbox opened with existing test enquiry visible; submitted fields and TEST warning displayed.
- [x] Librarian tapped Save follow-up; Supabase retained the changed private note and enquiry status `new`.
- [x] After UI fix deployed as commit `1a0bf18e`, the founder confirmed the prominent mobile save confirmation **PASSED**.
- [x] The BUA Construction trial enquiry remains flagged as TEST, with original private notes preserved.
- [x] Android pilot scope builder displayed the editable TEST draft with the correct programme data, privacy notice and buttons. The founder confirmed `.txt` download PASSED; the local file's contents were not independently inspected.
- [x] Android costing screenshot displayed an internal estimated cost of MWK 627,000, overhead of MWK 95,000, contingency of MWK 57,000, and the browser-only download-request confirmation. The actual text file's contents and every input were not independently inspected.
- [x] Founder screenshots (13 Oct 2026) confirm the ReadMalawi costing modal opens with the filename, clear buttons and local-only warning, and that **Open in new tab** displays the 8/8-reviewed cost report. The displayed arithmetic reconciles: direct MWK 692,000; overhead MWK 69,200; contingency MWK 152,240; total MWK 913,440.
- [ ] Test Preview file, Download again, Close, and the pilot scope builder's matching modal on a phone; visually inspect any downloaded file for accuracy.
- [ ] Test the **new responsive HTML new-tab viewer** replacing the tiny plain-text tab, including mobile font size, line wrapping, offline content escaping and no external resource requests.
- [ ] Test access denial with a separate non-librarian account; an authenticated librarian session alone cannot prove signed-out denial.
- [ ] Test remaining library, AI, translation, accessibility and rights checks before final launch.

The internal scope-builder is not a quoting engine or an AI model. It uses local fixed templates from existing private enquiry details, saves nothing automatically and cannot send emails, invoices, payments or booked sessions.

## Internal costing safeguards — 13 October 2026

- A rule-based, *browser-only* `assets/pilot-costing.js` supports internal cost modelling per private programme enquiry. Rates and quantities start blank; no external prices are invented.
- Eight editable expense categories cover preparation, facilitator hours, coordination, materials, internet, venue, travel and human review/safeguarding. Each category may be priced or marked Not applicable.
- All estimates are in Malawi Kwacha (MWK). Overhead is calculated on direct costs; contingency is calculated on direct costs plus overhead. Invalid or incomplete entries are flagged.
- Local `.txt` download excludes client identity/contact information; it is explicitly labelled TEST INTERNAL COSTING, not a quote, invoice, price list or contract. It records partial vs reviewed category coverage.
- No database writes, real customer emails, bookings, AI model calls, payment initiation, invoices or confirmed proposals are performed.
- [ ] Independently test MWK totals, editable rows, the mobile download and privacy on an authenticated librarian's phone; the code checks alone do not prove browser behaviour.

## Download usability update — 13 October 2026

The founder requested a prominent popup after exporting a costing document. The website now includes a browser-side dialog after each local download request, shared by the Pilot Scope Builder and Internal Costing tools. It shows the filename and provides Preview file, Open in new tab, Download again and Close. The on-page preview is a reliable fallback if the Android browser restricts new tabs; it does not automatically read or open the device's Downloads app. The browser controls whether a file was actually saved, so the dialog accurately says **Download requested** rather than claiming that the operating system confirmed it.

- [x] The mobile costing dialog and actual opened text tab were displayed in the founder's screenshots. The new responsive replacement remains to be retested.
- [ ] Check a downloaded .txt file in Android Downloads before declaring the local file saved and readable.

## Readable mobile new-tab viewer — 13 October 2026

After the founder demonstrated that Android's native `text/plain` browser tab rendered the costing in tiny, hard-to-read type, the internal **Open in new tab** action was changed to create a local, responsive HTML preview from the same in-memory text. It uses a mobile viewport, clear heading and readable wrapped monospace text. The private text is HTML-escaped and the preview uses a restrictive Content Security Policy with no external scripts or requests. The original file download remains a plain `.txt`, without any change to pricing, RLS, cost calculations, production readiness or the public library. The Android-specific result needs visual retesting.

## Reusable DEMO costing — 13 October 2026

The founder requested an end to repeatedly entering dummy estimates for routine UI checks. We introduced **Load DEMO estimate · 1 tap** in the authenticated pilot-costing panel:

- Loads eight fixed, clearly fictional costing lines and sets overhead to 10% and contingency to 20%.
- Expected test arithmetic: direct MWK 692,000; overhead MWK 69,200; contingency MWK 152,240; total MWK 913,440.
- Explicitly labels estimates and assumptions as fictional, not supplier rates, invoices or proposed customer prices.
- Requires confirmation before replacing existing input and never writes amounts to the ReadMalawi database.
- Does not disable manual costing for legitimate future scoping.
- [ ] Verify the one-tap DEMO button's mobile display at the next meaningful feature milestone; do not repeatedly require the founder to generate dummy budgets for every small UI refinement.

**Testing practice:** Reuse automated code/calculation checks and existing passed mobile evidence whenever possible. Only request fresh founder screenshots for a previously untested critical path or a newly reported defect. No production launch, customer invoicing, payment collection or client contact without explicit founder approval.
