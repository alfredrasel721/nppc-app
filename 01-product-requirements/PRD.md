# Product Requirements Document (PRD)

## Goals

Two independent Android apps with transparent family supervision; safe default permissions; robust free features; explicit Premium gating of exactly six sensitive feature families.

## Personas

Parent: sets rules, sees reports, manages billing. Child: sees rules, requests exceptions, controls live monitoring consent. Co-guardian: scoped access. Trusted contact: emergency-only. Support: diagnostics only.

## Scope

Two **separate Android applications** (distinct application IDs, installable APK/AABs, launchers, stores listings and authentication roles): `parent-app` and `child-app`. Shared Kotlin modules allowed; no iOS application, no customer-facing family web portal. Account, reporting and subscription functions from the original web dashboard are moved into the Parent Android app. A restricted internal admin web console is a non-consumer operational tool, not an Android user-facing product. Optional school and wearable integrations remain Free but depend on separate integrations and feasibility.

Free: Every other feature in the supplied checklist is Free for all registered families, including location, geofences, reports, app blocking and time limits, SOS, guardian roles, tasks/rewards, family chat, history, call/SMS-related functions *where policy permits*, wearable integration *where compatible*, data export/deletion, admin safety operations, and accessibility. “ADV” in the source checklist means complexity only, not a paid tier. Paid status never gates emergency features, consent, safety, account security, or data rights.

Premium:
1. Screen mirroring / live screen view (child-approved MediaProjection session).
2. Live camera (child-approved foreground camera session).
3. Live audio (child-approved foreground microphone session).
4. Notification filtering (only app/category-level suppression/allow where Android permits; never hide critical OS/emergency notifications).
5. Web filtering (domains/categories/allowlist/blocklist; no TLS interception).
6. Social-media app/content filtering (app access controls may remain free; content/category filters are Premium; no promise of reading encrypted in-app messages).

## Key journeys

Parent creates account → creates child → child installs separate app → both verify pairing → child grants only needed permissions → parent sets rule → child sees and applies → child requests exception → parent approves → audit. Premium purchase → backend verifies → child is informed → parent requests sensitive action → child explicitly accepts → session starts with indicator and stop.

## Non-goals

No iOS clients; no public web dashboard; no covert monitoring; no blanket access to encrypted social messages; no promise of non-removable restrictions on personal Android devices.

## Business rules

No Free feature limit or paid upsell outside six named families. No data rights or emergency capabilities behind paywall. Premium cancellation/revocation ends future Premium sessions and removes Premium filter enforcement safely.

## KPIs and risks

Measure pairing completion, sync latency, request response, false SOS delivery, crashes and subscription verification. Risks: OS permissions, Play policy, age consent, device management differences, battery limits and OEM behavior.
