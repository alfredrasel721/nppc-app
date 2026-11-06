/**
 * Shared deterministic contracts, rule engine, billing state machine,
 * and visible child-approved live session protocol.
 * Strictly follows 03-technical-architecture/ specifications.
 */

export type Tier = 'FREE' | 'PREMIUM';

export type UserRole = 'PARENT' | 'GUARDIAN' | 'CHILD_DEVICE' | 'SUPPORT';

export type GuardianPermissionScope =
  | 'FULL_CO_GUARDIAN'
  | 'READ_ONLY'
  | 'TEMPORARY_CAREGIVER'
  | 'LOCATION_ONLY';

export type RuleType =
  | 'TIME_LIMIT'
  | 'APP_LIMIT'
  | 'DOWNTIME'
  | 'ESSENTIAL_ALLOWLIST'
  | 'EXCEPTION'
  | 'SCHOOL_FOCUS'
  | 'WEB_FILTER'
  | 'SOCIAL_FILTER'
  | 'NOTIFICATION_FILTER';

export const PREMIUM_RULE_TYPES: ReadonlySet<RuleType> = new Set<RuleType>([
  'WEB_FILTER',
  'SOCIAL_FILTER',
  'NOTIFICATION_FILTER',
]);

export const FREE_RULE_TYPES: ReadonlySet<RuleType> = new Set<RuleType>([
  'TIME_LIMIT',
  'APP_LIMIT',
  'DOWNTIME',
  'ESSENTIAL_ALLOWLIST',
  'EXCEPTION',
  'SCHOOL_FOCUS',
]);

export type RuleState =
  | 'DRAFT'
  | 'PENDING'
  | 'APPLIED'
  | 'PARTIAL'
  | 'FAILED'
  | 'UNSUPPORTED'
  | 'PERMISSION_MISSING'
  | 'EXPIRED'
  | 'DISABLED';

export type EntitlementState =
  | 'FREE'
  | 'PENDING_VERIFICATION'
  | 'PREMIUM_ACTIVE'
  | 'PREMIUM_GRACE_VERIFIED'
  | 'EXPIRED'
  | 'CANCELLED_AT_PERIOD_END'
  | 'REFUNDED'
  | 'REVOKED'
  | 'ERROR';

export type LiveSessionMode = 'SCREEN' | 'CAMERA' | 'MICROPHONE';

export type LiveSessionState =
  | 'REQUESTED'
  | 'NOTIFIED'
  | 'CHILD_ACCEPTED'
  | 'OS_PERMISSION_PENDING'
  | 'ACTIVE'
  | 'STOPPED'
  | 'EXPIRED'
  | 'DISCONNECTED'
  | 'DECLINED'
  | 'REJECTED';

export interface DeviceCapabilities {
  usageAccessGranted: boolean;
  locationPermissionGranted: boolean;
  notificationListenerGranted: boolean;
  vpnOrDnsFilterSupported: boolean;
  mediaProjectionAvailable: boolean;
  cameraPermissionGranted: boolean;
  microphonePermissionGranted: boolean;
  isOffline: boolean;
  batteryPercent: number;
  osVersion: string;
  oem: string;
}

export interface RuleEnvelope {
  id: string;
  childId: string;
  deviceId?: string;
  type: RuleType;
  schemaVersion: number;
  revision: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  scheduleTimezone: string;
  payload: Record<string, unknown>;
  state: RuleState;
  lastAckAt?: string;
  lastAckDetail?: string;
  createdBy: string;
  createdAt: string;
}

export interface EvaluatedChildPolicy {
  childId: string;
  evaluatedAtUtc: string;
  dailyLimitMinutes: number | null;
  activeDowntimeWindow: { label: string; until: string } | null;
  blockedPackages: string[];
  essentialAllowedPackages: string[];
  activeExceptions: string[];
  activePremiumFilters: {
    webFilterActive: boolean;
    socialFilterActive: boolean;
    notificationFilterActive: boolean;
    suppressedNotificationCategories: string[];
    blockedDomains: string[];
    socialCategoriesRestricted: string[];
  };
  protectedSystemIndicatorsAlwaysAllowed: string[];
}

export const PROTECTED_EMERGENCY_AND_SYSTEM_PACKAGES = [
  'com.android.dialer',
  'com.google.android.dialer',
  'com.android.emergency',
  'com.android.settings',
  'com.example.family.child',
] as const;

export const PROTECTED_NOTIFICATION_CATEGORIES = [
  'EMERGENCY_ALERT',
  'OS_SECURITY_WARNING',
  'PERMISSION_INDICATOR',
  'LIVE_SESSION_FOREGROUND_INDICATOR',
  'SOS_STATUS',
] as const;

export function isPremiumEntitled(state: EntitlementState): boolean {
  return (
    state === 'PREMIUM_ACTIVE' ||
    state === 'PREMIUM_GRACE_VERIFIED' ||
    state === 'CANCELLED_AT_PERIOD_END'
  );
}

export function isRuleTypePremium(type: RuleType): boolean {
  return PREMIUM_RULE_TYPES.has(type);
}

/**
 * Deterministic Child Rule Engine per 03-technical-architecture/RULE_ENGINE_SPEC.md
 * Conflict Resolution Rules:
 * 1. Emergency/essential access overrides restrictive rules where OS allows.
 * 2. Child-approved/parent-granted temporary exceptions override ordinary app/time rules until expiry.
 * 3. More restrictive overlapping schedules apply; ties resolved by latest revision.
 * 4. Expired Premium entitlement removes only Premium rules, never Free rules.
 * 5. Unsupported/permission-missing controls report UNSUPPORTED/PERMISSION_MISSING, never APPLIED.
 */
export function evaluateChildRulesDeterministically(
  childId: string,
  rules: RuleEnvelope[],
  entitlementState: EntitlementState,
  capabilities: DeviceCapabilities,
  nowUtcIso: string = new Date().toISOString()
): {
  policy: EvaluatedChildPolicy;
  ruleResults: Array<{ ruleId: string; revision: number; status: RuleState; reason: string }>;
} {
  const nowMs = Date.parse(nowUtcIso);
  const premiumValid = isPremiumEntitled(entitlementState);

  const essentialAllowed = new Set<string>(PROTECTED_EMERGENCY_AND_SYSTEM_PACKAGES);
  const activeExceptionPackages = new Set<string>();
  let extraMinutesGranted = 0;

  // Sort by revision ascending so latest revision wins ties, except for daily limits where most restrictive wins
  const sortedRules = [...rules].sort((a, b) => a.revision - b.revision);
  const ruleResults: Array<{ ruleId: string; revision: number; status: RuleState; reason: string }> = [];

  // Pass 1: Collect essential allowlist & unexpired exceptions
  for (const rule of sortedRules) {
    if (rule.effectiveUntil && Date.parse(rule.effectiveUntil) < nowMs) {
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'EXPIRED',
        reason: 'Rule effectiveUntil window has passed',
      });
      continue;
    }

    if (rule.type === 'ESSENTIAL_ALLOWLIST') {
      const pkgs = Array.isArray(rule.payload.packages) ? (rule.payload.packages as string[]) : [];
      pkgs.forEach((p) => essentialAllowed.add(p));
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: 'Essential and emergency allowlist active',
      });
    } else if (rule.type === 'EXCEPTION') {
      const pkgs = Array.isArray(rule.payload.packages) ? (rule.payload.packages as string[]) : [];
      pkgs.forEach((p) => activeExceptionPackages.add(p));
      if (typeof rule.payload.extraMinutes === 'number') {
        extraMinutesGranted += rule.payload.extraMinutes;
      }
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: 'Temporary parent-approved exception active',
      });
    }
  }

  let dailyLimitMinutes: number | null = null;
  let activeDowntimeWindow: { label: string; until: string } | null = null;
  const blockedPackages = new Set<string>();
  let webFilterActive = false;
  let socialFilterActive = false;
  let notificationFilterActive = false;
  const suppressedNotificationCategories = new Set<string>();
  const blockedDomains = new Set<string>();
  const socialCategoriesRestricted = new Set<string>();

  // Pass 2: Evaluate Free and Premium rules
  for (const rule of sortedRules) {
    if (rule.type === 'ESSENTIAL_ALLOWLIST' || rule.type === 'EXCEPTION') continue;
    if (rule.effectiveUntil && Date.parse(rule.effectiveUntil) < nowMs) continue;

    // Check Premium entitlement boundary
    if (isRuleTypePremium(rule.type) && !premiumValid) {
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'DISABLED',
        reason: 'Premium entitlement inactive; Premium filter safely disabled while preserving Free rules',
      });
      continue;
    }

    if (rule.type === 'TIME_LIMIT') {
      if (!capabilities.usageAccessGranted) {
        ruleResults.push({
          ruleId: rule.id,
          revision: rule.revision,
          status: 'PERMISSION_MISSING',
          reason: 'Android Usage Access permission required',
        });
        continue;
      }
      const mins = typeof rule.payload.dailyMinutes === 'number' ? rule.payload.dailyMinutes : 120;
      const effectiveMins = mins + extraMinutesGranted;
      // More restrictive overlapping limit wins
      dailyLimitMinutes =
        dailyLimitMinutes === null ? effectiveMins : Math.min(dailyLimitMinutes, effectiveMins);
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: `Daily limit enforced (${dailyLimitMinutes} min including any granted exception)`,
      });
    } else if (rule.type === 'APP_LIMIT') {
      if (!capabilities.usageAccessGranted) {
        ruleResults.push({
          ruleId: rule.id,
          revision: rule.revision,
          status: 'PERMISSION_MISSING',
          reason: 'Android Usage Access permission required for app limits',
        });
        continue;
      }
      const pkgs = Array.isArray(rule.payload.blockedPackages)
        ? (rule.payload.blockedPackages as string[])
        : [];
      for (const pkg of pkgs) {
        // Conflict rules #1 & #2: Essential allowlist and active exceptions override ordinary app block
        if (!essentialAllowed.has(pkg) && !activeExceptionPackages.has(pkg)) {
          blockedPackages.add(pkg);
        }
      }
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: 'Ordinary app blocking applied (essential & exception apps preserved)',
      });
    } else if (rule.type === 'DOWNTIME' || rule.type === 'SCHOOL_FOCUS') {
      const label =
        typeof rule.payload.label === 'string'
          ? rule.payload.label
          : rule.type === 'SCHOOL_FOCUS'
          ? 'School Focus'
          : 'Bedtime / Downtime';
      const until = typeof rule.payload.until === 'string' ? rule.payload.until : '07:00';
      activeDowntimeWindow = { label, until };
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: `${label} schedule active until ${until}; emergency calling preserved`,
      });
    } else if (rule.type === 'WEB_FILTER') {
      if (!capabilities.vpnOrDnsFilterSupported) {
        ruleResults.push({
          ruleId: rule.id,
          revision: rule.revision,
          status: 'UNSUPPORTED',
          reason: 'Browser/DNS filter service unavailable on this device configuration',
        });
        continue;
      }
      webFilterActive = true;
      const domains = Array.isArray(rule.payload.blockedDomains)
        ? (rule.payload.blockedDomains as string[])
        : [];
      domains.forEach((d) => blockedDomains.add(d));
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason: 'Premium web domain/category filter applied (no TLS/MITM interception)',
      });
    } else if (rule.type === 'NOTIFICATION_FILTER') {
      if (!capabilities.notificationListenerGranted) {
        ruleResults.push({
          ruleId: rule.id,
          revision: rule.revision,
          status: 'PERMISSION_MISSING',
          reason: 'Opt-in Android NotificationListenerService permission not granted',
        });
        continue;
      }
      notificationFilterActive = true;
      const categories = Array.isArray(rule.payload.suppressedCategories)
        ? (rule.payload.suppressedCategories as string[])
        : [];
      for (const cat of categories) {
        // Never suppress emergency, OS security, permission, or live-session indicators
        if (
          !(PROTECTED_NOTIFICATION_CATEGORIES as readonly string[]).includes(cat.toUpperCase())
        ) {
          suppressedNotificationCategories.add(cat);
        }
      }
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'APPLIED',
        reason:
          'Premium notification filter applied; emergency, OS security & live-session indicators protected',
      });
    } else if (rule.type === 'SOCIAL_FILTER') {
      if (!capabilities.usageAccessGranted) {
        ruleResults.push({
          ruleId: rule.id,
          revision: rule.revision,
          status: 'PERMISSION_MISSING',
          reason: 'Usage Access required for supported social category restriction',
        });
        continue;
      }
      socialFilterActive = true;
      const cats = Array.isArray(rule.payload.restrictedCategories)
        ? (rule.payload.restrictedCategories as string[])
        : [];
      cats.forEach((c) => socialCategoriesRestricted.add(c));
      ruleResults.push({
        ruleId: rule.id,
        revision: rule.revision,
        status: 'PARTIAL',
        reason:
          'Premium social category/domain restriction applied; E2EE private in-app messages are not inspected',
      });
    }
  }

  return {
    policy: {
      childId,
      evaluatedAtUtc: nowUtcIso,
      dailyLimitMinutes,
      activeDowntimeWindow,
      blockedPackages: Array.from(blockedPackages),
      essentialAllowedPackages: Array.from(essentialAllowed),
      activeExceptions: Array.from(activeExceptionPackages),
      activePremiumFilters: {
        webFilterActive,
        socialFilterActive,
        notificationFilterActive,
        suppressedNotificationCategories: Array.from(suppressedNotificationCategories),
        blockedDomains: Array.from(blockedDomains),
        socialCategoriesRestricted: Array.from(socialCategoriesRestricted),
      },
      protectedSystemIndicatorsAlwaysAllowed: [...PROTECTED_NOTIFICATION_CATEGORIES],
    },
    ruleResults,
  };
}
