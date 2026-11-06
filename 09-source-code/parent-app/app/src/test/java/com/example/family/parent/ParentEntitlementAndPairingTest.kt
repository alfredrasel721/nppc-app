package com.example.family.parent

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ParentEntitlementAndPairingTest {

    @Test
    fun `rule status is never shown as enforced before child device acknowledgement`() {
        val pendingRule = ParentRuleDisplayCardState(
            ruleId = "rule-1",
            type = "TIME_LIMIT",
            tier = "FREE",
            revision = 3,
            status = "PENDING",
            lastAckTimestampUtc = null
        )
        assertFalse(pendingRule.isConfirmedEnforced)

        val ackedRule = pendingRule.copy(
            status = "APPLIED",
            lastAckTimestampUtc = "2026-11-06T12:00:00Z"
        )
        assertTrue(ackedRule.isConfirmedEnforced)
    }

    @Test
    fun `exactly six premium feature families exist`() {
        assertEquals(6, PremiumFeatureFamily.values().size)
    }
}
