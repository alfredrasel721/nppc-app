# Autonomous Workflow

## Sequence

Read inputs → capability/policy spike → tasks and dependencies → parent/child UI → backend contracts → local enforcement → integration → privacy/security → tests → staging → human release gate.

## Roles

Orchestrator, requirements, Android parent, Android child, backend, data, privacy/security, QA, DevOps, documentation. Parallel work only across explicit file ownership boundaries.

## Evidence

For each task record branch/commit, requirement IDs, tests run/results, device/Android versions, screenshots when safe, known limitations and reviewer. Failed tests or absent devices = BLOCKED, not DONE.

## Escalation

Pause for human review on unsafe monitoring, store-policy uncertainty, data collection expansion, billing, or device-owner requirements.
