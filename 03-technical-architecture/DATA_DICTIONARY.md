# Data Dictionary

## Identity

user_id UUID pseudonymous, role enum parent/child/guardian/support; no child email required.

## Rules

type enum TIME_LIMIT, APP_LIMIT, DOWNTIME, WEB_FILTER, SOCIAL_FILTER, NOTIFICATION_FILTER; payload JSON validated by versioned schema; Premium types checked on write and apply.

## Events

actor_id, family_id, child_id, action, result, timestamp, correlation_id; never log media payloads, message bodies or precise location by default.

## Location

lat/lon numeric with recorded_at and source accuracy; precise location access limited to linked guardians and SOS escalation; retention configurable.

## Billing

purchase_token encrypted, product_id, entitlement_state, expires_at, verification_time; no card details stored.
