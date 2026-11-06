# Parent Android App Specification

## Package

Independent app ID placeholder `com.example.family.parent`; separate AAB, launcher, signing key and Play listing.

## Modules

Account, family/child profiles, pairing, dashboard, usage, free app/time rules, schedules, location, geofence, alerts/SOS, requests, tasks/rewards, chat, co-guardian, emergency contacts, privacy/export/delete, reports, billing, Premium filter configuration, Premium live session requests/viewer.

## Free and Premium

Every other feature in the supplied checklist is Free for all registered families, including location, geofences, reports, app blocking and time limits, SOS, guardian roles, tasks/rewards, family chat, history, call/SMS-related functions *where policy permits*, wearable integration *where compatible*, data export/deletion, admin safety operations, and accessibility. “ADV” in the source checklist means complexity only, not a paid tier. Paid status never gates emergency features, consent, safety, account security, or data rights.

Premium only:
1. Screen mirroring / live screen view (child-approved MediaProjection session).
2. Live camera (child-approved foreground camera session).
3. Live audio (child-approved foreground microphone session).
4. Notification filtering (only app/category-level suppression/allow where Android permits; never hide critical OS/emergency notifications).
5. Web filtering (domains/categories/allowlist/blocklist; no TLS interception).
6. Social-media app/content filtering (app access controls may remain free; content/category filters are Premium; no promise of reading encrypted in-app messages).

## UX

Never display unsupported filter as active; show child device capability and permission requirements. Show subscription and cancellation status, but never restrict Free tools.

## Security

Scoped role checks, biometric re-auth optional for sensitive requests, session timeout, screenshot redaction for child-private data where appropriate.
