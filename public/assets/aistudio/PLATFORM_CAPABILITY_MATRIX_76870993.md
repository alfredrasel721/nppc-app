# Android Capability Matrix — hypotheses to verify on real devices

| Feature | Tier | Android mechanism / dependency | App | Availability | Confidence |
|---|---|---|---|---|---|
| Family/pairing | FREE | standard auth, QR/code | both | Yes | High |
| App usage reports | FREE | UsageStats user-granted access | child | Depends | Medium |
| Daily/per-app limits | FREE | usage access plus supported enforcement | child | Depends | Medium |
| Device-wide lock | FREE | consumer device vs managed device limitations | child | No universal guarantee | Low |
| App install approval | FREE | Google Play/managed-device dependent | child | Depends | Low |
| Location/geofences | FREE | runtime/background location policy | child | Depends | Medium |
| SOS/chat/tasks | FREE | notifications/network | both | Yes | High |
| Browser/search/YouTube activity | FREE | browser integration/provider APIs | child | Not universal | Low |
| Call/SMS controls | FREE | restricted permissions and store policy | child | May be disallowed | Low |
| Wearable integration | FREE | device vendor SDK/API | optional | Depends | Low |
| Screen mirroring | PREMIUM | MediaProjection + per-session OS consent | child | User-approved session only | Medium |
| Live camera | PREMIUM | camera runtime permission + foreground service + child accept | child | User-approved session only | Medium |
| Live audio | PREMIUM | microphone runtime permission + foreground service + child accept | child | User-approved session only | Medium |
| Notification filter | PREMIUM | NotificationListenerService explicit grant | child | Limited scope | Medium |
| Web filter | PREMIUM | approved DNS/VPN/browser policy, no MITM | child | Depends on browser/app | Medium |
| Social content filter | PREMIUM | app/category policy; E2EE messages inaccessible | child | Not universal | Low |

**IMPORTANT:** This is a planning matrix, not a verified compatibility claim. Agents must record device/OS/OEM/policy evidence and update each row.
