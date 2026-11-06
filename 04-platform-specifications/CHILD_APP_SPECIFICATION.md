# Child Android App Specification

## Package

Independent app ID placeholder `com.example.family.child`; separate AAB, launcher, signing key and Play listing.

## Free modules

Pairing and permission education, today usage, schedules, allowed/blocked apps, restriction explanation, requests, SOS/check-in, family chat, tasks/rewards, privacy dashboard, sync status, child-visible monitoring notices and live session consent/stop.

## Premium enforcement

Web/social/notification filtering only with verified entitlement, Android permission, supported capability and child disclosure. Live screen/camera/microphone only when child approves a particular session and the Android OS permits it.

## Local architecture

Room caches rules and app usage; WorkManager handles deferrable sync; foreground services only for justified, visible tasks. FCM triggers fetch; rules versioned and acknowledged.

## No covert behavior

No hidden icon, stealth start, silent capture, persistent screen/audio recording, OS prompt bypass or bypass of permission revocation. Child can end live session immediately.
