# Phase 0 — Discovery, Platform Feasibility & Gap Report

**Generated:** 2026-11-06  
**Status:** Phase 0 Complete; Phase 1–6 Backend, Rule Engine, Dual-App Scaffolds & Automated Acceptance Tests Implemented; Physical Android Device Validation & Human Policy Gates `BLOCKED` Pending Human Sign-off.

## 1. Repository & Catalog Inventory
- **Specification Manifest:** 119 / 119 files verified against `PACKAGE_MANIFEST.json`.
- **Canonical Feature Catalog (`01-product-requirements/feature_catalog.json`):** 111 unique `FR-*` requirements validated:
  - **FREE (`103` rows):** All core family, pairing, screen-time limits, per-app blocking, schedules, location, geofences, SOS, extra-time requests, co-guardian roles, family chat, chores/rewards, reports/exports, privacy/consent controls, and `[ADV]` complexity items.
  - **PREMIUM (`8` rows across exactly 6 feature families):**
    1. Screen mirroring (`FR-PARENT-024`, `FR-PARENT-026`)
    2. Live camera (`FR-PARENT-024`, `FR-PARENT-027`)
    3. Live audio (`FR-PARENT-024`, `FR-PARENT-028`)
    4. Notification filtering (`FR-PARENT-029`, `FR-CHILD-027`)
    5. Web filtering (`FR-PARENT-010`, `FR-CHILD-027`)
    6. Social-media app/content filtering (`FR-PARENT-030`, `FR-CHILD-027`)
  - Child-facing disclosure, session consent, and persistent stop controls (`FR-CHILD-022`, `FR-CHILD-024`, `FR-CHILD-025`, `FR-CHILD-026`) remain strictly **FREE**.

## 2. Android Platform & Google Play Policy Feasibility Assessment
| Capability | Tier | Android Mechanism | Play Policy / OS Constraint | Supported Fallback |
|---|---|---|---|---|
| App Usage & Time Limits | FREE | `UsageStatsManager` (`PACKAGE_USAGE_STATS`) | Requires user opt-in in Settings; consumer devices cannot guarantee non-removable lock | Show explicit `PERMISSION_MISSING` state & child-friendly setup guide |
| Ordinary App Blocking | FREE | Foreground usage monitor / legitimate `DevicePolicyManager` | Accessibility API must not be used for covert automation or anti-uninstall tricks | Enforce with transparent restriction screen (`C-05`) preserving emergency dialer |
| Call / SMS Activity (`FR-PARENT-019`) | FREE | `READ_CALL_LOG` / `READ_SMS` | Restricted by Google Play policy unless default dialer/SMS handler | **BLOCKED / HUMAN GATE:** Do not request `READ_SMS`/`READ_CALL_LOG` without human policy sign-off; use in-app family chat (`FR-PARENT-023`) and approved emergency contacts (`FR-EMERGENCY-001`) |
| Social Content / Risky Message Detection (`FR-PARENT-018/030`) | FREE / PREMIUM | App category & domain rules | Android sandboxing & E2EE prevent reading private third-party in-app messages | Enforce category/domain/schedule limits (`PARTIAL`); disclose clearly that E2EE chats are never inspected |
| Web Filtering (`FR-PARENT-010`) | PREMIUM | Local `VpnService` DNS filter / browser integration | No root CA or TLS MITM interception allowed | Domain/category DNS filtering with capability status disclosure |
| Notification Filtering (`FR-PARENT-029`) | PREMIUM | `NotificationListenerService` opt-in | Must never suppress emergency, OS security, permission, or live-session indicators | Hardcoded allowlist for `EMERGENCY_ALERT`, `OS_SECURITY_WARNING`, `LIVE_SESSION_FOREGROUND_INDICATOR` |
| Live Screen / Camera / Audio (`FR-PARENT-024/026/027/028`) | PREMIUM | `MediaProjection` / Camera2 / AudioRecord + Foreground Service | Requires per-session child tap (`C-13`), OS consent dialog, persistent indicator (`C-14`), and <2s child stop | Ship behind default-OFF feature flags; zero media storage; instant stop on child action or permission revocation |

## 3. Environment & Verification Blockers (Honest Reporting per `AGENTS.md`)
- **Automated Backend & Rule Engine Verification (`PASSED`):** Node.js/TypeScript backend service (`09-source-code/backend-api/src/service.ts`), shared deterministic rule engine (`09-source-code/shared-packages/src/index.ts`), and all 10 acceptance & security test suites (`TC-AUTH-001` through `TC-PRIV-001`) run and pass in this environment.
- **Physical Android Device Matrix (`BLOCKED`):** Per `00-agent-instructions/DEFINITION_OF_DONE.md`, no feature may be marked `DONE` without physical Android device validation across Android 10–15 and multiple OEMs. Because this cloud container has no attached physical Android hardware or Android SDK/ADB daemon, tasks requiring physical device verification are recorded as `IN_PROGRESS` / `BLOCKED` with exact reproducible verification steps.
- **Human Approval Gates (`T-001`):** Brand/package IDs, jurisdiction/age thresholds, subscription pricing/SKUs, and production keys remain open in `01-product-requirements/OPEN_QUESTIONS.md`.
