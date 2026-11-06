# Approved Tech Stack — Provisional

## Android

Kotlin, Jetpack Compose, Hilt, Room, WorkManager, Retrofit/OkHttp, coroutines/Flow, AndroidX Security where appropriate; independent `com.example.family.parent` and `com.example.family.child` placeholders until final naming approved.

## Backend

Node.js LTS, TypeScript strict, Fastify, Prisma, PostgreSQL, Redis only if required for queues, OpenAPI 3.1, Firebase Cloud Messaging, object storage only with explicit retention rules.

## Operations

Docker Compose for local services, GitHub Actions for lint/test/build, secrets from CI/secret manager. Internal admin: Next.js only if approved, private access.

## Payments

Google Play Billing in Parent Android; verify purchase tokens via server-side Google Play Developer API; never trust client-only premium flags.

## Architecture decision

No third-party analytics SDK by default in child app; use privacy-preserving operational metrics. Library versions must be pinned after compatibility/security check.
