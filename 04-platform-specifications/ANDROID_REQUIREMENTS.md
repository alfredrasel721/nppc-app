# Android-Only Requirements

## Targets

Two separately installed Android apps, min SDK and target SDK selected by agent after current policy review and approved by human. Test Android 10–current where possible; support statement must match test evidence.

## Parent

Compose, Play Billing, FCM, role-bound authenticated API, account and privacy screens. No screen/camera/mic permissions needed on parent merely to view a child-approved stream.

## Child

Visible app with consent UI, Usage Access when necessary, location runtime permissions, foreground services for permitted functions, local rule engine, OS notification and media projection permission flows.

## Constraints

Consumer Android cannot guarantee arbitrary device lock, uninstall resistance, universal app installation approval, encrypted social content reading or uninterrupted background location. Device-owner APIs require legitimate managed enrollment and cannot be silently assumed.

## Policy

Check current Play policies for Families, Accessibility, device admin, background location, notification access, foreground service, SMS/call log, user data, and media projection before implementation. Avoid sideloading or hidden permissions to bypass policy.

## Fail-safe

Preserve emergency calling and SOS wherever technically possible; permission denial and unsupported device must degrade honestly.
