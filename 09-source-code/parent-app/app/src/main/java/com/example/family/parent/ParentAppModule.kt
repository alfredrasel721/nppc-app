package com.example.family.parent

/**
 * Parent Android Application (`com.example.family.parent`)
 * Implements screens P-01 through P-20 per 02-ui-ux-design/SCREEN_INVENTORY.md.
 *
 * Non-negotiable product rules:
 * - Separate installable APK/AAB from Child App.
 * - Owns family account, pairing code generation, Free rules, reports, Play Billing,
 *   and Premium filter/live-session requests.
 * - Never displays a rule as APPLIED until the child device acknowledges the revision.
 * - Never trusts a local client-only Premium flag; server verification is authoritative.
 */

enum class ParentTab(val route: String, val label: String) {
    HOME("home", "Home"),
    RULES("rules", "Rules"),
    LOCATION("location", "Location"),
    REQUESTS("requests", "Requests"),
    FAMILY("family", "Family")
}

enum class PremiumFeatureFamily {
    SCREEN_MIRRORING,
    LIVE_CAMERA,
    LIVE_AUDIO,
    NOTIFICATION_FILTER,
    WEB_FILTER,
    SOCIAL_MEDIA_FILTER
}

data class ParentRuleDisplayCardState(
    val ruleId: String,
    val type: String,
    val tier: String,
    val revision: Int,
    val status: String, // PENDING, APPLIED, PARTIAL, FAILED, UNSUPPORTED, PERMISSION_MISSING, DISABLED
    val lastAckTimestampUtc: String?
) {
    val isConfirmedEnforced: Boolean
        get() = status == "APPLIED" && lastAckTimestampUtc != null
}
