# System Architecture

## Components

Parent Android UI + secure client → REST backend → PostgreSQL. Child Android UI + local rule engine + OS permission adapters ↔ REST backend. FCM delivers wakeups/alerts, not privileged commands without verification. Billing verifier processes purchase updates.

## Trust boundaries

Parent JWT and child-device credentials are distinct; device enrollment proof required; every backend request checks family scope and role; child enforces only signed/versioned rules from backend.

## Offline

Child caches last acknowledged safe policy and local usage counters; server stores rule versions; replay is idempotent; revoked device tokens cannot reconnect.

## Live media

Separate, opt-in real-time session signaling and ephemeral transport must be designed after policy review; no persistent media recording by default; session lifecycle audited without storing content.

## Scaling

Start modular monolith with worker queue; split services only on measured need; partition telemetry and set retention.
