import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  ApiError,
  AuthContext,
  ParentalControlBackendService,
} from './09-source-code/backend-api/src/service.ts';
import { runAllAcceptanceAndSecurityTests } from './09-source-code/backend-api/test/acceptance-suite.ts';

const DEFAULT_FAMILY_ID = '11111111-1111-4111-8111-111111111111';
const DEFAULT_PARENT_ID = '22222222-2222-4222-8222-222222222222';
const DEFAULT_CHILD_ID = '44444444-4444-4444-8444-444444444444';
const DEFAULT_DEVICE_ID = '55555555-5555-4555-8555-555555555555';

const backendService = new ParentalControlBackendService();

function extractAuth(req: Request): AuthContext {
  const roleHeader = (req.headers['x-actor-role'] as string) || 'PARENT';
  if (roleHeader === 'CHILD_DEVICE') {
    return {
      actorId: (req.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID,
      role: 'CHILD_DEVICE',
      familyId: (req.headers['x-family-id'] as string) || DEFAULT_FAMILY_ID,
      childId: (req.headers['x-child-id'] as string) || DEFAULT_CHILD_ID,
      deviceId: (req.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID,
    };
  }
  if (roleHeader === 'SUPPORT') {
    return {
      actorId: 'support-operator-01',
      role: 'SUPPORT',
    };
  }
  return {
    actorId: (req.headers['x-actor-id'] as string) || DEFAULT_PARENT_ID,
    role: roleHeader === 'GUARDIAN' ? 'GUARDIAN' : 'PARENT',
    familyId: (req.headers['x-family-id'] as string) || DEFAULT_FAMILY_ID,
    guardianScope: (req.headers['x-guardian-scope'] as any) || 'FULL_CO_GUARDIAN',
  };
}

function handleApi(res: Response, fn: () => unknown) {
  try {
    const result = fn();
    res.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          statusCode: err.statusCode,
        },
      });
      return;
    }
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unexpected server error',
        statusCode: 500,
      },
    });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Snapshot of the dual-app state
  app.get('/v1/state', (_req, res) => {
    handleApi(res, () => backendService.getFullStateSnapshot(DEFAULT_FAMILY_ID));
  });

  app.post('/v1/reset', (_req, res) => {
    handleApi(res, () => {
      backendService.seedSyntheticDevelopmentFamily();
      return backendService.getFullStateSnapshot(DEFAULT_FAMILY_ID);
    });
  });

  // Pairing endpoints
  app.post('/v1/pairings', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const childId = req.body?.childId || DEFAULT_CHILD_ID;
      return backendService.createPairingCode(auth, DEFAULT_FAMILY_ID, childId);
    });
  });

  app.post('/v1/pairings/confirm', (req, res) => {
    handleApi(res, () => {
      const { code, deviceName, publicKey } = req.body || {};
      return backendService.confirmPairingCode(
        String(code || ''),
        String(deviceName || 'Pixel 8a Child Device'),
        String(publicKey || 'ed25519-synthetic-child-device-key-01')
      );
    });
  });

  // Rules endpoints (enforces Free vs Premium server-side)
  app.put('/v1/children/:childId/rules', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const { type, payload, clientSpoofedIsPremium } = req.body || {};
      return backendService.upsertRule(
        auth,
        req.params.childId,
        type,
        payload || {},
        clientSpoofedIsPremium
      );
    });
  });

  app.post('/v1/devices/:deviceId/rules/ack', (req, res) => {
    handleApi(res, () => {
      const auth: AuthContext = {
        actorId: req.params.deviceId,
        role: 'CHILD_DEVICE',
        familyId: DEFAULT_FAMILY_ID,
        childId: DEFAULT_CHILD_ID,
        deviceId: req.params.deviceId,
      };
      return backendService.acknowledgeRulesOnDevice(auth, req.params.deviceId);
    });
  });

  // Device capability / permission toggles (for testing permission revocation & offline mode)
  app.patch('/v1/devices/:deviceId/capabilities', (req, res) => {
    handleApi(res, () =>
      backendService.updateDeviceCapabilities(req.params.deviceId, req.body || {})
    );
  });

  // Child extra time / access requests & Parent decisions
  app.post('/v1/children/:childId/requests', (req, res) => {
    handleApi(res, () => {
      const auth: AuthContext = {
        actorId: DEFAULT_DEVICE_ID,
        role: 'CHILD_DEVICE',
        familyId: DEFAULT_FAMILY_ID,
        childId: req.params.childId,
        deviceId: DEFAULT_DEVICE_ID,
      };
      const { requestType, reason, requestedMinutes, targetPackage } = req.body || {};
      return backendService.createExceptionRequest(
        auth,
        req.params.childId,
        requestType || 'EXTRA_TIME',
        reason || 'Need 15 more minutes for homework research',
        Number(requestedMinutes || 15),
        targetPackage
      );
    });
  });

  app.post('/v1/requests/:requestId/decision', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const { decision } = req.body || {};
      return backendService.decideExceptionRequest(
        auth,
        req.params.requestId,
        decision === 'DENIED' ? 'DENIED' : 'APPROVED'
      );
    });
  });

  // Emergency SOS endpoint (Always Free, works during downtime)
  app.post('/v1/children/:childId/sos', (req, res) => {
    handleApi(res, () => {
      const auth: AuthContext = {
        actorId: DEFAULT_DEVICE_ID,
        role: 'CHILD_DEVICE',
        familyId: DEFAULT_FAMILY_ID,
        childId: req.params.childId,
        deviceId: DEFAULT_DEVICE_ID,
      };
      const { idempotencyKey, lat, lon } = req.body || {};
      return backendService.triggerSos(
        auth,
        req.params.childId,
        idempotencyKey || `sos-${Date.now()}`,
        lat ?? 37.422065,
        lon ?? -122.084089
      );
    });
  });

  // Free Child Check-in, Free-Time Pause & Tasks
  app.post('/v1/children/:childId/checkin', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      return backendService.submitChildCheckIn(
        auth,
        req.params.childId,
        req.body?.message || "I'm safe"
      );
    });
  });

  app.post('/v1/children/:childId/pause-toggle', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      return backendService.toggleChildFreeTimePause(auth, req.params.childId);
    });
  });

  app.post('/v1/children/:childId/tasks/:taskId/advance', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      return backendService.completeChildTask(auth, req.params.childId, req.params.taskId);
    });
  });

  // Google Play Billing server-side verification
  app.post('/v1/subscriptions/verify', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const { purchaseToken, simulatedPlayState, productId } = req.body || {};
      return backendService.verifyPlayPurchase(
        auth,
        DEFAULT_FAMILY_ID,
        purchaseToken || `play-token-${Date.now()}`,
        simulatedPlayState || 'PREMIUM_ACTIVE',
        productId || 'premium_monthly'
      );
    });
  });

  // Feature flags for sensitive Premium live modes
  app.patch('/v1/families/:familyId/feature-flags', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      return backendService.setFamilyFeatureFlags(auth, req.params.familyId, req.body || {});
    });
  });

  // Visible Child-Approved Live Session Protocol
  app.post('/v1/live-sessions', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const { childId, deviceId, mode, durationSeconds } = req.body || {};
      return backendService.requestLiveSession(
        auth,
        childId || DEFAULT_CHILD_ID,
        deviceId || DEFAULT_DEVICE_ID,
        mode || 'SCREEN',
        Number(durationSeconds || 300)
      );
    });
  });

  app.post('/v1/live-sessions/:sessionId/child-decision', (req, res) => {
    handleApi(res, () => {
      const isParentForgeAttempt = req.body?.forgedByParent === true;
      const auth: AuthContext = isParentForgeAttempt
        ? { actorId: DEFAULT_PARENT_ID, role: 'PARENT', familyId: DEFAULT_FAMILY_ID }
        : {
            actorId: DEFAULT_DEVICE_ID,
            role: 'CHILD_DEVICE',
            familyId: DEFAULT_FAMILY_ID,
            childId: DEFAULT_CHILD_ID,
            deviceId: DEFAULT_DEVICE_ID,
          };
      return backendService.submitChildLiveDecision(
        auth,
        req.params.sessionId,
        req.body?.decision === 'DECLINE' ? 'DECLINE' : 'ACCEPT',
        req.body?.deviceSignature || 'sig-ed25519-synthetic-child-device-key-01'
      );
    });
  });

  app.post('/v1/live-sessions/:sessionId/os-consent', (req, res) => {
    handleApi(res, () => {
      const auth: AuthContext = {
        actorId: DEFAULT_DEVICE_ID,
        role: 'CHILD_DEVICE',
        familyId: DEFAULT_FAMILY_ID,
        childId: DEFAULT_CHILD_ID,
        deviceId: DEFAULT_DEVICE_ID,
      };
      return backendService.confirmChildOsPermissionAndStart(
        auth,
        req.params.sessionId,
        Boolean(req.body?.osPermissionGranted)
      );
    });
  });

  app.post('/v1/live-sessions/:sessionId/stop', (req, res) => {
    handleApi(res, () => {
      const stoppedBy = req.body?.stoppedBy === 'PARENT' ? 'PARENT' : 'CHILD_DEVICE';
      const auth: AuthContext =
        stoppedBy === 'PARENT'
          ? { actorId: DEFAULT_PARENT_ID, role: 'PARENT', familyId: DEFAULT_FAMILY_ID }
          : {
              actorId: DEFAULT_DEVICE_ID,
              role: 'CHILD_DEVICE',
              familyId: DEFAULT_FAMILY_ID,
              childId: DEFAULT_CHILD_ID,
              deviceId: DEFAULT_DEVICE_ID,
            };
      return backendService.stopLiveSession(
        auth,
        req.params.sessionId,
        req.body?.reason || 'Immediate user stop action'
      );
    });
  });

  // Internal Admin & Privacy endpoints
  app.get('/v1/admin/diagnostics', (_req, res) => {
    handleApi(res, () =>
      backendService.getSupportDiagnostics(
        { actorId: 'support-staff-01', role: 'SUPPORT' },
        DEFAULT_FAMILY_ID
      )
    );
  });

  app.post('/v1/privacy/:operation', (req, res) => {
    handleApi(res, () => {
      const auth = extractAuth(req);
      const op = req.params.operation.toUpperCase() === 'DELETE' ? 'DELETE' : 'EXPORT';
      return backendService.requestPrivacyOperation(auth, DEFAULT_FAMILY_ID, op);
    });
  });

  // Live Automated Acceptance & Security Test Runner
  app.post('/v1/test-runner', (_req, res) => {
    handleApi(res, () => runAllAcceptanceAndSecurityTests());
  });

  // Canonical 111 Feature Catalog + Traceability loader
  app.get('/v1/catalog', (_req, res) => {
    handleApi(res, () => {
      const catalogPath = path.resolve(
        process.cwd(),
        '01-product-requirements/feature_catalog.json'
      );
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      return {
        total: catalog.length,
        freeCount: catalog.filter((x: any) => x.tier === 'FREE').length,
        premiumCount: catalog.filter((x: any) => x.tier === 'PREMIUM').length,
        items: catalog,
      };
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Parental Control Backend & Dual-App Workbench running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
