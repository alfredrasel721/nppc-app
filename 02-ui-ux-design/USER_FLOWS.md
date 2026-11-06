# User Flows

## Pairing

Parent signs up → creates child → generates expiring code → child installs child app → enters code → confirms linked family → parent verifies → permission education → device sync.

## Free controls

Parent selects child → configures limit → server validates → pending → child enforces where supported → ack → parent sees status. Child can request exception → parent decides → child sees result.

## Premium purchase

Parent chooses Premium → Google Play Billing checkout → backend validates purchase and account ownership → entitlement activated → parent sees enabled modules. Refund/cancel/expiry handled server-side.

## Live screen/camera/audio

Parent selects child and mode → backend checks scope/entitlement → child sees explicit request, who is watching and what data → child accepts → OS permission prompt → foreground session indicator and stop → automatic expiry and audit. Decline ends request.

## Safety

Child taps SOS → sends best-known location and alert → parent and configured contacts notified → child sees delivery result; offline fallback and retry clearly explained.
