# Child Rule Engine — Deterministic Contract

## Rule types and tier
- FREE: `TIME_LIMIT`, `APP_LIMIT`, `DOWNTIME`, `ESSENTIAL_ALLOWLIST`, `EXCEPTION`, `SCHOOL_FOCUS` (where supported).
- PREMIUM: `WEB_FILTER`, `SOCIAL_FILTER`, `NOTIFICATION_FILTER`.
- Premium `LIVE_SCREEN`, `LIVE_CAMERA`, `LIVE_AUDIO` are **sessions**, not persistent rules.

## Rule envelope
`{id, childId, deviceId, type, schemaVersion, revision, effectiveFrom, effectiveUntil, scheduleTimezone, payload, createdBy, createdAt}`. All writes validated server-side; child validates again and acknowledges exact revision.

## Conflict resolution
1. Emergency/essential access overrides restrictive rules where the OS allows.
2. Child-approved temporary exceptions override matching ordinary app/time rules for their expiry only.
3. More restrictive overlapping schedules apply; ties resolved by latest revision.
4. An expired Premium entitlement removes only Premium rules, not Free rules.
5. Unsupported/permission-missing controls report `UNSUPPORTED`/`PERMISSION_MISSING`, not `APPLIED`.
6. Server and device use UTC timestamps plus named timezone for schedules; test DST transitions.

## Enforcement status
`PENDING`, `APPLIED`, `PARTIAL`, `FAILED`, `UNSUPPORTED`, `PERMISSION_MISSING`, `EXPIRED`. Parent UI shows exact status and last device acknowledgement; never displays success merely because API accepted a command.

## Android reality
App blocking is best-effort for personal devices. Agents must use legitimate, declared OS APIs and policy-compliant UX. No hidden Accessibility automation, bypass of permission dialogs, uninstall protection tricks, or claim of universal enforcement.
