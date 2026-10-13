# ReadMalawi — Founder-only Approval Architecture (prelaunch design)

**Status:** SECURITY DESIGN ONLY. **No real approval capability is enabled.**
**Prepared:** 13 October 2026, based on database RLS and existing librarian workflow.
**Operating rule:** Everything is a TEST until the founder explicitly approves the final release.

## Why the existing test button is not real founder approval

The proposal builder's `Mark TEST draft ready for founder review` is a **browser-only display state**. The exported founder review packet says **NOT APPROVED**. A person clicking a button in an editable browser page is not reliable authentication, cannot sign or approve a contract, and must never trigger payment, emailing or client delivery.

There is currently **one entry in `readmalawi_admins`**, but that does **not** prove that the account is personally controlled by the founder. No verified founder identity has been assigned. Never automatically equate the sole librarian with the founder.

## Proposed safe approval process

1. **Founder account identification and explicit confirmation.** Founder signs in through existing Supabase Auth. Verify and confirm the authenticated `auth.uid()` using an authorised account-validation ceremony. This requires explicit confirmation and may require a second verification factor. Never accept an editable nickname, email text box, browser flag or client supplied role.
2. **Private founder role mapping.** Store the verified UID in a restricted database table (or secure, admin-controlled `auth.users.raw_app_meta_data`), with no anonymous or ordinary authenticated UPDATE privileges. Do not build a self-assignable endpoint.
3. **Internal proposal snapshot.** After scope, safeguarding, licensing, independent supplier-cost validation and human privacy checks, an authorised librarian may submit an immutable versioned *internal* review snapshot, with version digest, creator, date, reference and cost-source confirmation. Keep PII/financial information encrypted or in private RLS tables; do not put it in public `library_books` or downloadable anonymous storage.
4. **Read access and least privilege.** Only authorised librarian and verified founder roles may read internal review metadata. Founder-only decisions must be enforced by PostgreSQL RLS and/or a specifically audited server-side transaction. Every UPDATE requires matching `USING` and `WITH CHECK` predicates. Client-side checks are UX only.
5. **State machine.** Allow `draft -> submitted_for_founder_review -> requires_revision` or `approved_internal_test` **ONLY** for testing. After launch approval, consider separate `approved_internal` and `released_to_client` transitions; a founder approval is not equivalent to sending or signing an external contract.
6. **Approval audit.** Record founder UID, snapshot digest/version, action, time, rationale, and a confidential append-only decision trail. A stale snapshot cannot retain approval after scope or budget changes; new revisions require fresh review.
7. **Release gate.** Before final launch, there must be *no endpoint or state transition* that emails, quotes, books, publishes books, sends invoices or collects payments, regardless of UI checkbox state or founder role.
8. **Launch controls.** Founder explicitly authorises a named release/commit, operational policies, privacy/safeguarding evidence and a release date. Only then create a separately reviewed backend release process; keep unlicensed PDFs and donor funds blocked.

## Database security invariants for implementation

- All new client-accessible tables in `public` must have **RLS enabled** before granting any access. Keep sensitive approval and PII content in a dedicated protected schema/table.
- Do not create generic, broadly executable SECURITY DEFINER functions in the exposed `public` schema.
- No browser secret/service-role key. Use the public Supabase publishable key with signed-in RLS permissions.
- `auth.uid()` binding and server-side verified founder membership must be **independently checked** on every decision.
- Founder role must not be assignable through editable JWT `user_metadata`, email in a request, or a frontend setting.
- Changing material proposal content, costing or rights evidence must invalidate a previous review.
- Test role restrictions using real different Supabase Auth sessions (founder, librarian, signed-in nonstaff, anonymous) *after* identity binding. SQL ACL/RLS checks alone are not full end-to-end proof.
- Book title requests and free reading remain separate from the paid education/AI services; never charge for another rights holder's free publications.

## Implemented now

- [x] Authenticated librarian enquiry read/update constrained by RLS and column-limited database grants.
- [x] Public book-request listing hides `requested_by` and `notes` at the database grant level.
- [x] Rule-based, editable internal scope, MWK cost and proposal tools.
- [x] Local TEST review packet that remains `NOT APPROVED`.
- [x] Database trigger blocks pending member-book publication during testing.
- [x] Automatic Render deployments from GitHub.
- [ ] Verify who holds the founder's authenticated Supabase account. **Not assigned.**
- [ ] Create private founder-role binding, proposal-version review ledger, RLS and tested audit trail. **Not created.**
- [ ] Enable real or automatic customer-facing document approval and delivery. **Not approved, not built.**

**Next approval-dependent step:** At a later stage, request the founder's explicit agreement about which already authenticated Supabase account should receive founder privileges, without sharing passwords or private access tokens. Until then, all approval operations must remain disabled.
