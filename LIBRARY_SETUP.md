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
