# Integration Tests

## Flows

Parent API → DB → FCM → child fetch → rule ack; purchase token verification → entitlement event → filter disable; SOS → parent/trusted contact dispatch; export/delete pipeline.

## Faults

DB outage, duplicate push, delayed sync, expired JWT, offline child, refund webhook duplication, missing location permission.

## Security

Cross-family IDs, stolen device tokens, child role calling parent endpoint, replayed session approval.
