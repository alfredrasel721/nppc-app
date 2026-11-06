# Threat Model

## Assets

Child location, identity, usage, alerts, family relationships, credentials, live session metadata and potentially sensitive media.

## Adversaries

Impersonating guardian, compromised child phone, malicious insider, stolen parent phone, billing fraud, network attacker, abusive guardian.

## Threats and mitigations

Pairing hijack → one-time short code + confirmation; IDOR → family-scoped authorization tests; stalking → scope limits, child-visible disclosures and audit; media misuse → child approval, OS consent, no recording, stop; data leak → encryption/retention and support isolation; purchase spoof → server verification.

## Residual risks

Child consent can be pressured; legal consent varies by jurisdiction; device OEM behaviors vary; do not ship without safeguarding and legal review.
