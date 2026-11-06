import crypto from 'crypto';
import {
  DeviceCapabilities,
  EntitlementState,
  EvaluatedChildPolicy,
  GuardianPermissionScope,
  LiveSessionMode,
  LiveSessionState,
  RuleEnvelope,
  RuleState,
  RuleType,
  UserRole,
  evaluateChildRulesDeterministically,
  isPremiumEntitled,
  isRuleTypePremium,
} from '../../shared-packages/src/index.ts';

export interface AuthContext {
  actorId: string;
  role: UserRole;
  familyId?: string;
  deviceId?: string;
  childId?: string;
  guardianScope?: GuardianPermissionScope;
}

export interface FamilyRecord {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  entitlementState: EntitlementState;
  subscriptionProductId: string | null;
  subscriptionExpiresAt: string | null;
  featureFlags: {
    enableLiveScreen: boolean;
    enableLiveCamera: boolean;
    enableLiveMicrophone: boolean;
    enableNotificationFilter: boolean;
    enableWebFilter: boolean;
    enableSocialFilter: boolean;
  };
}

export interface GuardianMemberRecord {
  id: string;
  familyId: string;
  userId: string;
  displayName: string;
  role: 'OWNER' | 'CO_GUARDIAN';
  scope: GuardianPermissionScope;
  assignedChildIds: string[];
  createdAt: string;
}

export interface ChildRecord {
  id: string;
  familyId: string;
  displayName: string;
  ageGroup: string;
  freeTimePausedByChild: boolean;
  rewardMinutesBalance: number;
  createdAt: string;
}

export interface DeviceRecord {
  id: string;
  childId: string;
  familyId: string;
  deviceName: string;
  appPackageId: 'com.example.family.child';
  publicKey: string;
  capabilities: DeviceCapabilities;
  appliedRuleRevision: number;
  lastSeenAt: string;
}

export interface PairingCodeRecord {
  code: string;
  codeHash: string;
  familyId: string;
  childId: string;
  createdBy: string;
  expiresAt: string;
  consumedAt: string | null;
  deviceId: string | null;
}

export interface ExceptionRequestRecord {
  id: string;
  familyId: string;
  childId: string;
  requestType: 'EXTRA_TIME' | 'APP_ACCESS' | 'SCHEDULE_EXCEPTION';
  requestedMinutes?: number;
  targetPackage?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface SosAlertRecord {
  id: string;
  idempotencyKey: string;
  familyId: string;
  childId: string;
  lat: number;
  lon: number;
  batteryPercent: number;
  deliveryStatus: 'SENT_PUSH' | 'FALLBACK_ESCALATED' | 'ACKNOWLEDGED';
  acknowledgedBy?: string;
  emergencyShareLinkExpiresAt: string;
  triggeredDuringDowntime: boolean;
  createdAt: string;
}

export interface LocationPointRecord {
  id: string;
  childId: string;
  lat: number;
  lon: number;
  accuracyMeters: number;
  placeLabel: string;
  recordedAt: string;
}

export interface GeofenceRecord {
  id: string;
  familyId: string;
  childId: string;
  name: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
}

export interface TaskRewardRecord {
  id: string;
  familyId: string;
  childId: string;
  title: string;
  rewardMinutes: number;
  status: 'ASSIGNED' | 'SUBMITTED_BY_CHILD' | 'APPROVED_BY_PARENT';
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  familyId: string;
  childId: string;
  senderRole: 'PARENT' | 'CHILD' | 'CO_GUARDIAN';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface LiveSessionRecord {
  id: string;
  familyId: string;
  childId: string;
  deviceId: string;
  requestedBy: string;
  guardianName: string;
  mode: LiveSessionMode;
  durationSeconds: number;
  state: LiveSessionState;
  decisionExpiresAt: string;
  osConsentGranted: boolean;
  foregroundIndicatorVisible: boolean;
  sessionToken: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  stopReason: string | null;
  createdAt: string;
}

export interface AuditEventRecord {
  eventId: string;
  eventType: string;
  timestamp: string;
  familyId: string;
  actorId: string;
  childId?: string;
  correlationId: string;
  result: string;
  metadata: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ParentalControlBackendService {
  private families = new Map<string, FamilyRecord>();
  private guardians = new Map<string, GuardianMemberRecord[]>();
  private children = new Map<string, ChildRecord>();
  private devices = new Map<string, DeviceRecord>();
  private pairingCodes = new Map<string, PairingCodeRecord>();
  private rules = new Map<string, RuleEnvelope[]>();
  private requests = new Map<string, ExceptionRequestRecord>();
  private sosAlerts = new Map<string, SosAlertRecord>();
  private locations = new Map<string, LocationPointRecord[]>();
  private geofences = new Map<string, GeofenceRecord[]>();
  private tasks = new Map<string, TaskRewardRecord[]>();
  private chatMessages = new Map<string, ChatMessageRecord[]>();
  private liveSessions = new Map<string, LiveSessionRecord>();
  private verifiedPurchaseTokens = new Map<string, { familyId: string; state: EntitlementState }>();
  private auditLog: AuditEventRecord[] = [];
  private emergencyContacts = new Map<
    string,
    Array<{ id: string; name: string; relation: string; phone: string; verified: boolean }>
  >();
  private globalPremiumKillSwitch = false;

  constructor() {
    this.seedSyntheticDevelopmentFamily();
  }

  public seedSyntheticDevelopmentFamily(): void {
    const familyId = '11111111-1111-4111-8111-111111111111';
    const parentId = '22222222-2222-4222-8222-222222222222';
    const coGuardianId = '33333333-3333-4333-8333-333333333333';
    const childId = '44444444-4444-4444-8444-444444444444';
    const deviceId = '55555555-5555-4555-8555-555555555555';
    const now = new Date().toISOString();

    this.families.set(familyId, {
      id: familyId,
      name: 'Rivera Household (Synthetic Dev)',
      ownerId: parentId,
      createdAt: now,
      entitlementState: 'FREE',
      subscriptionProductId: null,
      subscriptionExpiresAt: null,
      featureFlags: {
        // Per AGENTS.md: Sensitive features ship behind default-off flags until explicitly enabled
        enableLiveScreen: false,
        enableLiveCamera: false,
        enableLiveMicrophone: false,
        enableNotificationFilter: true,
        enableWebFilter: true,
        enableSocialFilter: true,
      },
    });

    this.guardians.set(familyId, [
      {
        id: 'g-owner-1',
        familyId,
        userId: parentId,
        displayName: 'Elena Rivera (Primary Parent)',
        role: 'OWNER',
        scope: 'FULL_CO_GUARDIAN',
        assignedChildIds: [childId],
        createdAt: now,
      },
      {
        id: 'g-co-2',
        familyId,
        userId: coGuardianId,
        displayName: 'Marco Rivera (Co-Guardian)',
        role: 'CO_GUARDIAN',
        scope: 'FULL_CO_GUARDIAN',
        assignedChildIds: [childId],
        createdAt: now,
      },
    ]);

    this.children.set(childId, {
      id: childId,
      familyId,
      displayName: 'Leo Rivera',
      ageGroup: '10-12',
      freeTimePausedByChild: false,
      rewardMinutesBalance: 15,
      createdAt: now,
    });

    this.devices.set(deviceId, {
      id: deviceId,
      childId,
      familyId,
      deviceName: 'Pixel 8a (Android 15)',
      appPackageId: 'com.example.family.child',
      publicKey: 'ed25519-synthetic-child-device-key-01',
      capabilities: {
        usageAccessGranted: true,
        locationPermissionGranted: true,
        notificationListenerGranted: true,
        vpnOrDnsFilterSupported: true,
        mediaProjectionAvailable: true,
        cameraPermissionGranted: true,
        microphonePermissionGranted: true,
        isOffline: false,
        batteryPercent: 84,
        osVersion: 'Android 15 (API 35)',
        oem: 'Google Pixel',
      },
      appliedRuleRevision: 2,
      lastSeenAt: now,
    });

    this.rules.set(childId, [
      {
        id: 'rule-free-time-1',
        childId,
        deviceId,
        type: 'TIME_LIMIT',
        schemaVersion: 1,
        revision: 1,
        effectiveFrom: now,
        scheduleTimezone: 'America/Los_Angeles',
        payload: { dailyMinutes: 120, usedMinutesToday: 68 },
        state: 'APPLIED',
        lastAckAt: now,
        lastAckDetail: 'Enforced by Child UsageStats & local rule engine (rev 1)',
        createdBy: parentId,
        createdAt: now,
      },
      {
        id: 'rule-free-app-2',
        childId,
        deviceId,
        type: 'APP_LIMIT',
        schemaVersion: 1,
        revision: 2,
        effectiveFrom: now,
        scheduleTimezone: 'America/Los_Angeles',
        payload: {
          blockedPackages: ['com.game.blockblaster', 'com.video.shortclips'],
          perAppLimitsMinutes: { 'com.game.pixelcraft': 45 },
        },
        state: 'APPLIED',
        lastAckAt: now,
        lastAckDetail: 'Ordinary app block enforced on device (rev 2)',
        createdBy: parentId,
        createdAt: now,
      },
      {
        id: 'rule-free-downtime-3',
        childId,
        deviceId,
        type: 'DOWNTIME',
        schemaVersion: 1,
        revision: 2,
        effectiveFrom: now,
        scheduleTimezone: 'America/Los_Angeles',
        payload: { label: 'School Night Bedtime', start: '21:00', until: '07:00' },
        state: 'APPLIED',
        lastAckAt: now,
        lastAckDetail: 'Bedtime schedule registered; emergency dialer always allowed',
        createdBy: parentId,
        createdAt: now,
      },
    ]);

    this.locations.set(childId, [
      {
        id: 'loc-1',
        childId,
        lat: 37.422065,
        lon: -122.084089,
        accuracyMeters: 8,
        placeLabel: 'Oakridge Middle School (Safe Zone)',
        recordedAt: now,
      },
    ]);

    this.geofences.set(childId, [
      {
        id: 'geo-1',
        familyId,
        childId,
        name: 'Oakridge Middle School',
        lat: 37.422065,
        lon: -122.084089,
        radiusMeters: 250,
        notifyOnEnter: true,
        notifyOnExit: true,
      },
      {
        id: 'geo-2',
        familyId,
        childId,
        name: 'Rivera Home',
        lat: 37.42812,
        lon: -122.0914,
        radiusMeters: 150,
        notifyOnEnter: true,
        notifyOnExit: true,
      },
    ]);

    this.tasks.set(childId, [
      {
        id: 'task-1',
        familyId,
        childId,
        title: 'Complete 20 mins of math practice',
        rewardMinutes: 15,
        status: 'APPROVED_BY_PARENT',
        createdAt: now,
      },
      {
        id: 'task-2',
        familyId,
        childId,
        title: 'Pack backpack for tomorrow',
        rewardMinutes: 10,
        status: 'ASSIGNED',
        createdAt: now,
      },
    ]);

    this.chatMessages.set(childId, [
      {
        id: 'msg-1',
        familyId,
        childId,
        senderRole: 'PARENT',
        senderName: 'Elena (Mom)',
        text: 'Hi Leo! Let me know when soccer practice wraps up.',
        createdAt: now,
      },
      {
        id: 'msg-2',
        familyId,
        childId,
        senderRole: 'CHILD',
        senderName: 'Leo',
        text: 'Coach said we finish at 4:30 PM. Can I have 15 extra mins on PixelCraft later?',
        createdAt: now,
      },
    ]);

    this.emergencyContacts.set(familyId, [
      {
        id: 'ec-1',
        name: 'Elena Rivera (Mom)',
        relation: 'Primary Guardian',
        phone: '+1-555-0101',
        verified: true,
      },
      {
        id: 'ec-2',
        name: 'Marco Rivera (Dad)',
        relation: 'Co-Guardian',
        phone: '+1-555-0102',
        verified: true,
      },
      {
        id: 'ec-3',
        name: 'Grandma Rosa',
        relation: 'Trusted Emergency Contact',
        phone: '+1-555-0199',
        verified: true,
      },
    ]);

    this.recordAudit(familyId, parentId, 'SEED_DEV_ENVIRONMENT', 'SUCCESS', childId, {
      note: 'Initialized synthetic development household per 07-devops-and-deployment/DEVELOPMENT_SETUP.md',
    });
  }

  private recordAudit(
    familyId: string,
    actorId: string,
    eventType: string,
    result: string,
    childId?: string,
    metadata: Record<string, unknown> = {}
  ): AuditEventRecord {
    // Privacy invariant: Never log raw media payloads, message bodies, or notification bodies
    const safeMetadata = { ...metadata };
    delete safeMetadata.rawMedia;
    delete safeMetadata.notificationBody;
    delete safeMetadata.privateMessageBody;

    const entry: AuditEventRecord = {
      eventId: crypto.randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      familyId,
      actorId,
      childId,
      correlationId: crypto.randomUUID(),
      result,
      metadata: safeMetadata,
    };
    this.auditLog.unshift(entry);
    return entry;
  }

  private assertGuardianAccess(
    auth: AuthContext,
    familyId: string,
    requireWrite: boolean = false,
    requireOwner: boolean = false
  ): FamilyRecord {
    if (!auth || !auth.actorId) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Missing authentication credentials');
    }
    const family = this.families.get(familyId);
    if (!family) {
      throw new ApiError(404, 'FAMILY_NOT_FOUND', 'Family not found');
    }
    if (auth.role !== 'PARENT' && auth.role !== 'GUARDIAN') {
      throw new ApiError(403, 'FORBIDDEN_ROLE', 'Caller role is not a parent or guardian');
    }
    if (auth.familyId !== familyId) {
      throw new ApiError(
        403,
        'CROSS_FAMILY_DENIED',
        'Cross-family access is strictly forbidden (TC-AUTH-001)'
      );
    }
    if (requireOwner && family.ownerId !== auth.actorId) {
      throw new ApiError(
        403,
        'OWNER_REQUIRED',
        'Only the primary family owner can perform this action'
      );
    }
    if (
      requireWrite &&
      (auth.guardianScope === 'READ_ONLY' || auth.guardianScope === 'LOCATION_ONLY')
    ) {
      throw new ApiError(
        403,
        'INSUFFICIENT_GUARDIAN_SCOPE',
        `Guardian scope ${auth.guardianScope} cannot modify rules or approvals`
      );
    }
    return family;
  }

  public createFamily(auth: AuthContext, name: string): FamilyRecord {
    if (!auth || auth.role !== 'PARENT') {
      throw new ApiError(403, 'FORBIDDEN', 'Only an authenticated parent can create a family');
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const family: FamilyRecord = {
      id,
      name: name.trim() || 'Family Household',
      ownerId: auth.actorId,
      createdAt: now,
      entitlementState: 'FREE',
      subscriptionProductId: null,
      subscriptionExpiresAt: null,
      featureFlags: {
        enableLiveScreen: false,
        enableLiveCamera: false,
        enableLiveMicrophone: false,
        enableNotificationFilter: true,
        enableWebFilter: true,
        enableSocialFilter: true,
      },
    };
    this.families.set(id, family);
    this.guardians.set(id, [
      {
        id: crypto.randomUUID(),
        familyId: id,
        userId: auth.actorId,
        displayName: 'Primary Parent',
        role: 'OWNER',
        scope: 'FULL_CO_GUARDIAN',
        assignedChildIds: [],
        createdAt: now,
      },
    ]);
    this.recordAudit(id, auth.actorId, 'FAMILY_CREATED', 'SUCCESS');
    return family;
  }

  public createChild(
    auth: AuthContext,
    familyId: string,
    displayName: string,
    ageGroup: string = '10-12'
  ): ChildRecord {
    this.assertGuardianAccess(auth, familyId, true);
    const id = crypto.randomUUID();
    const child: ChildRecord = {
      id,
      familyId,
      displayName: displayName.trim(),
      ageGroup,
      freeTimePausedByChild: false,
      rewardMinutesBalance: 0,
      createdAt: new Date().toISOString(),
    };
    this.children.set(id, child);
    this.rules.set(id, []);
    this.locations.set(id, []);
    this.geofences.set(id, []);
    this.tasks.set(id, []);
    this.chatMessages.set(id, []);
    this.recordAudit(familyId, auth.actorId, 'CHILD_PROFILE_CREATED', 'SUCCESS', id, {
      displayName: child.displayName,
    });
    return child;
  }

  public createPairingCode(
    auth: AuthContext,
    familyId: string,
    childId: string
  ): { code: string; expiresAt: string } {
    this.assertGuardianAccess(auth, familyId, true, true);
    const child = this.children.get(childId);
    if (!child || child.familyId !== familyId) {
      throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child does not belong to this family');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes per ACCEPTANCE_CRITERIA.md

    this.pairingCodes.set(codeHash, {
      code,
      codeHash,
      familyId,
      childId,
      createdBy: auth.actorId,
      expiresAt,
      consumedAt: null,
      deviceId: null,
    });

    this.recordAudit(familyId, auth.actorId, 'PAIRING_CODE_ISSUED', 'SUCCESS', childId, {
      expiresAt,
    });
    return { code, expiresAt };
  }

  public confirmPairingCode(
    code: string,
    deviceName: string,
    publicKey: string,
    nowMs: number = Date.now()
  ): { device: DeviceRecord; familyName: string; childName: string } {
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const record = this.pairingCodes.get(codeHash);
    if (!record) {
      throw new ApiError(404, 'INVALID_PAIRING_CODE', 'Pairing code not recognized');
    }
    if (record.consumedAt) {
      this.recordAudit(
        record.familyId,
        'child-device-unverified',
        'PAIRING_REPLAY_REJECTED',
        'DENIED',
        record.childId
      );
      throw new ApiError(
        410,
        'PAIRING_CODE_ALREADY_CONSUMED',
        'Pairing code has already been used and cannot be replayed (TC-PAIR-001)'
      );
    }
    if (Date.parse(record.expiresAt) < nowMs) {
      this.recordAudit(
        record.familyId,
        'child-device-unverified',
        'PAIRING_EXPIRED_REJECTED',
        'DENIED',
        record.childId
      );
      throw new ApiError(
        410,
        'PAIRING_CODE_EXPIRED',
        'Pairing code expired after 10 minutes (TC-PAIR-001)'
      );
    }

    const nowIso = new Date(nowMs).toISOString();
    record.consumedAt = nowIso;
    const deviceId = crypto.randomUUID();
    record.deviceId = deviceId;

    const device: DeviceRecord = {
      id: deviceId,
      childId: record.childId,
      familyId: record.familyId,
      deviceName: deviceName || 'Child Android Device',
      appPackageId: 'com.example.family.child',
      publicKey,
      capabilities: {
        usageAccessGranted: true,
        locationPermissionGranted: true,
        notificationListenerGranted: false,
        vpnOrDnsFilterSupported: true,
        mediaProjectionAvailable: true,
        cameraPermissionGranted: false,
        microphonePermissionGranted: false,
        isOffline: false,
        batteryPercent: 92,
        osVersion: 'Android 15 (API 35)',
        oem: 'Google Pixel',
      },
      appliedRuleRevision: 0,
      lastSeenAt: nowIso,
    };

    this.devices.set(deviceId, device);
    const family = this.families.get(record.familyId)!;
    const child = this.children.get(record.childId)!;
    this.recordAudit(record.familyId, deviceId, 'DEVICE_PAIRED', 'SUCCESS', record.childId, {
      deviceName: device.deviceName,
      appPackageId: device.appPackageId,
    });

    return {
      device,
      familyName: family.name,
      childName: child.displayName,
    };
  }

  public upsertRule(
    auth: AuthContext,
    childId: string,
    type: RuleType,
    payload: Record<string, unknown>,
    clientSpoofedIsPremium?: boolean
  ): RuleEnvelope {
    const child = this.children.get(childId);
    if (!child) {
      throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    }
    const family = this.assertGuardianAccess(auth, child.familyId, true);

    // Explicit security test TC-BILL-001: Never trust a client-supplied isPremium flag
    if (clientSpoofedIsPremium === true && !isPremiumEntitled(family.entitlementState)) {
      this.recordAudit(
        family.id,
        auth.actorId,
        'SPOOFED_CLIENT_PREMIUM_FLAG_REJECTED',
        'DENIED',
        childId,
        { attemptedRuleType: type }
      );
    }

    // Enforce server-side Premium entitlement gate on the 3 Premium filter rule types
    // Ordinary app blocking (APP_LIMIT), TIME_LIMIT, DOWNTIME, ESSENTIAL_ALLOWLIST, EXCEPTION, SCHOOL_FOCUS are FREE!
    if (isRuleTypePremium(type)) {
      if (!isPremiumEntitled(family.entitlementState)) {
        this.recordAudit(
          family.id,
          auth.actorId,
          'PREMIUM_RULE_REJECTED_NO_ENTITLEMENT',
          'DENIED_402',
          childId,
          { ruleType: type, entitlementState: family.entitlementState }
        );
        throw new ApiError(
          402,
          'PREMIUM_REQUIRED',
          `${type} is one of the six Premium feature families. Active verified subscription required; ordinary app blocking and time limits remain Free.`
        );
      }
    }

    const existingList = this.rules.get(childId) || [];
    const maxRevision = existingList.reduce((max, r) => Math.max(max, r.revision), 0);
    const nextRevision = maxRevision + 1;
    const now = new Date().toISOString();

    const existingIdx = existingList.findIndex((r) => r.type === type);
    const rule: RuleEnvelope = {
      id: existingIdx >= 0 ? existingList[existingIdx].id : `rule-${crypto.randomUUID().slice(0, 8)}`,
      childId,
      type,
      schemaVersion: 1,
      revision: nextRevision,
      effectiveFrom: now,
      scheduleTimezone: 'America/Los_Angeles',
      payload,
      // Invariant: Status remains PENDING until child device acknowledges (FUNCTIONAL_REQUIREMENTS.md)
      state: 'PENDING',
      createdBy: auth.actorId,
      createdAt: now,
    };

    if (existingIdx >= 0) {
      existingList[existingIdx] = rule;
    } else {
      existingList.push(rule);
    }
    this.rules.set(childId, existingList);

    this.recordAudit(family.id, auth.actorId, 'RULE_UPDATED', 'PENDING_DEVICE_ACK', childId, {
      ruleId: rule.id,
      ruleType: rule.type,
      revision: rule.revision,
      tier: isRuleTypePremium(rule.type) ? 'PREMIUM' : 'FREE',
    });

    return rule;
  }

  public acknowledgeRulesOnDevice(
    auth: AuthContext,
    deviceId: string
  ): {
    device: DeviceRecord;
    policy: EvaluatedChildPolicy;
    ruleResults: Array<{ ruleId: string; revision: number; status: RuleState; reason: string }>;
  } {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new ApiError(404, 'DEVICE_NOT_FOUND', 'Device not found');
    }
    if (auth.role === 'CHILD_DEVICE' && auth.deviceId !== deviceId) {
      throw new ApiError(403, 'WRONG_DEVICE', 'Device token does not match target device');
    }
    if (device.capabilities.isOffline) {
      throw new ApiError(
        503,
        'DEVICE_OFFLINE',
        'Child device is currently offline; rules remain PENDING in queue while last acknowledged policy is enforced locally'
      );
    }

    const family = this.families.get(device.familyId)!;
    const childRules = this.rules.get(device.childId) || [];
    const evaluation = evaluateChildRulesDeterministically(
      device.childId,
      childRules,
      family.entitlementState,
      device.capabilities
    );

    const now = new Date().toISOString();
    for (const res of evaluation.ruleResults) {
      const target = childRules.find((r) => r.id === res.ruleId);
      if (target) {
        target.state = res.status;
        target.lastAckAt = now;
        target.lastAckDetail = res.reason;
      }
      device.appliedRuleRevision = Math.max(device.appliedRuleRevision, res.revision);
    }
    device.lastSeenAt = now;

    this.recordAudit(
      device.familyId,
      device.id,
      'RULE_APPLIED',
      'ACK_RECORDED',
      device.childId,
      {
        appliedRevision: device.appliedRuleRevision,
        statuses: evaluation.ruleResults.map((r) => `${r.ruleId}:${r.status}`),
      }
    );

    return {
      device,
      policy: evaluation.policy,
      ruleResults: evaluation.ruleResults,
    };
  }

  public createExceptionRequest(
    auth: AuthContext,
    childId: string,
    requestType: 'EXTRA_TIME' | 'APP_ACCESS' | 'SCHEDULE_EXCEPTION',
    reason: string,
    requestedMinutes: number = 15,
    targetPackage?: string
  ): ExceptionRequestRecord {
    const child = this.children.get(childId);
    if (!child) {
      throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    }
    if (auth.role === 'CHILD_DEVICE' && auth.childId !== childId) {
      throw new ApiError(403, 'FORBIDDEN', 'Child device can only request for its own childId');
    }

    const reqRecord: ExceptionRequestRecord = {
      id: `req-${crypto.randomUUID().slice(0, 8)}`,
      familyId: child.familyId,
      childId,
      requestType,
      requestedMinutes,
      targetPackage,
      reason: reason.trim() || 'Can I please have 15 more minutes to finish my project?',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.requests.set(reqRecord.id, reqRecord);
    this.recordAudit(
      child.familyId,
      auth.actorId,
      'EXTRA_TIME_REQUESTED',
      'PENDING',
      childId,
      { requestId: reqRecord.id, requestType, requestedMinutes }
    );
    return reqRecord;
  }

  public decideExceptionRequest(
    auth: AuthContext,
    requestId: string,
    decision: 'APPROVED' | 'DENIED'
  ): ExceptionRequestRecord {
    const reqRecord = this.requests.get(requestId);
    if (!reqRecord) {
      throw new ApiError(404, 'REQUEST_NOT_FOUND', 'Exception request not found');
    }
    this.assertGuardianAccess(auth, reqRecord.familyId, true);

    reqRecord.status = decision;
    reqRecord.decidedBy = auth.actorId;
    reqRecord.decidedAt = new Date().toISOString();

    if (decision === 'APPROVED') {
      const childRules = this.rules.get(reqRecord.childId) || [];
      const nextRev = childRules.reduce((m, r) => Math.max(m, r.revision), 0) + 1;
      const now = new Date();
      const effectiveUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      childRules.push({
        id: `rule-exc-${crypto.randomUUID().slice(0, 6)}`,
        childId: reqRecord.childId,
        type: 'EXCEPTION',
        schemaVersion: 1,
        revision: nextRev,
        effectiveFrom: now.toISOString(),
        effectiveUntil,
        scheduleTimezone: 'America/Los_Angeles',
        payload: {
          extraMinutes: reqRecord.requestedMinutes ?? 15,
          packages: reqRecord.targetPackage ? [reqRecord.targetPackage] : [],
        },
        state: 'APPLIED',
        lastAckAt: now.toISOString(),
        lastAckDetail: `Granted +${reqRecord.requestedMinutes ?? 15}m exception by guardian`,
        createdBy: auth.actorId,
        createdAt: now.toISOString(),
      });
      this.rules.set(reqRecord.childId, childRules);
    }

    this.recordAudit(
      reqRecord.familyId,
      auth.actorId,
      'EXTRA_TIME_DECIDED',
      decision,
      reqRecord.childId,
      { requestId: reqRecord.id, decision }
    );
    return reqRecord;
  }

  /**
   * Emergency SOS endpoint (FR-CHILD-010, FR-CHILD-011, FR-EMERGENCY-001..005, TC-SOS-001)
   * Explicitly FREE, never checks Premium entitlement, works during downtime/lock,
   * and deduplicates retries via idempotencyKey.
   */
  public triggerSos(
    auth: AuthContext,
    childId: string,
    idempotencyKey: string,
    lat: number = 37.422065,
    lon: number = -122.084089
  ): SosAlertRecord {
    const child = this.children.get(childId);
    if (!child) {
      throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    }
    if (
      auth.role === 'CHILD_DEVICE' &&
      auth.childId !== childId
    ) {
      throw new ApiError(403, 'FORBIDDEN', 'Child device cannot trigger SOS for another child');
    }

    // Deduplicate offline/network retries by idempotencyKey (FR-BACKEND-007)
    for (const existing of this.sosAlerts.values()) {
      if (existing.idempotencyKey === idempotencyKey) {
        return existing;
      }
    }

    const now = new Date();
    const linkExpiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // 30-min time-limited emergency link (FR-EMERGENCY-005)
    const alert: SosAlertRecord = {
      id: `sos-${crypto.randomUUID().slice(0, 8)}`,
      idempotencyKey,
      familyId: child.familyId,
      childId,
      lat,
      lon,
      batteryPercent: 84,
      deliveryStatus: 'SENT_PUSH',
      emergencyShareLinkExpiresAt: linkExpiresAt,
      triggeredDuringDowntime: true,
      createdAt: now.toISOString(),
    };
    this.sosAlerts.set(alert.id, alert);

    // Record emergency location update
    const locs = this.locations.get(childId) || [];
    locs.unshift({
      id: `loc-${crypto.randomUUID().slice(0, 6)}`,
      childId,
      lat,
      lon,
      accuracyMeters: 6,
      placeLabel: 'SOS Emergency Beacon Location',
      recordedAt: now.toISOString(),
    });
    this.locations.set(childId, locs);

    this.recordAudit(child.familyId, auth.actorId, 'SOS_TRIGGERED', 'DISPATCHED', childId, {
      alertId: alert.id,
      timeLimitedLinkExpiresAt: linkExpiresAt,
    });

    return alert;
  }

  /**
   * Google Play Billing Server-Side Verifier (03-technical-architecture/BILLING_STATE_MACHINE.md)
   * TC-BILL-001..004
   */
  public verifyPlayPurchase(
    auth: AuthContext,
    familyId: string,
    purchaseToken: string,
    simulatedPlayState:
      | 'PREMIUM_ACTIVE'
      | 'PREMIUM_GRACE_VERIFIED'
      | 'CANCELLED_AT_PERIOD_END'
      | 'REFUNDED'
      | 'EXPIRED'
      | 'INVALID_TOKEN',
    productId: string = 'premium_monthly'
  ): FamilyRecord {
    const family = this.assertGuardianAccess(auth, familyId, true, true);

    if (!purchaseToken || simulatedPlayState === 'INVALID_TOKEN') {
      this.recordAudit(
        familyId,
        auth.actorId,
        'SUBSCRIPTION_VERIFICATION_FAILED',
        'INVALID_PURCHASE_TOKEN'
      );
      throw new ApiError(
        400,
        'INVALID_PURCHASE_TOKEN',
        'Google Play Developer API rejected the purchase token; Premium not granted'
      );
    }

    const tokenHash = crypto.createHash('sha256').update(purchaseToken).digest('hex');
    const prev = this.verifiedPurchaseTokens.get(tokenHash);
    // Idempotency check (TC-BILL-002)
    if (prev && prev.familyId === familyId && prev.state === simulatedPlayState) {
      return family;
    }

    family.entitlementState = simulatedPlayState;
    family.subscriptionProductId = productId;
    family.subscriptionExpiresAt =
      simulatedPlayState === 'REFUNDED' || simulatedPlayState === 'EXPIRED'
        ? new Date().toISOString()
        : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    this.verifiedPurchaseTokens.set(tokenHash, {
      familyId,
      state: simulatedPlayState,
    });

    // When refunded or expired, immediately stop active live sessions and disable Premium filters while keeping Free rules intact (TC-BILL-003)
    if (!isPremiumEntitled(simulatedPlayState)) {
      for (const session of this.liveSessions.values()) {
        if (
          session.familyId === familyId &&
          (session.state === 'REQUESTED' ||
            session.state === 'NOTIFIED' ||
            session.state === 'CHILD_ACCEPTED' ||
            session.state === 'OS_PERMISSION_PENDING' ||
            session.state === 'ACTIVE')
        ) {
          session.state = 'STOPPED';
          session.stoppedAt = new Date().toISOString();
          session.stopReason = `Entitlement changed to ${simulatedPlayState}; session terminated immediately`;
          session.foregroundIndicatorVisible = false;
        }
      }

      for (const child of this.children.values()) {
        if (child.familyId === familyId) {
          const childRules = this.rules.get(child.id) || [];
          for (const rule of childRules) {
            if (isRuleTypePremium(rule.type)) {
              rule.state = 'DISABLED';
              rule.lastAckDetail = `Disabled automatically on ${simulatedPlayState}; Free rules unaffected`;
            }
          }
        }
      }
    }

    this.recordAudit(familyId, auth.actorId, 'SUBSCRIPTION_CHANGED', simulatedPlayState, undefined, {
      productId,
      entitlementState: simulatedPlayState,
    });

    return family;
  }

  /**
   * Visible Child-Approved Live Session Protocol (03-technical-architecture/LIVE_SESSION_PROTOCOL.md)
   * Modes: SCREEN, CAMERA, MICROPHONE
   * States: REQUESTED -> NOTIFIED -> CHILD_ACCEPTED -> OS_PERMISSION_PENDING -> ACTIVE -> STOPPED/EXPIRED/DISCONNECTED/DECLINED/REJECTED
   */
  public requestLiveSession(
    auth: AuthContext,
    childId: string,
    deviceId: string,
    mode: LiveSessionMode,
    durationSeconds: number = 300
  ): LiveSessionRecord {
    if (this.globalPremiumKillSwitch) {
      throw new ApiError(
        503,
        'KILL_SWITCH_ACTIVE',
        'All Premium live sessions are disabled by incident response kill-switch'
      );
    }

    const child = this.children.get(childId);
    if (!child) {
      throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    }
    const family = this.assertGuardianAccess(auth, child.familyId, true);

    // 1. Check active verified Premium entitlement
    if (!isPremiumEntitled(family.entitlementState)) {
      this.recordAudit(
        family.id,
        auth.actorId,
        'LIVE_SESSION_REJECTED_NO_PREMIUM',
        'REJECTED_402',
        childId,
        { mode }
      );
      throw new ApiError(
        402,
        'PREMIUM_REQUIRED',
        `Live ${mode} session requires active verified Premium subscription plus per-session child approval`
      );
    }

    // 2. Check sensitive feature flag (default-off per AGENTS.md)
    const flagEnabled =
      (mode === 'SCREEN' && family.featureFlags.enableLiveScreen) ||
      (mode === 'CAMERA' && family.featureFlags.enableLiveCamera) ||
      (mode === 'MICROPHONE' && family.featureFlags.enableLiveMicrophone);

    if (!flagEnabled) {
      throw new ApiError(
        403,
        'FEATURE_FLAG_DEFAULT_OFF',
        `Sensitive feature flag for Live ${mode} is default-OFF per AGENTS.md safety gate. Enable the feature flag in Human Approval Gates first.`
      );
    }

    const device = this.devices.get(deviceId);
    if (!device || device.childId !== childId) {
      throw new ApiError(404, 'DEVICE_NOT_FOUND', 'Enrolled child device not found');
    }

    // 3. Reject overlapping active/pending session for this child
    for (const existing of this.liveSessions.values()) {
      if (
        existing.childId === childId &&
        ['REQUESTED', 'NOTIFIED', 'CHILD_ACCEPTED', 'OS_PERMISSION_PENDING', 'ACTIVE'].includes(
          existing.state
        )
      ) {
        throw new ApiError(
          409,
          'OVERLAPPING_LIVE_SESSION',
          'Another live session request is already pending or active for this child device'
        );
      }
    }

    const now = new Date();
    const decisionExpiresAt = new Date(now.getTime() + 60 * 1000).toISOString(); // 60-second child decision expiry
    const guardianMember = (this.guardians.get(family.id) || []).find(
      (g) => g.userId === auth.actorId
    );

    const session: LiveSessionRecord = {
      id: `live-${crypto.randomUUID().slice(0, 8)}`,
      familyId: family.id,
      childId,
      deviceId,
      requestedBy: auth.actorId,
      guardianName: guardianMember?.displayName || 'Authorized Parent',
      mode,
      durationSeconds: Math.min(Math.max(durationSeconds, 60), 900),
      state: 'NOTIFIED',
      decisionExpiresAt,
      osConsentGranted: false,
      foregroundIndicatorVisible: false,
      sessionToken: null,
      startedAt: null,
      stoppedAt: null,
      stopReason: null,
      createdAt: now.toISOString(),
    };

    this.liveSessions.set(session.id, session);
    this.recordAudit(family.id, auth.actorId, 'LIVE_SESSION_REQUESTED', 'NOTIFIED_CHILD', childId, {
      sessionId: session.id,
      mode,
      durationSeconds: session.durationSeconds,
      decisionExpiresAt,
    });

    return session;
  }

  public submitChildLiveDecision(
    auth: AuthContext,
    sessionId: string,
    decision: 'ACCEPT' | 'DECLINE',
    deviceSignature: string,
    nowMs: number = Date.now()
  ): LiveSessionRecord {
    const session = this.liveSessions.get(sessionId);
    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Live session not found');
    }

    // Verify caller is the enrolled child device (Parent cannot forge child acceptance! TC-LIVE-001)
    if (auth.role !== 'CHILD_DEVICE' || auth.deviceId !== session.deviceId) {
      this.recordAudit(
        session.familyId,
        auth.actorId,
        'FORGED_CHILD_LIVE_DECISION_BLOCKED',
        'DENIED_403',
        session.childId,
        { sessionId }
      );
      throw new ApiError(
        403,
        'CHILD_DEVICE_CREDENTIAL_REQUIRED',
        'Only the enrolled child device can accept or decline a live session request; parent cannot self-approve'
      );
    }

    const device = this.devices.get(session.deviceId)!;
    if (!deviceSignature || !deviceSignature.includes(device.publicKey)) {
      throw new ApiError(
        403,
        'INVALID_DEVICE_SIGNATURE',
        'Live session decision must be signed by the enrolled child device key'
      );
    }

    if (Date.parse(session.decisionExpiresAt) < nowMs) {
      session.state = 'EXPIRED';
      session.stopReason = '60-second child decision window expired';
      this.recordAudit(
        session.familyId,
        device.id,
        'LIVE_SESSION_EXPIRED',
        'EXPIRED',
        session.childId,
        { sessionId }
      );
      throw new ApiError(410, 'SESSION_REQUEST_EXPIRED', '60-second child decision window expired');
    }

    if (decision === 'DECLINE') {
      session.state = 'DECLINED';
      session.stoppedAt = new Date(nowMs).toISOString();
      session.stopReason = 'Child explicitly declined the live session request; no fallback capture allowed';
      this.recordAudit(
        session.familyId,
        device.id,
        'LIVE_SESSION_DECLINED',
        'CHILD_DECLINED',
        session.childId,
        { sessionId, mode: session.mode }
      );
      return session;
    }

    // Child accepted -> transitions to OS_PERMISSION_PENDING.
    // Invariant: A server session token never substitutes for the Android OS permission prompt!
    session.state = 'OS_PERMISSION_PENDING';
    session.sessionToken = `ephemeral-token-${crypto.randomUUID()}`;
    this.recordAudit(
      session.familyId,
      device.id,
      'LIVE_SESSION_CHILD_ACCEPTED',
      'OS_PERMISSION_PENDING',
      session.childId,
      { sessionId, mode: session.mode }
    );
    return session;
  }

  public confirmChildOsPermissionAndStart(
    auth: AuthContext,
    sessionId: string,
    osPermissionGranted: boolean
  ): LiveSessionRecord {
    const session = this.liveSessions.get(sessionId);
    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Live session not found');
    }
    if (auth.role !== 'CHILD_DEVICE' || auth.deviceId !== session.deviceId) {
      throw new ApiError(403, 'WRONG_DEVICE', 'Only the child device can report OS prompt result');
    }
    if (session.state !== 'OS_PERMISSION_PENDING' && session.state !== 'CHILD_ACCEPTED') {
      throw new ApiError(
        409,
        'INVALID_SESSION_STATE',
        `Cannot start session from state ${session.state}; child acceptance is required first`
      );
    }

    if (!osPermissionGranted) {
      session.state = 'STOPPED';
      session.stoppedAt = new Date().toISOString();
      session.stopReason = 'Android OS capture permission / MediaProjection prompt denied by user';
      session.foregroundIndicatorVisible = false;
      this.recordAudit(
        session.familyId,
        auth.deviceId,
        'LIVE_SESSION_STOPPED',
        'OS_PERMISSION_DENIED',
        session.childId,
        { sessionId, mode: session.mode }
      );
      return session;
    }

    session.osConsentGranted = true;
    session.foregroundIndicatorVisible = true;
    session.state = 'ACTIVE';
    session.startedAt = new Date().toISOString();

    this.recordAudit(
      session.familyId,
      auth.deviceId,
      'LIVE_SESSION_STARTED',
      'ACTIVE_WITH_FOREGROUND_INDICATOR',
      session.childId,
      {
        sessionId,
        mode: session.mode,
        foregroundServiceActive: true,
        mediaStoredOnServer: false,
      }
    );
    return session;
  }

  public stopLiveSession(
    auth: AuthContext,
    sessionId: string,
    reason: string = 'Stopped by participant'
  ): LiveSessionRecord {
    const session = this.liveSessions.get(sessionId);
    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Live session not found');
    }
    const isChildDevice = auth.role === 'CHILD_DEVICE' && auth.deviceId === session.deviceId;
    const isFamilyGuardian =
      (auth.role === 'PARENT' || auth.role === 'GUARDIAN') && auth.familyId === session.familyId;

    if (!isChildDevice && !isFamilyGuardian) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized to stop this session');
    }

    session.state = 'STOPPED';
    session.stoppedAt = new Date().toISOString();
    session.stopReason = isChildDevice ? `Child tapped Stop: ${reason}` : `Parent ended: ${reason}`;
    session.foregroundIndicatorVisible = false;
    session.sessionToken = null;

    this.recordAudit(
      session.familyId,
      auth.actorId,
      'LIVE_SESSION_STOPPED',
      isChildDevice ? 'CHILD_STOPPED_IMMEDIATELY' : 'GUARDIAN_STOPPED',
      session.childId,
      { sessionId, mode: session.mode, stopReason: session.stopReason }
    );
    return session;
  }

  public updateDeviceCapabilities(
    deviceId: string,
    patch: Partial<DeviceCapabilities>
  ): DeviceRecord {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new ApiError(404, 'DEVICE_NOT_FOUND', 'Device not found');
    }
    device.capabilities = { ...device.capabilities, ...patch };
    device.lastSeenAt = new Date().toISOString();

    // If camera, mic, or mediaProjection permission is revoked mid-session, terminate immediately!
    for (const session of this.liveSessions.values()) {
      if (session.deviceId === deviceId && session.state === 'ACTIVE') {
        if (
          (session.mode === 'SCREEN' && !device.capabilities.mediaProjectionAvailable) ||
          (session.mode === 'CAMERA' && !device.capabilities.cameraPermissionGranted) ||
          (session.mode === 'MICROPHONE' && !device.capabilities.microphonePermissionGranted) ||
          device.capabilities.isOffline
        ) {
          session.state = device.capabilities.isOffline ? 'DISCONNECTED' : 'STOPPED';
          session.stoppedAt = new Date().toISOString();
          session.stopReason = device.capabilities.isOffline
            ? 'Device went offline; live session terminated'
            : 'Android OS permission revoked mid-session; capture terminated immediately';
          session.foregroundIndicatorVisible = false;
          this.recordAudit(
            device.familyId,
            device.id,
            'PERMISSION_REVOKED',
            'LIVE_SESSION_TERMINATED',
            device.childId,
            { sessionId: session.id, mode: session.mode }
          );
        }
      }
    }

    return device;
  }

  public setFamilyFeatureFlags(
    auth: AuthContext,
    familyId: string,
    flags: Partial<FamilyRecord['featureFlags']>
  ): FamilyRecord {
    const family = this.assertGuardianAccess(auth, familyId, true, true);
    family.featureFlags = { ...family.featureFlags, ...flags };
    this.recordAudit(familyId, auth.actorId, 'FEATURE_FLAGS_UPDATED', 'SUCCESS', undefined, flags);
    return family;
  }

  public getSupportDiagnostics(auth: AuthContext, familyId: string) {
    if (!auth || auth.role !== 'SUPPORT') {
      throw new ApiError(403, 'SUPPORT_ROLE_REQUIRED', 'Internal support role required (FR-ADMIN-002)');
    }
    const family = this.families.get(familyId);
    if (!family) {
      throw new ApiError(404, 'FAMILY_NOT_FOUND', 'Family not found');
    }
    this.recordAudit(familyId, auth.actorId, 'SUPPORT_DIAGNOSTIC_VIEW', 'AUDITED_MINIMAL_ACCESS');

    const familyDevices = Array.from(this.devices.values()).filter((d) => d.familyId === familyId);
    // FR-ADMIN-002 & TC-PRIV-001: Support sees minimal sync/permission diagnostics ONLY, never child location, chat messages, or media
    return {
      familyId: family.id,
      entitlementState: family.entitlementState,
      devices: familyDevices.map((d) => ({
        deviceId: d.id,
        osVersion: d.capabilities.osVersion,
        oem: d.capabilities.oem,
        isOffline: d.capabilities.isOffline,
        appliedRuleRevision: d.appliedRuleRevision,
        lastSeenAt: d.lastSeenAt,
      })),
      redactedFieldsNotice:
        'Child precise locations, chat messages, notification bodies, and live media are strictly inaccessible to support staff (FR-ADMIN-002).',
    };
  }

  public requestPrivacyOperation(
    auth: AuthContext,
    familyId: string,
    operation: 'EXPORT' | 'DELETE'
  ) {
    this.assertGuardianAccess(auth, familyId, true, true);
    this.recordAudit(
      familyId,
      auth.actorId,
      operation === 'EXPORT' ? 'PRIVACY_DATA_EXPORT_QUEUED' : 'PRIVACY_DATA_DELETION_QUEUED',
      'QUEUED'
    );
    return {
      requestId: `priv-${crypto.randomUUID().slice(0, 8)}`,
      familyId,
      operation,
      status: 'QUEUED',
      requestedAt: new Date().toISOString(),
    };
  }

  public submitChildCheckIn(
    auth: AuthContext,
    childId: string,
    checkInMessage: "I'm safe" | 'Arrived' | 'Need pickup'
  ) {
    const child = this.children.get(childId);
    if (!child) throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    const msgs = this.chatMessages.get(childId) || [];
    const entry: ChatMessageRecord = {
      id: `chk-${crypto.randomUUID().slice(0, 6)}`,
      familyId: child.familyId,
      childId,
      senderRole: 'CHILD',
      senderName: child.displayName,
      text: `[Check-In] ${checkInMessage}`,
      createdAt: new Date().toISOString(),
    };
    msgs.push(entry);
    this.chatMessages.set(childId, msgs);
    this.recordAudit(child.familyId, auth.actorId, 'CHILD_CHECKIN_SENT', 'SUCCESS', childId, {
      checkInMessage,
    });
    return entry;
  }

  public toggleChildFreeTimePause(auth: AuthContext, childId: string): ChildRecord {
    const child = this.children.get(childId);
    if (!child) throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    child.freeTimePausedByChild = !child.freeTimePausedByChild;
    this.recordAudit(
      child.familyId,
      auth.actorId,
      'CHILD_FREE_TIME_PAUSE_TOGGLED',
      child.freeTimePausedByChild ? 'PAUSED' : 'RESUMED',
      childId
    );
    return child;
  }

  public completeChildTask(auth: AuthContext, childId: string, taskId: string): TaskRewardRecord {
    const child = this.children.get(childId);
    if (!child) throw new ApiError(404, 'CHILD_NOT_FOUND', 'Child not found');
    const list = this.tasks.get(childId) || [];
    const task = list.find((t) => t.id === taskId);
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
    if (task.status === 'ASSIGNED') {
      task.status = 'SUBMITTED_BY_CHILD';
    } else if (task.status === 'SUBMITTED_BY_CHILD') {
      task.status = 'APPROVED_BY_PARENT';
      child.rewardMinutesBalance += task.rewardMinutes;
    }
    this.recordAudit(child.familyId, auth.actorId, 'TASK_REWARD_UPDATED', task.status, childId, {
      taskId,
      rewardMinutes: task.rewardMinutes,
    });
    return task;
  }

  public getFullStateSnapshot(familyId: string = '11111111-1111-4111-8111-111111111111') {
    const family = this.families.get(familyId)!;
    const guardians = this.guardians.get(familyId) || [];
    const children = Array.from(this.children.values()).filter((c) => c.familyId === familyId);
    const child = children[0];
    const devices = Array.from(this.devices.values()).filter((d) => d.familyId === familyId);
    const device = devices[0];
    const childRules = child ? this.rules.get(child.id) || [] : [];
    const evaluated =
      child && device
        ? evaluateChildRulesDeterministically(
            child.id,
            childRules,
            family.entitlementState,
            device.capabilities
          )
        : null;

    return {
      family,
      guardians,
      children,
      devices,
      rules: childRules,
      evaluatedPolicy: evaluated?.policy ?? null,
      requests: Array.from(this.requests.values()).filter((r) => r.familyId === familyId),
      sosAlerts: Array.from(this.sosAlerts.values()).filter((s) => s.familyId === familyId),
      locations: child ? this.locations.get(child.id) || [] : [],
      geofences: child ? this.geofences.get(child.id) || [] : [],
      tasks: child ? this.tasks.get(child.id) || [] : [],
      chatMessages: child ? this.chatMessages.get(child.id) || [] : [],
      liveSessions: Array.from(this.liveSessions.values()).filter((s) => s.familyId === familyId),
      emergencyContacts: this.emergencyContacts.get(familyId) || [],
      auditLog: this.auditLog.filter((a) => a.familyId === familyId).slice(0, 35),
    };
  }
}
