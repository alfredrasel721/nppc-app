# Android Parental Control — Autonomous Build Specification

## What this is

A **requirements-and-agent-execution package**, not a completed app. It translates both uploaded source documents into a build-ready specification, contract drafts, QA plans and agent instructions. Generated 2026-11-06. All features are unimplemented until agents build and validate them.

## Non-negotiable decisions

Two **separate Android applications** (distinct application IDs, installable APK/AABs, launchers, stores listings and authentication roles): `parent-app` and `child-app`. Shared Kotlin modules allowed; no iOS application, no customer-facing family web portal. Account, reporting and subscription functions from the original web dashboard are moved into the Parent Android app. A restricted internal admin web console is a non-consumer operational tool, not an Android user-facing product. Optional school and wearable integrations remain Free but depend on separate integrations and feasibility.

**Premium ONLY:**

1. Screen mirroring / live screen view (child-approved MediaProjection session).
2. Live camera (child-approved foreground camera session).
3. Live audio (child-approved foreground microphone session).
4. Notification filtering (only app/category-level suppression/allow where Android permits; never hide critical OS/emergency notifications).
5. Web filtering (domains/categories/allowlist/blocklist; no TLS interception).
6. Social-media app/content filtering (app access controls may remain free; content/category filters are Premium; no promise of reading encrypted in-app messages).

**Free:** Every other feature in the supplied checklist is Free for all registered families, including location, geofences, reports, app blocking and time limits, SOS, guardian roles, tasks/rewards, family chat, history, call/SMS-related functions *where policy permits*, wearable integration *where compatible*, data export/deletion, admin safety operations, and accessibility. “ADV” in the source checklist means complexity only, not a paid tier. Paid status never gates emergency features, consent, safety, account security, or data rights.

## Start here

1. Read `AGENTS.md` and `00-agent-instructions/AGENT_WORKFLOW.md`. 2. Read `01-product-requirements/PRD.md`, `SRS.md`, `FEATURE_CATALOG.md`. 3. Validate Android capabilities and Google Play policy on real devices before implementation. 4. Build in the dependency order in `08-project-management/TASKS.md`. 5. Keep test and requirement traceability updated. 6. Obtain human approvals for billing, privacy, sensitive monitoring, production credentials and releases.

## Architecture

Parent Android (Kotlin/Compose) ↔ authenticated backend (TypeScript/Fastify/PostgreSQL) ↔ Child Android (Kotlin/Compose), FCM for event wakeups, encrypted transport and role-bound APIs. Internal admin console optional and restricted.

## Release reality

This package does not claim that all proposed features can be delivered on consumer Android or accepted by Google Play. Live monitoring requires child action, active visible indicators, supported OS APIs, and privacy/legal review. App and web restrictions vary by Android version, device ownership and OEM.

## Included files

Agent playbooks; PRD/SRS; full feature inventory (MD/CSV/JSON); UI/UX; architecture, data and OpenAPI drafts; separate parent/child specs; billing/privacy/security; tests; deployment and project tracking; starter source layout and configs; original inputs preserved under `10-resources/original-inputs/`.
