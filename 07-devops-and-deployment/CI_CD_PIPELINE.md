# CI/CD Pipeline

## Pull request

Typecheck/lint/test backend, validate OpenAPI and JSON catalog, Android lint/unit tests after Gradle scaffolds exist, SAST/dependency scan, secret scan.

## Staging

Deploy backend after review; build unsigned Android test APKs; run API contract and E2E smoke tests.

## Production

Manual approval, signed AAB from secure keystore, rollback plan, Play review and privacy compliance checklist.

## Included sample

`.github/workflows/validate-specs.yml` validates JSON and source references. Agents must extend to actual application build jobs.
