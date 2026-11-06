# Security Requirements

## Access control

All reads/writes bound to family, child and role; premium checks server-side and on device; live requests additionally require child per-session approval.

## Transport/storage

TLS, encryption at rest, Android Keystore for credentials, secure token rotation, least-privilege DB/service accounts, short-lived signed session tokens.

## Logging

Audit pairing, guardian role changes, rule edits, sensitive session request/decision/start/stop, purchases, data export/deletion; no raw content.

## Abuse resistance

Rate-limit pairing, brute force, SOS spam, media requests; detect account takeover; revoke devices and sessions; protect against coercion.

## Privacy review

Threat model, dependency scans, pen test, age/guardian verification, region/legal review before launch.
