# Agent Task Board

| ID | Task | Phase | Owner | Scope | Status |
|---|---|---|---|---|---|
| T-001 | Policy feasibility and guardian consent decisions | 0 | HUMAN+SECURITY | All | BLOCKED (Awaiting Human Sign-off on `OPEN_QUESTIONS.md`) |
| T-002 | Bootstrap parent Android project (`com.example.family.parent`) | 1 | ANDROID_PARENT | FR-PARENT | IN_PROGRESS (Gradle/Kotlin scaffold + web workbench live; physical device build pending) |
| T-003 | Bootstrap child Android project (`com.example.family.child`) | 1 | ANDROID_CHILD | FR-CHILD | IN_PROGRESS (Gradle/Kotlin scaffold + safety invariants live; physical device build pending) |
| T-004 | Bootstrap backend and migrations | 1 | BACKEND | FR-BACKEND | IN_PROGRESS (Fastify/Express `/v1` API, Prisma schema & 10/10 `TC-*` acceptance suites passing) |
| T-005 | Auth/family/guardian/pairing | 2 | BACKEND+ANDROID | FR-PARENT-001/002, FR-CHILD-001, FR-CO_GUARDIAN-001..007 | IN_PROGRESS (`TC-AUTH-001` & `TC-PAIR-001` passing; awaiting physical device E2E) |
| T-006 | Child permissions, local rule engine and ack | 2 | ANDROID_CHILD | FR-CHILD-002..007, FR-CHILD-023 | IN_PROGRESS (`TC-TIME-001` & `TC-APP-001` passing; awaiting physical device E2E) |
| T-007 | Free limits, schedules, requests and reports | 2 | ANDROID | FR-PARENT-003..009, FR-CHILD-008..009 | IN_PROGRESS (Deterministic rule engine & request/approval flows verified in API tests) |
| T-008 | Free SOS/location/geofence and contacts | 2 | ANDROID+BACKEND | FR-PARENT-012..014, FR-CHILD-010..011, FR-EMERGENCY-001..005 | IN_PROGRESS (`TC-LOC-001` & `TC-SOS-001` passing; awaiting physical device E2E) |
| T-009 | Free chat/tasks/other catalog features | 3 | ANDROID+BACKEND | FR-PARENT-022..023, FR-CHILD-014..021 | IN_PROGRESS (Check-in, tasks/rewards, family chat & free-time pause implemented) |
| T-010 | Play Billing server verification | 4 | BACKEND+ANDROID_PARENT | FR-BACKEND-011..012, FR-FAMILY_WEB_MIGRATED-002 | IN_PROGRESS (`TC-BILL-001` passing; Play Console production SKU pending human gate) |
| T-011 | Premium web/social/notification filters | 4 | ANDROID_CHILD | FR-PARENT-010/029/030, FR-CHILD-024/027 | IN_PROGRESS (`TC-FILTER-001` passing; emergency/live indicators protected) |
| T-012 | Premium child-approved screen/camera/audio | 4 | ANDROID_CHILD+SECURITY | FR-PARENT-024/026/027/028, FR-CHILD-022/025/026, FR-PRIVACY-010 | IN_PROGRESS (`TC-LIVE-001` passing behind default-OFF flags; awaiting human safety sign-off) |
| T-013 | Internal support admin and privacy operations | 3 | BACKEND | FR-ADMIN-001..007, FR-PRIVACY-001..009 | IN_PROGRESS (`TC-PRIV-001` passing; support diagnostics redacted from child content) |
| T-014 | E2E, security, physical device matrix | 5 | QA+SECURITY | All | BLOCKED (Requires physical Android 10–15 devices & OEM hardware lab) |
| T-015 | Staging and release with human approval | 5 | DEVOPS | All | BLOCKED (Requires human legal, Play policy, and production signing approval) |

Every task links catalog FR IDs, UI screens, code modules, tests and evidence in traceability. Per `DEFINITION_OF_DONE.md`, no task is marked `DONE` without physical Android device evidence.
