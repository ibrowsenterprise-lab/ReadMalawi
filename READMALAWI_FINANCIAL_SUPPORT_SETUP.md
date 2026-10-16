# ReadMalawi financial support — temporary transfers; hosted checkout not launched

Founder decision: PayChangu; minimum contribution MWK700, replacing all earlier minimum proposals.

The support page at assets/support-readmalawi.html may be published as an explicitly inactive information page. Do not enable checkout until the payment link is verified. No secrets, donor information or payment credentials belong in this repository.

## Current blocker

On 15 October 2026 the founder reported completing VerisecID successfully. PayChangu account approval has not been independently confirmed. The latest login attempt displayed HTTP 522 on POST auth/login, after CAPTCHA completion. Do not treat this as an incorrect password or repeat identity verification solely because of this error.

## Activate only after completing these steps

1. Verify the actual PayChangu account holder and account approval. The dashboard business label was ibrows; confirm how the ReadMalawi campaign and legal recipient appear to contributors.
2. Create a donation link with title Support ReadMalawi, currency MWK, and a minimum of 700. Enforce the minimum in PayChangu itself; the website's text is not enforcement.
3. Suggested description: Support ReadMalawi’s free digital reading community. Contributions help with hosting, library maintenance, accessibility and human-reviewed local-language learning materials. ReadMalawi is an independent initiative and is not registered as an NGO or charity.
4. Confirm fee allocation, taxes, withdrawal charges, refunds, and settlement options with PayChangu. Its published sources differ on free automatic payouts versus MK700 withdrawal charges. Do not select automatic withdrawals or promise net amounts until clarified.
5. Inspect the hosted link as a visitor. Confirm the recipient, minimum, currency, purpose and fee presentation. Check an amount below 700 is rejected. Do not pay without a user-authorised payment method and amount.
6. With the founder's direct participation, complete one MK700 payment and verify the successful transaction in PayChangu; do not accept a screenshot or return-page URL as proof. Record gross amount, collection fee and net balance.
7. Set financialSupport.donationUrl to the verified public hosted URL, recipientName to the actual verified recipient, verified to true and donationsEnabled to true. This enables only the hosted donation link; general paymentsEnabled stays false.
8. Remove the support page's noindex only once checkout is ready. Check phone and desktop layouts and all links.

## Contribution record plan

Keep a dedicated ReadMalawi register containing: internal entry ID, PayChangu transaction reference, date/time, currency, gross amount, confirmed status, payment method, collection fee, net amount, settlement/withdrawal reference and fee, any refund amount/status, and reconciliation date. Keep any required donor contact information private and access restricted. Record expenses separately with purpose, amount, date and supporting evidence. Do not create a public donor-name feed by default.

Publish only reconciled aggregate totals. Distinguish contributions received, fees, spending and remaining balance. No sample totals, invented achievements, automatic thank-you emails, recurring charges, or charitable tax receipts are included.

The hosted-link approach does not need API keys in the frontend or a custom payment backend. If automatic receipts or public totals are added later, use server-side verification, authenticated webhooks and duplicate-event protection.

## Operating controls

- Use one verified PayChangu hosted checkout for public voluntary contributions. Any institutional funding needs a written purpose, receiving entity and reference. Invoice paid services separately.
- Keep project funds and records separate from personal spending. Classify unrestricted contributions, restricted project funding, service income and founder funding separately.
- Record gross receipts and actual fees separately. A transfer from PayChangu to the bank is a transfer of funds, not new income or programme expenditure.
- Reconcile provider transactions, the ledger and bank/mobile settlement weekly. Retain expense evidence and document refunds and spending approvals. Publish only reconciled aggregate summaries.
- Confirm actual account collection and withdrawal fees before choosing payout frequency. Do not configure a withdrawal after every small contribution.
- The website's MK700 policy is not payment-provider enforcement. Confirm that MK699 is rejected and MK700 is accepted at the hosted checkout before activation.

## Founder-authorised temporary channels — 15 October 2026

Publish only TNM Mpamba 0882242594 (Jones Nalikungwi) and FCB 0041502003599 (IBROWS Enterprise), copied from the IBROWS project and selected explicitly by the founder. These are existing receiving accounts, not ReadMalawi-named accounts. Branch information was not present and must not be invented. Minimum MK700; provider transfer charges may apply.

Request only amount, date, channel and transaction reference through the existing email/WhatsApp contacts. Confirm against the actual receiving-account record; screenshots alone are not proof. Do not auto-mark payments, issue charitable tax receipts or collect banking credentials. Maintain separate records of ReadMalawi receipts and spending. General payments and hosted checkout flags remain false. No financial transaction was performed during publication.

## Optional donor recognition — 16 October 2026

- Default: no public name and no individual public amount. Confirmation of payment does not imply consent to recognition.
- After verifying receipt, ask whether the donor wants public thanks and what exact display name they choose. Ask separately whether the amount may be published. No response means no publication.
- Record consent privately with transaction reference, exact chosen name, permitted fields, consent date and source. Never put the consent register or transaction records in the public repository.
- Publish only consented fields for confirmed receipts. Do not publish payment identifiers, account details, phone numbers or invented donors. No supporter list is seeded by this change.
- Handle removal/change requests through the existing email or WhatsApp contact; remove or revise the public acknowledgement while retaining necessary reconciliation records privately.
- Keep aggregate reporting separate from recognition. Check that granular breakdowns do not inadvertently identify an anonymous donor.
