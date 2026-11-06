# Device Permission and Consent Matrix

| Function | Permission or user action | Free/Premium | Failure behavior |
|---|---|---|---|
| Usage analytics | User enables Usage Access | Free | Explain and show unavailable |
| Location/geofence | Foreground/background location where justified and approved | Free | Stale location + prompt |
| Alerts | Android notification permission as required | Free | In-app status/fallback |
| App control | Legitimate usage/device-management capabilities | Free | Partial/unsupported warning |
| Notification filtering | User explicitly enables Notification Listener | Premium | Disable filter; no hidden workaround |
| Web filtering | Supported user-authorized DNS/VPN/browser integration | Premium | Disable; do not intercept TLS |
| Social filtering | Supported app/category-level controls | Premium | Unsupported content disclaimer |
| Screen mirroring | Child approval + OS MediaProjection prompt + foreground service | Premium | Deny/stop; no capture |
| Live camera | Child approval + camera runtime permission + foreground service | Premium | Deny/stop; no capture |
| Live audio | Child approval + microphone runtime permission + foreground service | Premium | Deny/stop; no capture |

Never claim that purchase replaces permissions or child approval. Permission revocation must immediately terminate related capture.
