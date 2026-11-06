# Premium Filtering Scope and Android Constraints

## Notification filter
Opt-in Android Notification Listener access is required; do not request or read notification text unless strictly necessary and explicitly disclosed. Default is app/package or user-selected category allow/suppress rules. Never suppress emergency, critical OS/security, permission, or live-capture indicators. Notifications from some apps may be inaccessible or uncancellable. No claims of universal content moderation.

## Web filter
Only supported DNS/VPN/browser-based domain/category filtering, with user authorization and explicit disclosure. Do not install root CA certificates, break TLS, MITM HTTPS or secretly inspect traffic. Encrypted DNS, VPN conflicts, browsers and apps can limit coverage. Always show capability status.

## Social media filter
Premium social-media category/content rules are limited to app-level category classification, supported network domains or explicitly integrated APIs. **Ordinary app blocking, app schedules and per-app time limits remain FREE**. Do not read E2EE messages, scrape app private storage, harvest credentials, or promise comprehensive message filtering.

## Fallback
When unsupported or permission revoked, disable the specific filter, tell parent and child, preserve Free features, and mark rule `UNSUPPORTED` or `PERMISSION_MISSING`.
