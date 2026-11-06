package com.example.family.child

/**
 * Child Android Application (`com.example.family.child`)
 * Implements screens C-01 through C-15 per 02-ui-ux-design/SCREEN_INVENTORY.md.
 *
 * Non-negotiable safety and privacy invariants:
 * 1. Visible app icon and transparent privacy dashboard (C-11) showing what is shared and when.
 * 2. Emergency calling and SOS (C-08) are always reachable even during bedtime/downtime lock.
 * 3. Every live screen, camera, or audio session requires per-session affirmative child approval (C-13),
 *    Android OS permission/MediaProjection consent, a persistent foreground notification (C-14),
 *    and an immediate child Stop button (< 2s termination).
 * 4. Notification filter never suppresses emergency, OS security, permission, or live-session indicators.
 */

enum class ChildTab(val route: String, val label: String) {
    TODAY("today", "Today"),
    REQUESTS("requests", "Requests"),
    SAFETY("safety", "Safety"),
    FAMILY("family", "Family"),
    PRIVACY("privacy", "Privacy")
}

object ChildSafetyInvariants {
    val ALWAYS_ALLOWED_EMERGENCY_PACKAGES = setOf(
        "com.android.dialer",
        "com.google.android.dialer",
        "com.android.emergency",
        "com.android.settings",
        "com.example.family.child"
    )

    val PROTECTED_NOTIFICATION_CATEGORIES = setOf(
        "EMERGENCY_ALERT",
        "OS_SECURITY_WARNING",
        "PERMISSION_INDICATOR",
        "LIVE_SESSION_FOREGROUND_INDICATOR",
        "SOS_STATUS"
    )

    fun canBlockPackage(packageName: String, activeExceptionPackages: Set<String>): Boolean {
        if (ALWAYS_ALLOWED_EMERGENCY_PACKAGES.contains(packageName)) return false
        if (activeExceptionPackages.contains(packageName)) return false
        return true
    }

    fun canStartLiveCapture(
        premiumEntitled: Boolean,
        childExplicitlyAcceptedThisRequest: Boolean,
        osPermissionGrantedForSession: Boolean,
        foregroundNotificationActive: Boolean
    ): Boolean {
        return premiumEntitled &&
            childExplicitlyAcceptedThisRequest &&
            osPermissionGrantedForSession &&
            foregroundNotificationActive
    }
}
