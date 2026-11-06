# Project Context and Binding Decisions

## Product

Two **separate Android applications** (distinct application IDs, installable APK/AABs, launchers, stores listings and authentication roles): `parent-app` and `child-app`. Shared Kotlin modules allowed; no iOS application, no customer-facing family web portal. Account, reporting and subscription functions from the original web dashboard are moved into the Parent Android app. A restricted internal admin web console is a non-consumer operational tool, not an Android user-facing product. Optional school and wearable integrations remain Free but depend on separate integrations and feasibility.

## Pricing

Premium ONLY: 1. Screen mirroring / live screen view (child-approved MediaProjection session).
2. Live camera (child-approved foreground camera session).
3. Live audio (child-approved foreground microphone session).
4. Notification filtering (only app/category-level suppression/allow where Android permits; never hide critical OS/emergency notifications).
5. Web filtering (domains/categories/allowlist/blocklist; no TLS interception).
6. Social-media app/content filtering (app access controls may remain free; content/category filters are Premium; no promise of reading encrypted in-app messages).

Free: Every other feature in the supplied checklist is Free for all registered families, including location, geofences, reports, app blocking and time limits, SOS, guardian roles, tasks/rewards, family chat, history, call/SMS-related functions *where policy permits*, wearable integration *where compatible*, data export/deletion, admin safety operations, and accessibility. “ADV” in the source checklist means complexity only, not a paid tier. Paid status never gates emergency features, consent, safety, account security, or data rights.

## Constraints

Android only; independent parent/child apps; no consumer web portal. Admin web is internal only. No user brand, region, min SDK, billing prices or age policy supplied; these remain explicit human decisions.

## Original material

Full uploaded instructions and checklist are copied to `10-resources/original-inputs/`; feature catalog preserves all source checklist items and flags user additions.
