# Decision Log

## D-001 confirmed by user

Parent and Child apps must be separate (`com.example.family.parent` and `com.example.family.child`).

## D-002 confirmed by user

Only screen mirroring, live camera, live audio, notification filtering, web filtering and social-media app/content filtering are Premium.

## D-003 confirmed by user

All other features from checklist are Free (including `[ADV]` items, ordinary app blocking, time limits, schedules, SOS, location, geofences, reports, chat, and tasks).

## D-004 confirmed by user

Android only for consumers.

## D-005 inferred for consistency

Family web dashboard features moved into Parent Android; internal admin web remains non-consumer.

## D-006 engineering safeguard

Child-approved, visible live sessions only, no covert capture.

## D-007 engineering safeguard (2026-11-06)

- Provisional placeholders `com.example.family.parent`, `com.example.family.child`, `minSdk = 29` (Android 10), and `targetSdk = 35` (Android 15) are used in Gradle scaffolds per `AGENTS.md` until human brand/SDK sign-off.
- Sensitive live-session modes (`SCREEN`, `CAMERA`, `MICROPHONE`) ship behind default-OFF feature flags (`enableLiveScreen = false`, `enableLiveCamera = false`, `enableLiveMicrophone = false`).
- `FR-PARENT-019` (Call/SMS activity) is gated as `BLOCKED` pending human Play policy & legal review due to Google Play Call Log / SMS permission restrictions.

## Open human decisions

Product brand, legal region/age, target SDK, subscription SKU/price, billing trial policy, device owner mode, optional school/wearable priorities.
