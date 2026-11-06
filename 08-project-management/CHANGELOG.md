# Changelog

## 2026-11-06 — Phase 0 Discovery & Phase 1–6 Core Implementation
- Restored and verified all 119 specification files against `PACKAGE_MANIFEST.json` and validated all 111 `FR-*` catalog entries (`103 FREE`, `8 PREMIUM`).
- Produced `08-project-management/PHASE_0_GAP_REPORT.md` documenting Android capability feasibility, Play policy constraints, and unresolved human decisions.
- Implemented shared deterministic rule engine (`09-source-code/shared-packages/src/index.ts`) enforcing emergency allowlist priority, parent-granted temporary exception overrides, and strict separation between Free ordinary app blocking (`APP_LIMIT`) and Premium filters (`WEB_FILTER`, `SOCIAL_FILTER`, `NOTIFICATION_FILTER`).
- Implemented Backend API service (`09-source-code/backend-api/src/service.ts`) and Prisma schema (`09-source-code/database/schema.prisma`) covering family/guardian RBAC, expiring one-time pairing codes, rule sync & device acknowledgement, Free SOS & location, Google Play Billing server verification state machine, and Visible Child-Approved Live Session Protocol.
- Scaffolded separate `09-source-code/parent-app` (`com.example.family.parent`) and `09-source-code/child-app` (`com.example.family.child`) Android Gradle/Kotlin modules and unit tests.
- Executed automated acceptance & security test suite (`09-source-code/backend-api/test/acceptance-suite.ts`): 10/10 test suites passing (`TC-AUTH-001` through `TC-PRIV-001`).

## 2026-11-06 — initial specification
- Created Android-only separate Parent and Child app architecture.
- Classified exactly six named sensitive feature families as Premium.
- Kept all other original checklist features Free, regardless of MVP/ADV label.
- Added child-consent and Android platform policy requirements.
- Added autonomous agent instructions, contracts, test plan and starter structure.
