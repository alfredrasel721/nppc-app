# Database Design

## Entities

users(id, role, auth_subject); families(id, owner_id); family_members(family_id,user_id,role,scope); children(id,family_id,display_name); devices(id,child_id,platform,os_version,public_key,status,last_seen); pairing_codes(code_hash,expires_at,consumed_at); rules(id,child_id,type,payload,version,state); rule_acks(rule_id,device_id,version,result); usage_daily(child_id,device_id,day,app_package,seconds); locations(child_id,lat,lon,recorded_at); geofences; alerts; requests; guardian_decisions; consents; sessions; subscriptions; entitlement_events; audit_events; deletion_requests.

## Constraints

Foreign keys, unique active device enrollment, owner-only family edits, version monotonicity, idempotent alerts and rule updates, indexed child/time lookups. Location/history TTL policy. No raw screen/camera/audio media table by default.

## Migration

Use Prisma migrations with review; production migration rollback/backup documented; test seed data must be synthetic.
