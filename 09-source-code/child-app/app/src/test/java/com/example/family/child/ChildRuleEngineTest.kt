package com.example.family.child

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ChildRuleEngineTest {

    @Test
    fun `emergency dialer and companion app are never blocked`() {
        assertFalse(ChildSafetyInvariants.canBlockPackage("com.android.dialer", emptySet()))
        assertFalse(ChildSafetyInvariants.canBlockPackage("com.example.family.child", emptySet()))
        assertTrue(ChildSafetyInvariants.canBlockPackage("com.game.blockblaster", emptySet()))
    }

    @Test
    fun `live capture requires all four conditions simultaneously`() {
        // Missing child acceptance -> denied
        assertFalse(
            ChildSafetyInvariants.canStartLiveCapture(
                premiumEntitled = true,
                childExplicitlyAcceptedThisRequest = false,
                osPermissionGrantedForSession = true,
                foregroundNotificationActive = true
            )
        )
        // Missing OS permission -> denied
        assertFalse(
            ChildSafetyInvariants.canStartLiveCapture(
                premiumEntitled = true,
                childExplicitlyAcceptedThisRequest = true,
                osPermissionGrantedForSession = false,
                foregroundNotificationActive = true
            )
        )
        // All four satisfied -> allowed
        assertTrue(
            ChildSafetyInvariants.canStartLiveCapture(
                premiumEntitled = true,
                childExplicitlyAcceptedThisRequest = true,
                osPermissionGrantedForSession = true,
                foregroundNotificationActive = true
            )
        )
    }
}
