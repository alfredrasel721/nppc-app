# Integration Specifications

## FCM

Push payload carries opaque event ID; app fetches authenticated details; retries and deduplicates; never put child location/media in push body.

## Maps

Map SDK and geofence adapter selected after pricing/privacy review; location permission needed; show stale/accuracy states.

## Google Play

Purchase flow Parent app; backend validates and processes renewal/cancel/refund events; entitlement changes propagated to child.

## Android APIs

UsageStatsManager, DevicePolicyManager where legitimately enrolled, NotificationListenerService opt-in, MediaProjection consent, camera/mic foreground services and permission checks. Capability matrix determines actual availability.

## Optional

Wearables and school systems are deferred adapter integrations; no unapproved third-party child-data transfers.
