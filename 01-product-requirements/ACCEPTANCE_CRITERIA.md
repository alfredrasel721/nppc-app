# Acceptance Criteria

## Family and pairing

Only verified family owner can pair; code expires after 10 minutes; one-time use; child sees family and can confirm; duplicate/replayed codes rejected.

## Free restrictions

Authorized parent sets limit; child receives versioned rule; status remains pending until ack; emergency allowlist persists; free use unaffected by subscription state.

## Premium filter

No subscription → denied with upgrade explanation; subscription active + permissions granted → rule applies only within supported scope; expired → safely disabled, with child informed.

## Live monitoring

Requires Premium, linked family, child approval for this request, OS capture permission, active foreground indicator; child stop ends stream within target 2 seconds; no background restart; unauthorized or expired requests rejected.

## Location and SOS

Child sees location permission; parent sees last update; SOS attempts push and fallback, with visible sent/pending/failure states.

## Privacy

Export/delete verified guardian data; support cannot view content; audit contains actor, timestamp, action and result but no raw sensitive media.
