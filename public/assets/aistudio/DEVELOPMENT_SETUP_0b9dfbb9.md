# Development Setup

## Prerequisites

Android Studio, Android SDK/Gradle, JDK supported by selected Android Gradle Plugin, Node.js LTS, pnpm, Docker and PostgreSQL. Pin versions after compatibility review.

## Local sequence

Copy `.env.example` to `.env` outside source control → start PostgreSQL via `docker-compose.yml` → install backend deps → migrate schema → start API → run Android parent and child on separate emulators/devices → configure FCM test project.

## Credentials

Never commit Play service credentials, Firebase service account keys, signing keys, or child production data. Use fake test accounts and synthetic data.

## Reality

Source folders are starter boundaries and sample contracts, not compiled applications. Agents must create actual Gradle/Node projects and implement requirements.
