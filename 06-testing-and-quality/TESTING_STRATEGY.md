# Testing Strategy

## Pyramid

Kotlin unit tests for rules and state machines, backend unit/integration tests, API contract tests, device UI tests, full parent-child E2E with physical devices.

## Critical dimensions

FREE/PREMIUM entitlements, child consent/decline, permission denial/revocation, offline and sync, role isolation, emergency during lock, billing refund, OS/OEM compatibility, privacy.

## Automation

CI runs static analysis and tests on every PR; nightly emulator matrix; real-device tests required before sensitive feature release.

## No false completion

Document unrun tests and blockers; no feature marked done merely for successful compilation.
