/**
 * Background Workers (`09-source-code/background-workers/src/workers.ts`)
 * Implements idempotent alert delivery, retention TTL cleanup (05-security-and-privacy/DATA_RETENTION_POLICY.md),
 * and subscription entitlement reconciliation.
 */

export interface RetentionPolicyDefaults {
  usageAggregatesDays: number;
  detailedLocationsDays: number;
  sosEventsDays: number;
  pairingCodesMinutes: number;
  liveSessionMetadataDays: number;
  ruleHistoryDays: number;
  supportLogsDays: number;
  storeRawLiveMedia: false;
  storeNotificationBodies: false;
}

export const PROVISIONAL_RETENTION_DEFAULTS: RetentionPolicyDefaults = {
  usageAggregatesDays: 90,
  detailedLocationsDays: 30,
  sosEventsDays: 90,
  pairingCodesMinutes: 10,
  liveSessionMetadataDays: 30,
  ruleHistoryDays: 90,
  supportLogsDays: 30,
  storeRawLiveMedia: false,
  storeNotificationBodies: false,
};
