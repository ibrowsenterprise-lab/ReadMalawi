# ReadMalawi Community Library — setup and operational checklist

## Status
- Public library page and search/category/type/language filters: implemented.
- Automatic discovery: the browser fetches Project Gutenberg and LibriVox metadata and links to original providers. It DOES NOT bulk-download or rehost files.
- Member PDF/EPUB and MP3/M4A submissions: integration code written; NOT active until dedicated Supabase is configured and policies applied.
- Member requests/offers: integration ready; NOT live until backend setup.
- MK500 download payments and MK100 donations: NOT live or collected.

## Backend setup (a separate Supabase project)
1. Create a brand-new Supabase project for ReadMalawi, separate from IBROWS.
2. Use Supabase SQL Editor to run the contents of supabase/readmalawi_schema.sql with an authorised admin session.
3. Configure Authentication > Email; enable email sign-in, use the actual website URL and allow the hosted site in the redirect URL list. Consider anti-spam/rate limiting.
4. Place the project PUBLIC URL and PUBLIC publishable/anon key in readmalawi-config.js. NEVER add a service_role key, payment secret or other private credential to GitHub or browser code.
5. Test sign-in and submit only a short ORIGINAL book for which you own the rights. The database record must begin in pending status and its file remain private.
6. Review uploaded books and evidence in the secured Supabase Dashboard. After verifying ownership and permitted redistribution, an authorised admin may update readmalawi_books.status to approved in Table Editor. Keep evidence and takedown records.
7. Refresh site; only approved items should appear. Test opening a temporary link, testing both signed-out and signed-in users.
8. Test request submission and offers by signed-in members. Offers are private to helpers and administrators; do not expose personal emails publicly.

## Security controls required BEFORE open invitations
- Administrator review before publishing, evidence of rights, abuse reports and takedown route.
- File scanning, MIME+signature validation, upload rate limits and member-authentication abuse protection. The provided SQL bucket restrictions are just a baseline.
- Data minimisation and transparent retention policies. Audios can consume high storage and streaming costs.
- A published file that can be viewed can often also be saved/copied. A simple download button counter is not secure.

## Automatic catalogue imports
- Live Gutendex results are metadata links to Gutenberg titles in the US public-domain catalogue. Public domain in the US does not automatically mean public domain in Malawi.
- LibriVox feed results are links to the original audiobook pages.
- African Storybook has item-specific open licensing, including restrictions on commercial uses in some cases. Link to source initially.
- Do not automatically copy books or recordings into local storage without a recorded rights review.

## MK500 and five-download model — PLANNED ONLY
Proposed policy: 5 free eligible ReadMalawi-hosted downloads per 30-day period, then a MK500 access pass for a separately specified allowance or period. Founder has not yet selected the period or pass details.
- External source links remain free.
- Only commercially redistributable original/licensed works could participate in a paid service; check licence scope explicitly.
- A later paid backend needs verified merchant webhooks, protected download grants, signed short-lived content access, tamper-resistant entitlements and receipts.
- Never infer payment from uploaded screenshots or browser-side claims.
- GitHub Pages must not be used primarily as a commercial payments/SaaS site. Move the transactional component to appropriate infrastructure if activated.

## MK100 voluntary support — NOT ACCEPTING FUNDS
- ReadMalawi is not registered as an NGO. Confirm permitted legal status, fiscal sponsor and fundraising arrangements before soliciting real donations.
- When lawful: show fundraising entity identity, use of funds, approved payment provider, receipts, financial reconciliation, refunds/contact and impact reporting.
- Check provider minimums and fees: MK100 may be impractical for some methods.

## Copyright and confidentiality
- Members may submit their own original works, documented licensed works or confirmed public-domain works under Malawi law.
- Do not accept commercially published PDFs just because someone purchased or found them on WhatsApp.
- Respect translators, authors, narrators and performance rights. Audiobook rights can be separate from text rights.
- Do not expose member emails or payment references on public pages.

## Local run
Start a local static server from the project root, e.g. with Python module http.server port 8000, then browse to http://localhost:8000/library.html. Use browser developer tools for errors. Before Supabase setup, the request and upload buttons should be disabled.

## Links
https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features
https://supabase.com/docs/guides/storage/security/access-control
https://supabase.com/docs/guides/storage/serving/downloads
https://github.com/GabiGlazberg/gutendex
https://librivox.org/api/info
https://www.gutenberg.org/policy/license
https://africanstorybook.org/terms.html
https://ngora.mw/registration/
