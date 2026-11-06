# Environment Configuration

## Variables

DATABASE_URL, API_BASE_URL, JWT_ISSUER, JWT_AUDIENCE, OIDC_JWKS_URL, FCM_PROJECT_ID, GOOGLE_PLAY_PACKAGE_PARENT, GOOGLE_PLAY_SUBSCRIPTION_ID, MAPS_API_KEY, SESSION_SIGNING_KEY, LOG_LEVEL.

## Environments

Local uses synthetic data; staging uses test billing and test push; production credentials only through secret manager and human-approved deployment.

## Rules

Fail startup if required secrets missing; validate configuration; do not log secrets; rotate on incident.
