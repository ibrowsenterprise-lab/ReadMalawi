# ReadMalawi — Security and Prelaunch Approval Audit

**Date:** 13 October 2026  
**System:** `ibrowsenterprise-lab/ReadMalawi`, Supabase `ezejmipymjzfsnemgaig`, Render `readmalawi-library`  
**Audit type:** Targeted database permissions, rights-publication controls, private administrator proposal and enquiry workflow. Not a penetration test.  
**Status:** DEVELOPMENT / TESTING — **NOT** founder-authorised for production launch.

## Executive assessment

The ReadMalawi static website, private enquiry inbox, local programme costing, proposal drafting and original free-reading resources remain functional development features. This audit corrected a real missing database privilege configuration and installed a verified server-side prohibition on publishing member-supplied books before launch. It did not establish the identity, privileges or workflow of a genuine founder-only final approver.

Security is **not fully certified**. Browser-based role-denial tests, provider password configuration, supply-chain pinning and public book-request privacy remain outstanding.

## Verified baseline

- All **14 public application tables** have PostgreSQL row-level security enabled.
- The `readmalawi-library` Storage bucket remains **private** (`public=false`).
- Member books: **26 pending, 3 rejected, 0 approved/rights-verified**. No new titles have been published by this work.
- Existing private programme enquiries: **1 total, 1 marked TEST**. Original private records were preserved.
- `readmalawi-config.js`: `sitePhase: "testing"`, `paymentsEnabled: false`, `donationsEnabled: false`, `bookingsEnabled: false`, `customerNotificationsEnabled: false`. These are **client configuration flags**, not sufficient server-side access controls by themselves.

## Findings and applied fixes

### 1. Private enquiry table was missing required Data API grants — FIXED

**Finding:** The table `public.readmalawi_partnership_enquiries` had correctly restricted RLS policies but its table ACL contained only `postgres` and `service_role`. As a result, its current public submission and authenticated librarian inbox workflows could fail despite the earlier successful user screenshots.

**Repair applied:**
- `anon` and `authenticated` have **INSERT privileges only on seven form-input columns**.
- Only `authenticated` has **SELECT privileges on the explicitly listed librarian-read columns**.
- Only `authenticated` has **UPDATE on `status` and `admin_notes`**.
- There is **no anon SELECT, UPDATE or DELETE**, and no authenticated UPDATE of the original contact email.
- Existing RLS remains unchanged: only `readmalawi_private.is_readmalawi_admin()` may read/update entries; every insert must have `status='new'` and blank admin notes. Table constraints require consent, valid-length fields and service types.

**Verification:** SQL privilege checks confirmed allowed and denied cases. Database still contains the single labelled test enquiry. **A fresh live mobile submission/access-negative session has not been conducted** after this repair; do not claim full browser acceptance yet.

**Source-control record:** `supabase/migrations/20261013_restore_enquiry_least_privilege_and_pause_bulk_publication.sql`. Already applied to live test database.

### 2. High-impact member publication paths remained technically callable — FROZEN

**Finding:** The `SECURITY DEFINER` function `public.readmalawi_publish_book_batch` was executable by authenticated users and allows rights-reviewed bulk publication after strong internal librarian, title, rights and evidence checks. Supabase's security advisor flagged its exposure. Additionally, an authorised librarian could update `library_books` directly to `status='approved'` through individual moderation. Both capabilities conflict with the founder's explicit **no publication until final launch** rule.

**Repair applied:**
- Revoked `EXECUTE` on bulk-publication RPC from the `authenticated` role. Service-role access remains backend-only.
- Created trigger `readmalawi_prelaunch_member_publication_guard`, backed by a non-public invoker function, preventing new INSERT/UPDATE transitions to `approved` or `verified_rights=true`. This also blocks accidental direct librarian approval.
- Pending, rejected and private member files remain intact.
- Updated librarian Book Review Desk: **Approve & publish** and **Reject** are disabled in testing; bulk publication controls are hidden with an explicit prelaunch explanation. Private preview and draft metadata checking remain available.

**Verification:** A controlled SQL transaction attempted a pending-to-approved/verified-rights transition, confirmed it was rejected and automatically rolled back. The 26/3/0 member-status counts were unchanged. Trigger was confirmed installed. No books were published.

**Source-control record:** `supabase/migrations/20261013_prelaunch_freeze_member_publications.sql`. Already applied to live test database.

### 3. Internal proposal approval was UI-only — CLARIFIED, NOT DEPLOYED AS REAL AUTHORISATION

**Finding:** `Mark TEST draft ready for founder review` operated only in the administrator's browser; it was not a verified founder-only decision, durable approval, contract, email release or backend authorization.

**Repair applied:**
- Added `Download founder REVIEW PACKET (TEST)`, a locally generated cover sheet showing internal completeness, outstanding blockers, and verified-versus-DEMO costing.
- The packet unconditionally says `FOUNDER APPROVAL: NOT GRANTED` and `External release permission: BLOCKED`, including when the draft passes local checklist checks.
- Added mandatory noneditable prelaunch warnings to exported `.txt` and formatted `.html` even if a user edits the body.
- Local readiness flags are invalidated when editor/review requirements change, and fake DEMO cost data cannot be passed off as verified budget.
- No proposal, customer message, quotation, invoice, contract or payment is sent or stored by these tools.

**What is not yet built:** A genuine founder-only identity/role, durable approval record, signature/approval audit trail and backend customer release action. Designing those requires a **verified founder identity and separate explicit approval**; never infer approval from browser flags or editable text.

## Outstanding issues before final launch

1. **Supabase Auth leaked-password protection is OFF** (security advisor WARN). Enable in Supabase Auth password settings after reviewing account policy and platform availability: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
2. **RLS enabled with zero policies on four internal tables** (advisor INFO): `readmalawi_ai_daily_budget`, `readmalawi_ai_usage`, `readmalawi_private.book_bulk_publication_log`, `readmalawi_private.book_rights_hold_audit`. This denies normal clients by default, generally desirable for server-only tables. Verify intended backend operations before treating the info as a vulnerability.
3. **Public `book_requests` SELECT currently includes fields `requested_by` UUID and free-text `notes`.** The table has zero records now. Before enabling real community requests, redesign the public API/view or restrict columns so identifiers and sensitive notes are not unnecessarily disclosed to unrelated readers.
4. **Supabase browser SDK imports use unpinned `@2` CDN URLs** in some pages. Pin to a vetted version or use controlled/bundled dependency deployment; test mobile fallback before changing a working CDN loader.
5. **No independent negative-path browser test** yet with signed-out and non-librarian sessions, or controlled testing for write limitations. SQL RLS/policy/ACL inspection is good evidence but not a full penetration/security test.
6. **No operating privacy/data-retention schedule for real clients or child consent process** has been independently approved. Obtain human review, safeguarding and content/licensing policies before real school programmes.
7. **No payment processor, tax/legal operating provider, invoices, programme scheduling or automated client communication is authorised.**
8. **No founder-reviewed member-book rights are cleared.** The 1,793 offline reading-only PDF catalogue candidates remain candidates; do not upload/publish without individual evidence and licensed permission.

## Mandatory final-launch gates

- Founder expressly approves an identified GitHub commit, release scope and launch date.
- Review signed-in/non-librarian/anonymous access in an actual browser and verify the repaired private enquiry process.
- Clear Auth settings warning, public request-note exposure and required safeguards.
- Securely establish actual founder-only approval identity and auditable server-side release controls.
- Obtain rights evidence and review access to any member works individually before lifting the publication freeze.
- Remove the publication freeze ONLY in a separate founder-authorised, reviewed migration. Re-enable the bulk publication RPC only after a separate security and rights audit.
- Document pricing, legal authority, safeguarding, rights and any client data notices before taking real customers or payments.
- Audit prelaunch test records, archive/delete only after founder approval, and verify the latest Render live commit corresponds to the final approved release.

**Conclusion:** Critical prelaunch boundaries were strengthened. The ReadMalawi project remains a testing preview, not a certified secure production or an officially launched company/charity.
