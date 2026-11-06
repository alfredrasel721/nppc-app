# Software Requirements Specification (SRS)

## 1. Purpose and scope

Normative behavior for two Android apps, shared backend, and internal admin. Requirement IDs in `feature_catalog.json`; priority in original file is complexity not monetization.

## 2. Actors and boundaries

Parent Android, Child Android, co-guardian using Parent app, trusted contact via approved channel, backend, billing verifier, FCM, internal staff. No public web portal.

## 3. Functional requirement schema

Each `FR-*` entry MUST have owner, preconditions, trigger, input/output, successful and failed transitions, Android permission/policy prerequisites, tier, audit event, UI screen, acceptance test and release status in traceability. Catalog is exhaustive; detailed examples below.

## 4. Core requirements

FR-PARENT-001 family account creation: authenticated parent can create and modify family profiles; server enforces family ownership. FR-PARENT-002 pairing: short-lived, single-use code, device-side confirmation, revocation and audit. FR-PARENT-005/006: screen time and app limits applied only after child ack. FR-PARENT-011: location with timestamp and permission status. FR-CHILD-011: SOS reachable even during downtime.

## 5. Premium requirements

Screen mirror: server checks Premium and family scope; child receives visible request, approves and Android MediaProjection consent; foreground indicator; stop; never auto-restart. Camera/mic: child opt-in per session, foreground service, runtime permissions and OS indicators. Notification filter: user enables listener if supported, rule-only app/category suppression, disclose content access; no capture of notification bodies by default. Web: domain/category rules via approved methods without interception. Social: category/app-level supported filtering, not reading E2EE chats.

## 6. Error and edge cases

Offline child: queue commands and show pending, do not claim success. Revoked permission: show disabled and request re-enable. Expired Premium: end session and stop filter; leave free rules intact. Child declines live request: record declined without alternative capture. Emergency: preserve phone/SOS where possible.

## 7. Data and interfaces

PostgreSQL entities described in `DATABASE_DESIGN.md`; `/v1` REST OpenAPI; FCM for notifications, never a source of authorization; server-side verified Google Play entitlements.

## 8. Verification

Test every FR-ID against positive, negative, unauthorized, offline and entitlement cases. See traceability CSV, test cases and device matrix. Release requires human legal/store-policy/security approval.
