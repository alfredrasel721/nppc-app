# AGENTS — Android Parental Control

## Status and scope
- This repository is a specification + starter scaffold, not a working product. All 111 entries in `01-product-requirements/feature_catalog.json` are `PLANNED`; `09-source-code/` contains only boundary READMEs, a stub `backend-api/package.json`, and an illustrative `database/schema.prisma`.
- Target: separate `parent-app` and `child-app` Android apps (distinct IDs, launchers, artifacts) plus a TypeScript/Fastify/PostgreSQL backend. No iOS or consumer web portal; the admin console is internal-only web.
- Parent app owns account, billing and reports; child app owns visible permissions, local rules and consent. Implement inside `09-source-code/`; do not create a competing source tree.

## Source of truth
Read in this order; resolve conflicts explicitly, never by guessing:
1. `README.md`, `00-agent-instructions/PROJECT_CONTEXT.md`, `08-project-management/DECISION_LOG.md` — human decisions override everything.
2. `01-product-requirements/feature_catalog.json` — canonical and CI-validated; `FEATURE_CATALOG.md`, `SRS.md`, `PRD.md` add detail.
3. `03-technical-architecture/` — OpenAPI, live-session state machine, filtering limits, approved stack.
4. `10-resources/original-inputs/` and root `parental_control_ai_agent_master_prompt.txt` — original inputs, lowest authority.
- `01-product-requirements/OPEN_QUESTIONS.md` lists unresolved human decisions (brand, app IDs, minSdk, jurisdiction/age, pricing, providers). Stop and ask before choosing them. Log resolved contradictions in `DECISION_LOG.md`.

## Non-negotiable product rules
- Exactly six Premium families: screen mirroring, live camera, live audio, notification filter, web filter, social-media app/content filter. Everything else is Free, including app blocking/time limits, location/geofences, SOS, reports, chat, consent/privacy UI, account security, data export/deletion, and optional school/wearable integrations where feasible. Do not add trials or quotas to Free without human approval.
- The catalog has 8 `PREMIUM` rows because the six families are split across parent-side management/viewer and child-side enforcement (`FR-PARENT-010/024/026/027/028/029/030`, `FR-CHILD-027`); do not invent extra paid features from the row count. Enforce entitlements in the backend AND the child app; a purchase never grants device permission.
- `MVP`/`ADV`/`USER_ADDITION` source labels are planning metadata, not price. `[ADV]` features are Free. Ordinary app blocking stays Free; social-media content/category filtering is Premium.
- Never build covert recording, silent camera/mic/screen activation, stealth install, certificate/TLS interception, notification access without explicit opt-in, E2EE bypass, credential harvesting/unauthorized account access, or anti-uninstall tricks. Notification rules must never suppress emergency, security, permission or live-session indicators.
- Live sessions require per-session affirmative child action, OS prompt, foreground service, persistent indicator and child stop; emergency/consent/security paths are never blocked. Sensitive features ship behind default-off flags. No third-party analytics SDK in the child app by default.
- Verify Android/Play capability before claiming support; if unavailable, record the gap and a supported fallback instead of silently dropping the item.

## Architecture invariants
- Parent JWT and child-device credentials are distinct; every backend request checks family scope and role. The child applies only signed/versioned rules and acknowledges the applied version.
- FCM delivers wakeups/alerts, not unverified privileged commands. Billing tokens are verified server-side; never trust a client Premium flag.
- Live media uses ephemeral signaling/transport with no default recording or content storage; audit request/approval/start/stop metadata only. A server session token never substitutes for the OS permission. Follow `03-technical-architecture/LIVE_SESSION_PROTOCOL.md`.

## Layout and verification
- `00-agent-instructions/` workflow/standards/DoD; `01`–`08` requirements, UI/UX, architecture, platform specs, security, tests, devops, project tracking; `09-source-code/` implementation roots; `10-resources/original-inputs/` uploads.
- Local DB: `docker compose up -d postgres` (service `postgres`, port 5432, db/user/pass `parental_dev`/`dev`/`dev`). Copy `.env.example` to `.env`; never commit `.env`, signing keys or Play/Firebase credentials.
- No root build/test command exists. `09-source-code/backend-api/package.json` `test`/`build` intentionally exit 1 until implemented. No Gradle/Android project or Node lockfile exists yet; scaffold real builds, tests and pinned dependencies (pnpm per `07-devops-and-deployment/DEVELOPMENT_SETUP.md`).
- The only repo check is `.github/workflows/validate-specs.yml`: Python asserts >100 unique catalog IDs, FREE/PREMIUM tiers, and both app READMEs. It does not compile apps or run tests; green CI is not feature evidence.
- Root `stitch_nppc_app_ui*.zip` contains parent/child/admin HTML+PNG mockups; they are not extracted or listed in `PACKAGE_MANIFEST.json`, and no script regenerates that manifest.

## Conventions
- Android: Kotlin, Jetpack Compose, Hilt, Room, WorkManager, coroutines/Flow. Backend: Node LTS, TypeScript strict, Fastify, Prisma/PostgreSQL, zod, OpenAPI 3.1 under `/v1`.
- IDs: `FR-<AREA>-NNN`; tests `TC-<AREA>-NNN`. DB columns snake_case, JSON camelCase, timestamps UTC. Placeholder package IDs are `com.example.family.parent` and `com.example.family.child` until naming is approved.

## Workflow and evidence
- Pick the next unblocked task in `08-project-management/TASKS.md`; follow `IMPLEMENTATION_PLAN.md`/`DEPENDENCY_MAP.md` order: policy → auth/family/pairing → rule sync/local enforcement → Free controls/location/SOS → billing → Premium → hardening.
- Link every task to its `FR-*`/`TC-*` IDs and screen/module; update `PROGRESS_TRACKER.md`, `REQUIREMENT_TRACEABILITY.csv`, `CHANGELOG.md`, and `DECISION_LOG.md` for decisions.
- `DONE` requires the `00-agent-instructions/DEFINITION_OF_DONE.md` checklist (acceptance, entitlement, permission/revocation, offline, security/privacy, accessibility) plus physical Android device evidence. Missing devices or unrun tests = `BLOCKED`; compilation or file presence is never done.
- Cover parent+child E2E, child decline, OS permission revocation, emergency during lock, refund/expiry mid-session, and OEM variability (`06-testing-and-quality/`).

## Human approval gates
Ask before: choosing jurisdiction/age policy; releasing sensitive monitoring; enabling Accessibility or device-admin flows; using SMS/call-log permissions; Google Play declarations; production billing; handling production keys; deployment; public release.
