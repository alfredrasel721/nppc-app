# Visible Child-Approved Live Session Protocol (Premium)

## Allowed modes
`SCREEN`, `CAMERA`, `MICROPHONE` only. All three require active verified Premium and specific child-device approval for each requested session.

## States
`REQUESTED -> NOTIFIED -> CHILD_ACCEPTED -> OS_PERMISSION_PENDING -> ACTIVE -> STOPPED/EXPIRED/DISCONNECTED`; decline goes to `DECLINED`; invalid entitlement goes to `REJECTED`.

## Server checks
Authenticate parent; verify family scope, guardian permission, active Premium, enrolled device, rate limit and no overlapping session. Create random single-use request ID with 60-second child decision expiry. Device must return explicit decision signed by enrolled child-device credential; server issues short-lived session token only after child acceptance. **Server token never substitutes for OS permission.**

## Child device
Display requesting guardian, exact media mode and session duration. Require an affirmative tap for this request. Trigger Android MediaProjection OS consent for screen; camera/mic runtime permission and foreground service for corresponding modes. Maintain persistent foreground notification, Android privacy indicators, and in-app stop. End immediately on child stop, permission revocation, disconnect, logout, entitlement loss or expiry. No silent retry, background auto-restart, capture while screen locked unless expressly supported and approved, or local recording.

## Parent
Show waiting, declined, OS consent pending, active and ended. A parent cannot override child refusal. Session UI must not claim active before child-device acknowledgement.

## Transport
Use encrypted ephemeral real-time transport selected after privacy/security design review; short-lived credentials, minimal metadata, no default recording or media storage. Audit request, guardian, child-device decision, start/end and reason, never raw media.

## Tests
No subscription, wrong family, forged child approval, timeout, declined, OS denied, child stop, background/lock, network loss, refund mid-session, simultaneous request and unauthorized viewer. Block release if any unauthorized capture is possible.
