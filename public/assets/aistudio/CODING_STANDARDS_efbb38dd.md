# Coding Standards

## Android

Kotlin, Jetpack Compose, coroutines/Flow, MVVM/unidirectional state, DI with Hilt, Room for bounded offline cache, WorkManager for deferrable sync. Separate Gradle app modules and package IDs. Avoid deprecated APIs.

## Backend

TypeScript strict mode, Fastify, OpenAPI-first validation, Prisma/PostgreSQL, zod schemas, transactional writes, idempotency keys, typed error envelope.

## Quality

No `any` or unchecked exceptions in security paths; lint/format/test per change; structured privacy-safe logging; feature flags default off for sensitive features; dependency lockfiles and supply-chain checks.

## Naming

FR-<AREA>-NNN requirement IDs, TC-<AREA>-NNN tests; REST paths versioned `/v1`; snake_case database columns; camelCase JSON fields; UTC timestamps.
