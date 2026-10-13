# ReadMalawi — Digital Literacy Project

Founded by Jones Nalikungwi. ReadMalawi's proposed literacy and book-donation project was publicly reported in 2019 after historical discussions with the late DD Phiri. To date, its recorded achievement is sharing digital books in an existing WhatsApp community of 126 members. No physical book deliveries or NGO registration have taken place.

## Digital reading hub

- Mobile-friendly free reading links, original quiz and AI learning prompts.
- Language choices: English, Chichewa, Chitumbuka, Chiyao, Chilomwe, Chisena and Chitonga.
- **Not** a complete seven-language translation: local-language content requires review by fluent speakers.
- The site doesn't process donations or payments.

## Brand

The emblem concept joins a book, the Malawi silhouette and expanding access to knowledge. `assets/readmalawi-symbol.svg` is a compact site icon. The approved larger logo will appear on the landing page after `assets/readmalawi-logo.png` is uploaded to the assets folder.

## GitHub Pages

Repository: `ibrowsenterprise-lab/ReadMalawi` (separate from IBROWS).

Go to **Settings → Pages → Deploy from a branch → main → /(root) → Save**. After successful deployment, the conventional address is `https://ibrowsenterprise-lab.github.io/ReadMalawi/`.

GitHub Pages is for the free educational pilot, not a paid e-commerce or SaaS platform. Future paid training or charitable receipts need suitable hosting and legal arrangements.

See [ROADMAP.md](ROADMAP.md) and [TRANSLATION_REVIEW.md](TRANSLATION_REVIEW.md).


## Community library (new)
- [Open the searchable e-book and audiobook library](library.html). It has title/author search, category, language, e-book/audiobook filters, and automatically fetches legal-source CATALOGUE METADATA from Project Gutenberg and LibriVox.
- Member PDFs/EPUBs and audiobook uploads are accepted into **private Supabase storage**, and librarians review rights before any public publication. The bulk uploader and duplicate detection passed small-batch tests. ReadMalawi does not automatically publish third-party PDFs.
- See [LIBRARY_SETUP.md](LIBRARY_SETUP.md) and [the database schema](supabase/readmalawi_schema.sql) for deployment and security requirements.
- Permission checks and administrator approval must precede public publication of any member file.
- Proposed five-free-download / MK500 scheme and MK100 minimum donations are **not active**. No website payment processing or charitable collection has been enabled.
- A publicly viewable file can still be saved; a future paid content-access model requires a dedicated server and payment validation, not merely JavaScript counters.

## Render preview (2026-10-09)

- Frontend deployment: https://readmalawi-library.onrender.com/
- Public library page: https://readmalawi-library.onrender.com/library.html
- Service: `readmalawi-library` (Render static site), tracked from `main` with automatic deployments.
- The frontend is live and connected to the separate ReadMalawi Supabase backend for private uploads and moderation; payment and donations are **not enabled**. Rights clearance and scaling/storage controls are still required.
- **Do not upload commercial copyrighted works for public release without rights clearance.** Special online-only playback is not DRM.

## Original on-site stories (11 October 2026)

The pilot reading shelf now contains **10 free, original English stories**. Each has a dedicated ReadMalawi reading page, a short comprehension question and a Book Club discussion link. The latest six stories cover reading access, basic mathematics, careful science observations, language and human translation review, online safety, and checking facts before making accusations. Stories are original educational fiction, not historical records of ReadMalawi programmes.

Languages other than English must not be labelled as translated or published until a fluent human reviewer approves the text. The digital library still does not charge readers or accept charitable payments.

## Hybrid original-source reading catalogue (12 October 2026)
- Free Reading: 10 on-site original English stories plus 10 curated external original-provider links available via the main library's searchable catalogue and the Official Reading Sources page. The provider links open externally and no third-party PDF is copied onto ReadMalawi.
- Private uploads: files awaiting verification remain private. Uploaded-file publication requires rights evidence and administrator approval; never assume that a free source download gives redistribution permission.
- Optional learning tools: Smart Study Sprint works locally in browsers, while AI Reading Coach requires secure backend activation. Education and language-service enquiries may be submitted, but no checkout, paid AI access, charitable collection, or price guarantees are currently enabled.
- Current collection metadata audits and legacy bulk-upload experiments do **not** equal rights-clearance for 1,793 PDF reading candidates.

## Learning-programme enquiry workflow (12 October 2026)

ReadMalawi's sustainability model is **free reading + optional contracted educational services**, not a paywall on public-domain or openly linked books.

- New structured service enquiry route: [Request a Learning Programme](assets/programme-enquiry.html). It covers school reading/study-skills pilots, responsible AI workshops, and author/publisher or human-reviewed translation services.
- Visitors provide their intended audience, estimated group size, delivery preference, timeframe, general area, learning goals and contact information. No student identities, private records or payment information should be collected.
- The form submits through the existing `public.readmalawi_partnership_enquiries` table with a predefined existing service interest and an explicit contact-consent flag. Existing database constraints, rate limiting and administrator-only read/update access continue to apply. No database migration was needed.
- The [Learning & AI Lab](assets/learning-services.html), [Partnerships](assets/partners.html) and homepage provide direct links. Sponsorship and donation enquiries continue using the general partnership form.
- The [Private Programme & Partnership Inbox](assets/partner-inbox.html) now filters by service track and follow-up status. Administrators may save notes and record follow-up states; there is no automated acceptance, quote, invoice or email sent.
- **Internal Pilot Scope Builder (testing):** An authorised librarian can select **Prepare TEST pilot brief** on school, AI literacy or publisher service enquiries. A private browser-only template draws on the submitted programme requirements, keeps the contact's name/email out of the exported draft, and offers an editable local `.txt` download. This tool does **not** email, save a proposal to Supabase, issue a quote, calculate fees, book sessions or use paid generative AI. Human review and explicit founder approval remain necessary.
- **Internal Costing Worksheet (testing):** Authorised librarians can open **Prepare TEST internal costing** on a programme request. Quantities and Malawi Kwacha unit costs default to blank; line totals, overhead and contingency are calculated locally with input validation and explicit unpriced/Not-applicable categories. A downloadable `.txt` internal cost report contains no client contact information and is marked as a test estimate, **not a quotation, invoice, advertised programme price or contract**. Tax/compliance, staffing, margin and legal review are separate approval steps; the tool does not send or save costs, book programmes, take payments or trigger customer notifications.
- **Internal Proposal Builder (testing):** An authorised librarian may open **Prepare TEST proposal draft** on a programme enquiry. It combines the live editable scope and browser-only costing into an internal eight-part concept, with editable content, local `.txt` and formatted `.html` exports. Four review checks can only mark a completed, non-demo draft as **ready for founder review (TEST)**; no real founder approval, customer release, quote, email, invoice, contract, payment or booking is possible. Demo costing is never accepted as verified expenditure.
- Pricing is **not published or fixed**, and memberships, donations, premium AI access and checkout remain disabled. Commercial programmes require scope confirmation, an appropriate legal arrangement, any necessary participant safeguards, a written proposal and verified payment arrangements before delivery.
- Acceptance testing is still required in a real reader/admin browser session: check the Render deployment of the newest GitHub commit, submit one explicitly authorised test enquiry, verify it is visible only to a logged-in librarian, update its follow-up status, then confirm it is not public.

## Current release status — TESTING ONLY

The Render static site is a **publicly accessible development preview**, not an official commercial launch. `readmalawi-config.js` sets `sitePhase: "testing"`; the public reading/learning pages show a test notice and the programme and partner forms record `[READMALAWI TEST]` enquiries. Existing BUA Construction trial is recorded as a test. Customer notifications, bookings, payments and donations remain disabled. **Only the founder may authorise a final production launch.** See [PRELAUNCH_CHECKLIST.md](PRELAUNCH_CHECKLIST.md) for the acceptance tests and release gate.

## Prelaunch security and approval safeguards (13 October 2026)

ReadMalawi is a **development/testing preview**, not an officially launched company or charity. The database now enforces least-privilege enquiry access and a **member-book publication freeze** until the founder explicitly authorises a production release. The private proposal builder can generate an internal founder **review packet** but cannot approve, email, invoice or release client-facing documents. Do not confuse its browser-only checklist with a verified founder approval process. See [Security Audit](SECURITY_AUDIT_2026-10-13.md) and [Prelaunch Checklist](PRELAUNCH_CHECKLIST.md) for verified tests, unresolved security advisories and launch blockers.

## WhatsApp reading forum and physical-book offers — 13 October 2026

**Reader experience:** Each book card on the [library](library.html#whatsapp-forum) has an **Ask in our WhatsApp forum** link. It prepares a short request for a lawful source and opens WhatsApp's contact/chat selector, so the user chooses the existing ReadMalawi group and explicitly taps Send. No automatic posting, file redistribution or copyright licence is assumed. The existing forum is a community activity, separate from the public website's unapproved member-book upload catalogue.

**Physical book giving:** [Offer physical books](assets/physical-books.html) is intentionally a two-input form: **approximate number of books** and **general town/area**. The action opens a prefilled WhatsApp message for the donor to share with the forum or coordinator. No name, phone, email, title, author, account or street address is requested on the site; no Supabase donor database row is created. ReadMalawi may discuss possible local collection over WhatsApp, but actual collection and school/prison handovers are still future activities requiring logistics and recipient permissions. No NGO/charity registration, automatic pickups, cash donations, receipts, or successful physical distribution are claimed.

**Founder-supplied invitation (13 October 2026):** The founder supplied the WhatsApp invitation for **Lets Read Malawi📖** as `https://chat.whatsapp.com/EoH1rROh8Li4XddSjIjY4a` (tracking/share parameters removed for cleaner links). `readmalawi-config.js` now contains that invitation, so the public **Join the ReadMalawi WhatsApp forum** button is activated on the homepage, the library and the physical-book-offer page. Reader-initiated WhatsApp book requests still choose a chat and require pressing Send. This group invitation is intended to be shared publicly, so administrators should be prepared to moderate new members and reset the invite if needed. The group link has not been tested by joining it as a non-member.

**Site-wide phase:** Development/testing mode remains active. Donor action is user-initiated and is not an agreement or confirmed pickup. This feature is about **physical books**, not online payments or financial fundraising; `donationsEnabled: false` stays unchanged.

## Private TEST physical book collection desk (13 October 2026)

ReadMalawi now has a [private Physical Book Collection Desk](assets/collection-desk.html) linked from the librarian [Programme Inbox](assets/partner-inbox.html). This is an internal planning ledger for **fictional prelaunch TEST offers only**, manually entered by authorised librarians after a WhatsApp conversation. It does not read the WhatsApp group, collect donor contact data, send WhatsApp messages, collect real books or arrange any pickups. The public donor form still asks only for an approximate book count and general town/area before opening WhatsApp.

A protected Supabase table retains count, general area, a short internal planning note, actor UID and one of four TEST statuses. PostgreSQL RLS and column grants block anonymous users and unauthorised signed-in users. It is impossible to mark a book **collected** or **distributed** in the TEST schema. The desk's local CSV omits contacts, internal notes and account UUIDs, and all counts are labelled **potential books offered**, not verified donations. No database records were created during setup. On 13 October 2026, the founder successfully saved one TEST offer (15 books, Mzuzu), and Supabase verification confirmed it. This is not a physical donation.

Do not lift test-only schema restrictions, send messages, claim completed physical distributions or activate finances before a separate founder-approved launch and safeguarding process.

## Proposed physical collection and handover workflow (TEST, 13 October 2026)

The librarian-only [Physical Book Collection Desk](assets/collection-desk.html) now includes a compact collection/handover guide and a **Prepare TEST collection plan** action per offer. It draws on the already-recorded offered count and general area, allows editing in the browser and downloads a local `.txt` planning draft with prominent, non-editable TEST markings. It never schedules pickups, contacts donors, issues receipts or records physical books as collected/distributed.

The complete procedures are in [Physical Book Collection & Handover Playbook](PHYSICAL_BOOK_COLLECTION_PLAYBOOK_DRAFT.md). The donor site still requests **only two details** and shares a WhatsApp draft; a future authorised physical drive must have volunteer ownership, transport/storage, donor privacy, safe sorting and school/prison institution permissions. The protected register remains an internal test ledger with **zero real donations** and one founder-entered 15-book Mzuzu TEST offer, separately confirmed in Supabase.

For downloadable TEST CSV summaries, leading spreadsheet-formula characters in location data are escaped before export to reduce CSV formula-injection risk.

**Zero-entry demonstration:** The librarian desk also contains **Preview DEMO collection plan · 1 tap**. This uses a fixed fictional offer (15 books, Lilongwe) entirely in the browser to demonstrate the planning workflow while the Supabase register stays empty; no user needs to enter a dummy offer.

## Collection Desk saved-follow-up and mobile exports (13 October 2026)

The private [Physical Book Collection Desk](assets/collection-desk.html) now provides clearer post-save confirmation, conflict detection when another browser tab edits a record, and inline feedback if an offer changes out of the selected filter. Both the TEST CSV summary and an existing TEST offer's editable local collection plan use the familiar ReadMalawi download panel with filename, preview, new-tab opening and repeat download. All these actions remain *test-only*; exporting a document does not send any WhatsApp messages, create pickups, or certify any donations.

The founder's separate **15-book Mzuzu TEST record** remains available. No further dummy offers are required. A real authenticated browser follow-up save and the Android file-opening behaviour are still not independently verified.

## Collection operations readiness checks (13 October 2026)

A compact, private [Operations Readiness](assets/collection-desk.html) section appears after librarian login inside the Collection Desk. It uses a recipient selector (future school, prison or both) and checkboxes for accountability, volunteer arrangements, transport/storage, privacy/safeguarding, book receipt and sorting, budget/liability and institutional consent. A one-tap browser-only TEST report lists gaps and opens the established mobile download/preview panel.

**No approval is possible in the checklist.** The report is always unapproved regardless of how many boxes a librarian checks. No actual transport, pickups, volunteer assignments, donor contact, institutional permissions, customer payments or book handovers are triggered, scheduled, stored or verified by this tool. The existing collection TEST offer and two-field public donor WhatsApp experience are unaffected. The independent [Physical Book Collection Playbook](PHYSICAL_BOOK_COLLECTION_PLAYBOOK_DRAFT.md) still governs proposed future operating practices.

## Volunteer coordination and institution permission discussions (13 October 2026)

The librarian-only [Collection Desk](assets/collection-desk.html) now has a one-tap **Prepare TEST coordination & permission pack**. It reuses the existing school/prison recipient selection from the Readiness checklist; there are no new lengthy forms. The browser-generated, editable local document describes proposed volunteers/roles, routes/transport, storage and physical receipt safeguards, plus clearly marked **unsent** school and/or prison-authority discussion templates.

No real coordinator is assigned, no route or cost is verified, no letters are dispatched, no permissions have been obtained and no collection/delivery is authorised. All file exports preserve mandatory **PRELAUNCH TEST / DO NOT SEND** warnings. The saved 15-book Mzuzu TEST offer and the public WhatsApp donor flow are unchanged.

## Lower-friction librarian WhatsApp intake (13 October 2026)

The private [Physical Book Collection Desk](assets/collection-desk.html) offers an optional **Paste WhatsApp offer** helper. A librarian can paste the donor's short book-offer message, then tap **Extract book count & area** to fill the existing two-field TEST offer form. The parser recognises ReadMalawi's own website-generated WhatsApp message. It runs locally, clears the original chat text immediately and rejects unclear quantities or detailed addresses. No sender identity, phone number, full transcript or donor private details are saved in ReadMalawi's database.

The user still must verify the extracted count/area and press **Save TEST offer**; a likely duplicate prompts for explicit confirmation. This does not read WhatsApp messages automatically or contact anyone, and does not change the public two-input donation page. Testing mode, zero verified physical donations and the existing 15-book Mzuzu TEST entry are preserved.
