# ReadMalawi Community Library — activation guide

## Current state (October 2026)
- Website `library.html` and `library.js` contain categories, search, e-book and audiobook discovery, member forms and a private in-site reader.
- Project Gutenberg (via Gutendex) and LibriVox results are **linked** to original providers. They are never copied automatically onto ReadMalawi.
- Supabase authentication and private book submissions are now connected. Email verification and one private PDF upload have been confirmed. Other member uploads, review transitions and requests require further real-user acceptance tests.
- User-approved membership prices have replaced the older MK500 draft. **All memberships, download entitlements and payments remain disabled. No money is collected on ReadMalawi.**
- ReadMalawi is not currently a registered NGO.

## Required backend: Supabase (separate project from IBROWS)
1. ReadMalawi has a **separate** Supabase project and email sign-in. Set a budget/spend alert before scaling the storage.
2. Database migrations have already been applied via the Supabase connector; do **not** rerun the baseline `supabase/schema.sql` in the live project. For a fresh project use the canonical schema and then later migrations. Do not use older `readmalawi_schema.sql` references.
3. Sign into the Supabase project's Auth system using the email that will serve as your administrator. In SQL Editor, add **your own account** as administrator:
```sql
insert into public.readmalawi_admins(user_id)
select id from auth.users where email = 'YOUR-ADMIN-EMAIL'
on conflict (user_id) do nothing;
```
4. Set the actual Render URL `https://readmalawi-library.onrender.com/` as the authentication Site URL and `https://readmalawi-library.onrender.com/**` as an allowed redirect. Keep email provider limits and anti-abuse rules in place.
5. Put your project's **public project URL** and **publishable/anon key** into `readmalawi-config.js`. NEVER add the service-role key, database password, or payment webhook keys to GitHub.
6. Test signed-in submission using a book or audio recording you **created yourself**. The metadata enters `public.library_books` with `status=pending` and the file enters the PRIVATE `readmalawi-library` bucket.
7. Verify identity, rights and file safety before approval; in the Supabase SQL Editor or Table Editor set `verified_rights=true, status='approved', reviewed_at=now(), reviewer_id=<admin-user-id>`. Only the approved record should become publicly searchable.
8. Test with an independent signed-out browser session that pending books and files cannot be read, while approved files can be opened.
9. Test book requests and private helper offers. Keep members' private contact details off the public request board.

## Submissions and publication
- **Any signed-in member may SUBMIT** a PDF/EPUB e-book or MP3/M4A audiobook, including a work with unknown rights, for PRIVATE review. This is not blanket permission to redistribute.
- ALL **Malawian** works require a moderator's explicit approval before public access.
- New international contributors are also reviewed initially. The admin may whitelist *verified trusted publishers* in `public.readmalawi_trusted_publishers` for automatic approval of eligible non-Malawian works with supported rights evidence. Do not give this role to ordinary users.
- Site “online only” removes the download button and opens an embedded PDF/EPUB reader or audio player. It is NOT a DRM guarantee: web-capable devices can capture or copy media.
- Audiobook narration/recording may have different rights from the underlying text. Obtain both rights where necessary.
- Do not describe copyrighted PDFs circulating on WhatsApp as public domain merely because members possess copies.

## Required moderation and security before public launch
- Anti-spam controls, upload frequency limits, copyright reporting/takedown contact, evidence logs, file-type signature validation, malware scanning and storage quotas.
- Moderator should view potentially malicious PDFs **safely**, never download/open untrusted files on personal devices.
- Restrict admin privileges. Periodically remove orphaned storage objects if metadata insertion fails.
- Accessibility/mobile testing, local-language review by fluent people, data privacy policy and retention/deletion requests.
- Never use a public storage bucket for hosted works. Supabase private storage access is enforced with RLS; signed URLs must be short-lived.

## MK500 download rule — not active
- The proposal is **five free ReadMalawi-hosted permitted downloads**, followed by **MK500** for further access. The allowance reset period, pass entitlement and exceptions still need your approval.
- This **must be enforced server-side** after authentication with verified provider webhooks, secure entitlement records and audited download grants. A browser counter is trivial to bypass.
- Currently hosted material is preview-only; no functioning paid download action is connected.
- Original external book/audiobook links are never charged or counted.
- Confirm the right to charge for each work; avoid charging for material that is non-commercial licensed or requires continued free redistribution.

## Donations — not active
- Proposed voluntary support starts at **MK100**, subject to the payment provider's minimum transfer and fee rules.
- Because ReadMalawi is not registered as an NGO, get advice about appropriate registration or partnership with a compliant fiscal host before publicly collecting charitable donations.
- The eventual donations page must disclose the legal recipient, programme purpose, fees where relevant, privacy, payment receipts, reconciliation and financial reporting.

## Relevant documentation
- Supabase Storage RLS: https://supabase.com/docs/guides/storage/security/access-control
- Private buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Malawi Copyright Act: https://malawilii.org/akn/mw/act/2016/26/eng%402017-12-31
- Automatic open metadata: https://gutendex.com/


## Easy donation flow (2026-10-09)
- Members sign in by email once, select one or multiple files, and tap **Donate books**. No title/author/language/category/origin/rights form or checkbox is required.
- Current supported files are PDF, EPUB, MP3 and M4A, each up to 50 MB (Supabase bucket technical limit). Do not imply unlimited uploads or unlimited free storage.
- New uploads automatically receive a filename-based title draft, author **Unknown**, category **Other**, language **Unconfirmed**, origin **Unspecified**, rights **unknown**, access **online_only** and **pending** review. Metadata extraction/AI enrichment is not yet guaranteed.
- Files are stored in a private bucket; moderator-only edits and publishing take place via [Review Desk](https://readmalawi-library.onrender.com/assets/moderate.html), with RLS enforced in the database. Members cannot publish by changing website JavaScript.
- Moderators privately preview, correct metadata and inspect permission. Publication requires an explicit permission basis and verified-rights flag. Malawian works require moderator approval; uncertain origin must also be reviewed.
- Admin review/edit screens should not become a copyright-clearance shortcut; reject or keep private works without redistribution rights.
- A children’s reading link has been added. A guardian should complete account sign-in and submissions for younger readers.
- Current pilot has no live paid downloads or donation payments. Online-only reader controls are not DRM.


## October 9: Compact catalogue, languages, membership specifications
- Books appear as **small icon-led catalogue tiles**, with title, author, language/category, and a Read free/Listen free link for approved local titles. External catalogue links lead to their original provider; embedded reading is not guaranteed for third-party sources.
- `library.html` allows visitors to **type any language** to filter listings, with Malawian languages suggested first. The homepage's learning language dropdown includes Malawian languages first plus a free-text Other option. This is not an automatic translator and not a claim that books exist in every language.
- Preserve the exact user-requested slogan **Tiyeni tiwelenge**. (Any later linguistic standardisation requires founder approval.)
- Reader policy: approved hosted books remain **free to read online**; an eventual secure download service offers **five lifetime e-book downloads at no cost**, then the following proposed passes:
  - MWK 1,500 per month for 10 additional eligible e-book downloads.
  - MWK 3,000 per month for 20 eligible e-book downloads.
  - MWK 5,000 per month for 5 eligible audiobook downloads.
  - MWK 50,000 per year for unlimited eligible e-book downloads.
  - MWK 75,000 per year for unlimited eligible e-book and audiobook downloads.
- `public.readmalawi_membership_plans` stores these amounts with `enabled=false`; `public.readmalawi_reader_subscriptions` and `public.readmalawi_download_ledger` are RLS-protected, **read-only to readers**, and cannot self-activate passes. A secure server endpoint, verified payment callback/ledger, atomic allowance checks, currency/account reconciliation, and a paid download UI remain to be implemented and audited.
- Planned payment destinations (provided by founder): Airtel Money `0999242594`, TNM Mpamba `0882242594`, FCB `0041502003599`. Website prominently says **do not send funds yet**. Confirm legal merchant/payment eligibility and official account holder details before enabling checkout. Never treat screenshots, pasted payment references, or contributor claims as verified payment.
- Intended use of future subscription income: source physical books for schools and prisons, **subject to recipient permission and partners**. This is a proposed initiative, not an accomplished book distribution or registered charitable operation. Keep reporting evidence-based.
- Online-only special works have no site download button, but no browser-based reader provides perfect copying prevention; download allowance is only enforceable within a controlled access workflow, subject to licensing and terms.


## International partnership enquiries (October 2026)
- Public page: `assets/partners.html` (included with existing static assets during the Render deploy). It explains in-kind book donations, corporate sponsorships, and *exploratory* impact-investment discussions. It makes no claim of registered NGO or charity status, tax-deductibility, financial returns or equity offers.
- A visitor can submit name, email, optional organisation/country, partnership interest, a short message, and explicit contact consent without creating an account. No payment, pledge or contract is created.
- Supabase table `public.readmalawi_partnership_enquiries` has RLS enabled. Anonymous visitors can INSERT only the enquiry fields, not SELECT or UPDATE them. Librarians can review and update the status through `assets/partner-inbox.html` after normal email login. The inbox is linked from the private Book Review Desk.
- Database trigger limits repeated enquiries from the same email (up to three per hour); a client-side honeypot reduces casual spam. This is not strong CAPTCHA or a promise of total spam prevention. Monitor before advertising internationally.
- **No automatic notification emails** are configured. The administrator must inspect the private inbox and respond through their preferred email provider. Do not display donor emails publicly.
- **No money collection enabled.** International card/USD collection via PayChangu is a possible *future* integration, subject to provider onboarding and legal eligibility. Keep the existing book subscription collection disabled until verified payment handling and lawful distribution arrangements exist.
- For genuine donation grants, incorporation/NGO compliance and partner requirements must be checked. Equity investment requires a legally appropriate entity; ReadMalawi currently has no issued shares or investment securities. Avoid opening an investor payment route until relevant legal reviews are completed.
- Only report books purchased or delivered to schools/prisons when supported by signed permissions and actual records.

## Community Book Club (October 2026)
- Public: Each supported book row in `library.html` includes `💬 Discuss this book` linking to `assets/book-discussions.html` for that particular book. Existing read/source links remain separate and work on phones.
- Stable book identifiers: `member:<approved Supabase UUID>`, `gutenberg:<numeric work ID>`, `librivox:<numeric work ID>`. There is no auto-publication of contributed or bulk-catalogued PDFs.
- Visitors can read approved comments without sign-in. Contributors must use their existing Supabase email OTP sign-in; younger readers should have a parent/guardian or teacher handle sign-in and posting. No public profiles, real names, member emails, DMs, or direct file uploads in discussions.
- All new posts and replies go to `readmalawi_book_comments` with `pending` status. The reviewer may approve or reject in `assets/book-discussion-review.html` (linked from the private book moderator dashboard). Hidden and rejected posts are retained privately for audit; there is no delete control.
- Replies are one level deep and must reference a previously approved parent comment for the same book. Posts have max 1,200 characters, minimum 10, basic email/link filtering, a server-side 30-second cooldown and max five contributions per 15 minutes per authenticated account.
- Readers can report published content after login. `readmalawi_book_comment_reports` permits only the authorised moderator to view/resolve flags, and one report per reader/comment. A report does NOT automatically take down the post; librarian may choose to hide the comment.
- PostgreSQL RLS blocks unauthenticated posting, author self-approval, external access to user IDs, and viewing unapproved comments from other users. Admin privileges are checked against `readmalawi_private.is_readmalawi_admin()`.
- Comment timestamps reflect the user's browser timezone. No push/email notifications or real-time live chat; readers refresh the page for new approved messages.
- **Testing:** Verify visitor can read without logging in, submit a comment from a normal member login, see it held for moderation, approve it from librarian account, and report it from another account. These interactive end-to-end steps require actual browser sessions and have not yet been completed by the assistant.


## October 10 update: self-contained ReadMalawi library policy (supersedes earlier external-source references above)
- The public website must **not direct a reader to external book catalogues or ChatGPT**. It only links to ReadMalawi pages. References to Gutenberg, LibriVox, Gutendex, and third-party source buttons in historical setup sections above are obsolete.
- The public shelf is made up of original ReadMalawi content and **approved, rights-cleared books hosted in the private ReadMalawi storage bucket**. The original short practice story "The Book on the Bench" is a visible in-site reading example, with its own moderated discussion. An unapproved uploaded PDF remains private and is not automatically visible.
- The 2,000-plus files processed by the local Bulk PDF Catalogue Builder remain on the founder's PC. The builder exports **metadata CSV only**; it does NOT upload the books, publish files or infer permissions. A future controlled bulk-import stage must link metadata to actual uploaded files and obtain publication rights before approval. Do not claim the collection is online until actual uploads have succeeded.
- Partner organisations may be linked externally **only when a real partnership has been agreed and the founder approves the link**. Currently there are no public outbound partner links. The 2019 Nation/DD Phiri article is still cited on the biography in text, without opening an external website under the current no-outbound-links policy.
- `assets/reading-buddy.html` is ReadMalawi's first self-contained website **guided** chatbot; no outside website opens and chat content is not sent to an LLM. It only helps navigate ReadMalawi. An advanced generative AI service requires a separately configured server-side model key, moderation and funding before activation; do not imply the guided chatbot is a full AI model.
- Do not expose LLM API keys in public JavaScript or reuse IBROWS's private integrations by default. Ensure any future AI integration uses a secure backend and is age-appropriate, with rate limits and safe handling of conversations.


## ReadMalawi Reading Buddy — AI rollout (October 2026)

- Public standalone chatbot: `assets/reading-buddy.html`. Homepage and library have a floating `Ask Buddy` panel; all reader-facing navigation stays on ReadMalawi.
- **Available now without credentials:** Guided, simple multilingual book-finding help with basic ReadMalawi knowledge. Approved hosted book title metadata is fetched via the public Supabase API, and book suggestions link to ReadMalawi's own shelf. Guided conversation content is not uploaded or persisted.
- **AI backend prepared but not yet activated:** Supabase Edge Function `readmalawi-reading-ai` (deployed). The function has a GET status that controls whether the `Ask AI` option appears. No secret API key is stored in GitHub, ReadMalawi-config.js, or other client code.
- **One required private configuration:** ReadMalawi administrator must add Supabase Edge Function Secret `READMALAWI_AI_KEY` via their Supabase dashboard using an active OpenAI API key. A ChatGPT Plus subscription does NOT supply API usage. Optionally add `READMALAWI_AI_MODEL` to choose a compatible Chat Completions model; if unspecified, the server defaults to `gpt-4o-mini`. Confirm API budget/billing before activation. Never paste a key into website code, the repo, or this chat.
- Reader flow when activated: ordinary guided mode remains free and requires no sign-in. To ask open-ended AI questions, an adult or guardian signs in using ReadMalawi's existing Supabase email OTP. A short user question and up to six short recent turns go to the secure function and then to the AI model provider behind the scenes. The reader stays on ReadMalawi. The site does not claim the model itself runs locally or that private text is never transmitted.
- Usage guards: validated signed-in JWT per AI request, private per-user count of **10 AI questions per UTC day**, **100 AI requests site-wide per UTC day**, and an 8-second per-user cooldown. The browser cannot reset quotas by editing JavaScript. No model/provider key is exposed; the backend uses a fixed trusted model-provider API endpoint.
- Privacy and safety: No chat transcripts are written to ReadMalawi's own database. Supabase stores reader ID, UTC date and usage counts only; the model provider receives text submitted for AI processing, subject to its own handling policies. Do not ask for or share children's personal information. Responses may be mistaken; especially Malawian-language text should be checked by fluent people. No unsolicited offsite links are returned.
- The AI does **not** ingest or claim to know the entire PDF catalogue. It uses only metadata of approved hosted books plus a short original ReadMalawi story, and readers may share short lawful passages. Full-text book search, retrieval and content-rights enforcement remain future work. The local PC bulk PDF CSV importer has not been touched.
- Explicit approved outbound exception: the founder's biography links to the original June 2019 `The Nation`/DD Phiri article archive. No outside book-catalogue or ChatGPT destination has been reinstated.
- **Testing before declaring generative AI live:** Add the secret, verify GET reports `ai_enabled:true`, sign in from the hosted page, submit a short book question, check daily limits, verify function logs, and review abuse/billing. Without a key the advanced AI remains visibly inactive, not falsely described as working.

## Book Club moderation: ten original stories (11 October 2026)

- The website and Supabase discussion trigger now accept all ten original ReadMalawi story IDs (bench, seedjar, rainclub, cleanstream, librarybag, marketpuzzle, rainnotebook, wordbasket, secretcode, missingpencil), alongside **already approved, rights-verified** member books.
- Production Supabase migration `20261011124059_enable_book_club_discussions_for_ten_original_stories` was **applied and verified** on 11 October 2026. Its reference SQL is in `supabase/migrations/20261011124059_enable_book_club_discussions_for_ten_original_stories.sql`. **Do not manually rerun this migration on the live project.**
- Fourteen read-only acceptance cases passed, including the ten approved original IDs and rejection of unknown IDs. The existing sign-in, pending review, per-book reply, link-spam, and rate-limit checks remain in the trigger.
- **End-to-end testing remains required:** signed-in reader posts a real comment and confirms `sent for review`; librarian verifies `pending` then approves it; a signed-out reader must see only the approved comment. Do not claim this posting/approval flow has passed until actually tested.


## Private Chichewa Translation Review Desk (11 October 2026)
- The librarian-only review page is `assets/translation-review.html`, available from `assets/moderate.html` after signing into a ReadMalawi administrator account.
- The private Supabase table `public.readmalawi_translation_reviews` tracks the ten original stories. It began with **10 needing review, 0 approved**.
- Database policies only allow authenticated ReadMalawi admins to read/update review records; the public/anonymous role receives no permissions. A database CHECK constraint prevents recording `approved` without a named reviewer, semantic check, language check, question check, corrected Word copy received, and review date.
- English story pages stay available; **Chichewa draft text is NOT hosted or published by this page**. Drafts are kept in two editable Word review packs delivered privately to the founder, not in GitHub static website assets.
- Site approval is a private sign-off record, **not publication**. Publishing any Chichewa text requires a separate editorial action after reviewing the final corrected Word copy.
- The migration was already applied on production and is recorded for audit at `supabase/migrations/20261011154000_private_chichewa_translation_reviews.sql`. **Do not reapply it manually.**

## Private bulk PDF intake (pilot)

- Page: `assets/bulk-import.html`. Choose a batch of PDF files or a desktop folder. Scanning the PDF contents into a downloadable catalogue is **local and optional**; that alone does not transmit a PDF to the server.
- The separate opt-in **Private bulk upload** step is restricted in the interface to an authenticated ReadMalawi librarian, with permission confirmation and a preview of the file count and size. Neither metadata nor PDFs are submitted until the librarian explicitly clicks the upload button and accepts its confirmation.
- Each click processes **up to 25 selected PDFs or 250 MiB**, sequentially, with progress, pause-after-current-file, and a CSV outcomes report. Repeat the action to process subsequent chunks. Keep the page open during uploads.
- Every new PDF is hashed locally with SHA-256 and stored under the uploading reader's existing private storage folder: `<uid>/bulk/v1/<sha256>.pdf`. Re-selecting the same folder can find an earlier bulk submission by deterministic path and skip it; an interrupted storage-only submission can have its missing metadata recovered. This does not deduplicate files previously uploaded by the older random-path single-file uploader.
- Metadata is filled from the optional local PDF catalogue draft, otherwise the filename. The database record uses `origin='Unspecified'`, `rights_basis='unknown'`, `attested_rights=false`, `access_mode='online_only'`. The existing database trigger forces private `pending` status and unverified rights. Nothing is automatically published or enabled for paid downloads.
- File types for **bulk upload** are PDFs only, max 50 MiB each. The ordinary member-upload form independently supports EPUB and audio. Do not send confidential or unlawful material; receipt of a file does not authorise public distribution.
- The existing Supabase private bucket, row ownership policies and librarian-only review permissions remain unchanged. This change is website-only and does not require a new database migration.
- Required acceptance tests before inviting outside donors: sign in as a librarian; select 3 small original or explicitly authorised PDFs; optionally scan; upload privately; verify 3 pending records and non-public storage; repeat the same selection to confirm duplicate skipping; pause/resume; download report; try a non-admin account to verify bulk interface denial; review content and rights before approving any real books.
- No browser upload can continue after closing its tab. Supabase storage limits and the user's subscription plan may require a future server-side queue or infrastructure upgrade for thousands of documents. Do not assume that a 2,000-file migration has been run or is ready for full production until the pilot passes.

## Bulk librarian approval and public publication (12 October 2026)

- Admin page: `assets/moderate.html`, new **Bulk Approve & Publish** panel; implementation `assets/bulk-review.js`.
- Only signed-in ReadMalawi administrators can view and use the batch controls. The selection lists a maximum of 50 pending submissions per page, and supports select-all eligible or individually selected titles. Test PDFs, `Profile`, and obvious vacancies/company/government notices cannot be published in bulk; the ordinary individual workflow is unchanged.
- A shared **verified permission basis** applies to every book selected in the batch. A specific evidence reference (20–500 characters) and a checkbox confirming that **every work** was reviewed are required. A further confirmation requires typing `PUBLISH N` with the exact count. These checks are an administrative attestation, not automated copyright validation.
- The private Supabase RPC `public.readmalawi_publish_book_batch` atomically validates the signed-in administrator, all IDs, the current pending status, storage-file existence, and exclusion patterns. It limits publication to 50 at a time; any invalid item rejects the entire batch. Each successful publication records the reviewer, rights basis, and evidence in `readmalawi_private.book_bulk_publication_log`, which has no general public read access.
- **Contributor attestation is NOT overwritten** by librarian approval. The librarian's rights decision is recorded in `verified_rights`, `reviewer_id`, `reviewed_at` and the private bulk audit, leaving `attested_rights` as supplied by the uploader.
- All batch-published titles use `online_only` access; physical or electronic redistribution outside this access still requires separate permissions. Readers gain public access immediately after successful approval, including to the private stored book via approved-file reader access, so do not test publishing with unverified works.
- Applied migrations: `20261012_librarian_bulk_publish_with_audit.sql`, followed by `20261012_preserve_uploader_attestation_in_bulk_publish.sql`. Do not manually reapply these migrations on production.
- Verification: signed-out role cannot call publication RPC, a non-admin authenticated session is denied, and empty selections are rejected; the existing 7 approved / 19 pending / 3 rejected counts were unchanged by the migration. **A real positive publication action remains untested** until the librarian supplies rights-cleared material and explicitly confirms publication.

## ReadMalawi literacy and AI education business model (12 October 2026)

This section supersedes older public download-paywall marketing plans (earlier membership records are retained for historical reference **disabled**, not deleted or activated).

**Positioning:** free ReadMalawi original stories, vetted/approved hosted works, book discussions and original-source links are the discovery layer. Longer-term income is intended to come from lawful commissioned education workshops, responsible AI-literacy training, school pilots, sponsorships, publisher/author services and only later genuinely optional premium study capabilities. No prices have been agreed for these services, and no payment collection is enabled.

**Website routes:**
- `assets/learning-services.html`: Learning & AI Lab; immediately usable Smart Study Sprint, transparent Guided Reading Buddy vs separately configured AI Reading Coach, future translation with fluent human review, and organisational service categories. The study sprint is a **local, rule-based browser tool**, not a generative AI; its source text is not sent to ReadMalawi servers or stored in Supabase. Inputs limited to 3,000 characters and should be personally owned or permitted.
- `index.html`: links to AI & Learning Lab and explains the real status of features.
- `library.html#support`: now explains current free reading, responsible AI education and service enquiry paths. Previously displayed MK1,500/MK3,000/MK5,000/MK50,000/MK75,000 future book passes and bank/payment destinations were withdrawn from **public marketing**. The `public.readmalawi_membership_plans` database entries remain `enabled=false`, and no checkout is activated.
- `assets/partners.html`: service leads use existing private partner enquiries, with added interests `education_services`, `ai_services`, `author_services`, alongside existing donation and sponsorship categories. The new values were added through an applied database migration `readmalawi_add_educational_and_ai_service_enquiry_tracks_20261012`.
- `assets/partners.js`: only accepts predefined select options from the optional `?interest=` deep-link parameter. No prefilled payment details or implied booking.
- Admin `assets/partner-inbox.html` continues to display and update all enquiry types. No email sending, marketing automation or payments are enabled.

**AI boundaries:** Existing `readmalawi-reading-ai` Supabase Edge Function remains separately gated by private `READMALAWI_AI_KEY`, use limits and guardian sign-in; do not make a public promise it is live until status and actual safe completion tests pass. ChatGPT subscriptions are not API credits. Any AI features involving children, copyrighted texts, educational decisions, or Malawian-language translations need privacy limits, permission checks, teacher/human review and a budget. Never accept full third-party copyrighted ebooks into the public AI model context merely because they were downloaded freely.

**Pilot service workflow:** receive an enquiry -> qualify school/organisation and its learning goals -> confirm content rights, consent, safeguards and age appropriateness -> provide a custom proposal with fee & responsibilities -> contract / verify payment via a future compliant workflow -> deliver -> report only measured outcomes. Do not imply that school or prison book distribution has taken place. ReadMalawi is not yet a registered NGO/charity. Choose an appropriate legal/commercial structure and payment provider before launch of paid services.

**Website launch checks:** Render build must copy `assets/` and `library.html` (it does). Check mobile header, all service deep links, guided Reading Buddy, Smart Study Sprint 80-char threshold, local .txt export, partner interest dropdown and private inbox. If the AI backend is not configured, its paid model is **not** advertised as active.

