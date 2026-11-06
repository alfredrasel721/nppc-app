# Android Module Boundaries

## Parent independent application
`parent-app/app`, `parent-app/core/network`, `parent-app/core/auth`, `parent-app/core/design`, `parent-app/feature/family`, `pairing`, `dashboard`, `rules`, `location`, `sos`, `reports`, `requests`, `billing`, `premium`, `privacy`.

## Child independent application
`child-app/app`, `child-app/core/auth`, `child-app/core/design`, `child-app/core/storage`, `child-app/core/sync`, `child-app/core/rules`, `child-app/core/permissions`, `child-app/feature/onboarding`, `today`, `requests`, `safety`, `chat`, `privacy`, `premium-filters`, `live-session`.

## Shared code
Only reusable models/contracts and UI tokens, **not** a shared installable APK or shared application ID. Keep role credentials separate. No Parent app background service should run on Child device or vice versa.

## Deliverables
Distinct Android Gradle projects, package IDs, launchers, manifests, store disclosures, unit tests, instrumentation tests, app bundles and signing configurations. Agent must choose and pin min/target SDK versions after checking current Android and Play requirements.
