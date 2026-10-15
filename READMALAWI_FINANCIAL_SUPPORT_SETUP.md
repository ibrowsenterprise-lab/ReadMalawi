# ReadMalawi financial support — prepared, not launched

Founder decision: PayChangu; minimum contribution MWK500, replacing the earlier MWK100 proposal.

This branch contains a complete support page at assets/support-readmalawi.html. It is not linked from the live website. Do not merge or publish until the payment link is ready. No secrets, donor information or payment credentials belong in this repository.

## Current blocker

On 15 October 2026 the founder reported completing VerisecID successfully. PayChangu account approval has not been independently confirmed. The latest login attempt displayed HTTP 522 on POST auth/login, after CAPTCHA completion. Do not treat this as an incorrect password or repeat identity verification solely because of this error.

## Activate only after completing these steps

1. Verify the actual PayChangu account holder and account approval. The dashboard business label was ibrows; confirm how the ReadMalawi campaign and legal recipient appear to contributors.
2. Create a donation link with title Support ReadMalawi, currency MWK, and a minimum of 500. Enforce the minimum in PayChangu itself; the website's text is not enforcement.
3. Suggested description: Support ReadMalawi’s free digital reading community. Contributions help with hosting, library maintenance, accessibility and human-reviewed local-language learning materials. ReadMalawi is an independent initiative and is not registered as an NGO or charity.
4. Confirm fee allocation, taxes, withdrawal charges, refunds, and settlement options with PayChangu. Its published sources differ on free automatic payouts versus MK700 withdrawal charges. Do not select automatic withdrawals or promise net amounts until clarified.
5. Inspect the hosted link as a visitor. Confirm the recipient, minimum, currency, purpose and fee presentation. Check an amount below 500 is rejected. Do not pay without a user-authorised payment method and amount.
6. With the founder's direct participation, complete one MK500 payment and verify the successful transaction in PayChangu; do not accept a screenshot or return-page URL as proof. Record gross amount, collection fee and net balance.
7. Set financialSupport.donationUrl to the verified public hosted URL, recipientName to the actual verified recipient, verified to true and donationsEnabled to true. This enables only the hosted donation link; general paymentsEnabled stays false.
8. Add the Support link to the homepage, library and partners page and remove the support page's noindex only once it is ready to publish. Check phone and desktop layouts and all links.

## Contribution record plan

Keep a dedicated ReadMalawi register containing: internal entry ID, PayChangu transaction reference, date/time, currency, gross amount, confirmed status, payment method, collection fee, net amount, settlement/withdrawal reference and fee, any refund amount/status, and reconciliation date. Keep any required donor contact information private and access restricted. Record expenses separately with purpose, amount, date and supporting evidence. Do not create a public donor-name feed by default.

Publish only reconciled aggregate totals. Distinguish contributions received, fees, spending and remaining balance. No sample totals, invented achievements, automatic thank-you emails, recurring charges, or charitable tax receipts are included.

The hosted-link approach does not need API keys in the frontend or a custom payment backend. If automatic receipts or public totals are added later, use server-side verification, authenticated webhooks and duplicate-event protection.
