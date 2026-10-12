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
- Pricing is **not published or fixed**, and memberships, donations, premium AI access and checkout remain disabled. Commercial programmes require scope confirmation, an appropriate legal arrangement, any necessary participant safeguards, a written proposal and verified payment arrangements before delivery.
- Acceptance testing is still required in a real reader/admin browser session: check the Render deployment of the newest GitHub commit, submit one explicitly authorised test enquiry, verify it is visible only to a logged-in librarian, update its follow-up status, then confirm it is not public.

## Current release status — TESTING ONLY

The Render static site is a **publicly accessible development preview**, not an official commercial launch. `readmalawi-config.js` sets `sitePhase: "testing"`; the public reading/learning pages show a test notice and the programme and partner forms record `[READMALAWI TEST]` enquiries. Existing BUA Construction trial is recorded as a test. Customer notifications, bookings, payments and donations remain disabled. **Only the founder may authorise a final production launch.** See [PRELAUNCH_CHECKLIST.md](PRELAUNCH_CHECKLIST.md) for the acceptance tests and release gate.
