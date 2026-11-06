# Google Play Billing / Entitlement State Machine

## Scope
Only the Parent Android app initiates purchase. Backend is authoritative. One verified family subscription grants the six named Premium feature families to authorized guardians and their enrolled child devices. No other checklist feature is paid.

## States
`FREE`, `PENDING_VERIFICATION`, `PREMIUM_ACTIVE`, `PREMIUM_GRACE_VERIFIED`, `EXPIRED`, `CANCELLED_AT_PERIOD_END`, `REFUNDED`, `REVOKED`, `ERROR`.

## Required flows
- Parent buys through Play Billing; client sends purchase token securely; backend checks package, product, purchase state, owner and expiry with Google Play API; server records idempotent entitlement event.
- Do not enable Premium from client purchase callback alone. A cancelled subscription may remain active until verified end-of-term; refund/revocation disables immediately after verification.
- Reconcile on app start, server notifications, and periodic worker. Failed verification does not mint Premium.
- When Premium expires, stop live sessions, disable Premium filters, show child/parent notices, and preserve all Free rules, SOS and privacy controls.
- No hidden upsells or Free feature limits. Trial duration and prices remain human decisions.

## Acceptance
TC-BILL-001 spoofed client flag rejected; TC-BILL-002 duplicate purchase notification idempotent; TC-BILL-003 refund disables only Premium; TC-BILL-004 Premium access restricted to family and authorized guardian.
