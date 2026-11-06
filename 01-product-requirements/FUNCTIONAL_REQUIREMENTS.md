# Functional Requirements

## Canonical registry

`feature_catalog.json` is the exhaustive source of feature IDs and tiers. Implement each feature via UI, backend/device enforcement, audit, and tests, or explicitly mark BLOCKED/UNSUPPORTED with evidence.

## Core invariants

Free features never call Premium entitlement checks. Premium API/device actions always verify active entitlement and relevant permissions. Child-facing disclosure and consent are Free.

## Rule lifecycle

Draft → validated → saved → sync_pending → acknowledged/enforced or failed/unsupported. Never show enforced until child confirms.

## Sensitive session lifecycle

Requested → child notified → child accepts/declines → Android system permission prompt if applicable → foreground session → child may stop → terminated and audited. Timeout and cancel on disconnect/entitlement loss.
