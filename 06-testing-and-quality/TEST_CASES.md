# Acceptance Test Scenarios

## TC-AUTH-001

Unauthenticated family API rejected; authenticated parent only sees own family.

## TC-PAIR-001

Expired/replayed pairing code rejected; successful pairing requires child confirmation.

## TC-TIME-001

Free screen-time limit applies and child ack updates parent; offline stays pending.

## TC-APP-001

Free app block works only within supported Android capability; emergency apps remain reachable.

## TC-LOC-001

Location with permission and timestamp; revoked permission reports unavailable, not stale as live.

## TC-SOS-001

SOS available on Free and after Premium expiry; alerts deduplicated and delivery state visible.

## TC-BILL-001

Forged client Premium flag rejected; valid purchase server verified; refund disables only six Premium families.

## TC-LIVE-001

No active session without Premium, child accept and OS permission. Child decline, stop, timeout and permission revocation terminate capture.

## TC-FILTER-001

Web/social/notification filters require Premium; free app blocking remains available.

## TC-PRIV-001

Staff cannot access child private content; export/delete requires authorized owner.
