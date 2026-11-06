# Authentication Design

## Parent

OIDC-compatible login, PKCE for Android, secure token storage, refresh rotation and logout/revocation. Co-guardian invitations require verification and scoped role.

## Child

Single-use short-lived pairing code plus device-generated key; server binds device to child and guardian; re-enrollment requires guardian authorization.

## Authorization

Every endpoint checks role, family membership, child scope, entitlement and per-action consent where applicable. No trusting `isPremium` from mobile.

## Recovery

Account recovery uses verified identity, revokes old tokens, notifies other guardians, and requires re-confirmation of sensitive permissions.
