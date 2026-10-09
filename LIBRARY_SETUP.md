# ReadMalawi Community Library — activation guide

## Current state (October 2026)
- Website `library.html` and `library.js` contain categories, search, e-book and audiobook discovery, member forms and a private in-site reader.
- Project Gutenberg (via Gutendex) and LibriVox results are **linked** to original providers. They are never copied automatically onto ReadMalawi.
- Member uploads, sign-in, requests and assistance offers are **NOT YET LIVE**. They require a private storage/database service configured and tested.
- MK500 access and MK100 donations are proposals only. **No money is collected**.
- ReadMalawi is not currently a registered NGO.

## Required backend: Supabase (separate project from IBROWS)
1. Create a **separate** Supabase project with a budget/spend alert and enable email OTP sign-in.
2. In the SQL Editor, run **only** `supabase/schema.sql`. This is the canonical schema. Do not use older `readmalawi_schema.sql` references in prior instructions.
3. Sign into the Supabase project's Auth system using the email that will serve as your administrator. In SQL Editor, add **your own account** as administrator:
```sql
insert into public.readmalawi_admins(user_id)
select id from auth.users where email = 'YOUR-ADMIN-EMAIL'
on conflict (user_id) do nothing;
```
4. Set the correct GitHub Pages URL as an allowed redirect in Supabase Auth URL Configuration. Keep email provider limits and anti-abuse rules in place.
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
