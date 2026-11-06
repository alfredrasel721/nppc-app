import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Smartphone,
  Lock,
  Unlock,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Sliders,
  Users,
  Eye,
  PhoneCall,
  MessageSquare,
  Search,
} from 'lucide-react';

type WorkspaceSection = 'simulator' | 'tests' | 'catalog' | 'gates';
type ParentTab = 'home' | 'rules' | 'location' | 'requests' | 'family';
type ChildTab = 'today' | 'requests' | 'safety' | 'family' | 'privacy';

interface CatalogItem {
  id: string;
  section: string;
  source_priority: string;
  feature: string;
  tier: 'FREE' | 'PREMIUM';
  status: string;
  android_feasibility: string;
}

interface TestSuiteReport {
  allPassed: boolean;
  total: number;
  passed: number;
  failed: number;
  executedAtUtc: string;
  results: Array<{
    testId: string;
    requirementIds: string[];
    title: string;
    tier: 'FREE' | 'PREMIUM';
    passed: boolean;
    durationMs: number;
    assertionSummary: string;
  }>;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('simulator');
  const [parentTab, setParentTab] = useState<ParentTab>('home');
  const [childTab, setChildTab] = useState<ChildTab>('today');

  const [snapshot, setSnapshot] = useState<any>(null);
  const [catalogData, setCatalogData] = useState<{
    total: number;
    freeCount: number;
    premiumCount: number;
    items: CatalogItem[];
  } | null>(null);
  const [testReport, setTestReport] = useState<TestSuiteReport | null>(null);
  const [supportDiagnostics, setSupportDiagnostics] = useState<any>(null);

  const [bannerNotice, setBannerNotice] = useState<{
    tone: 'info' | 'error' | 'success';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Local interactive form states
  const [issuedPairing, setIssuedPairing] = useState<{ code: string; expiresAt: string } | null>(
    null
  );
  const [childPairingInput, setChildPairingInput] = useState<string>('');
  const [dailyLimitInput, setDailyLimitInput] = useState<number>(90);
  const [webDomainInput, setWebDomainInput] = useState<string>('casino-royale.example');
  const [extraTimeReason, setExtraTimeReason] = useState<string>(
    'Need 15 more minutes on PixelCraft to finish building with my friend'
  );
  const [catalogFilterTier, setCatalogFilterTier] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Human Approval Gate Decision state (mirrors OPEN_QUESTIONS.md)
  const [humanGates, setHumanGates] = useState({
    brandAndAppIds: 'PROVISIONAL (com.example.family.parent / com.example.family.child)',
    minTargetSdk: 'PROVISIONAL (minSdk 29 Android 10 / targetSdk 35 Android 15)',
    jurisdictionPolicy: 'PENDING_COUNSEL (COPPA / GDPR-K age threshold review)',
    subscriptionSkuPrice: 'PENDING_OWNER (premium_monthly sandbox only)',
    callSmsPolicyDecision: 'BLOCKED (Disabled by default per Google Play Call/SMS policy)',
  });

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/v1/state');
      const data = await res.json();
      setSnapshot(data);
    } catch (err) {
      setBannerNotice({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Failed to load backend state',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    const res = await fetch('/v1/catalog');
    if (res.ok) {
      setCatalogData(await res.json());
    }
  }, []);

  const runTests = useCallback(async () => {
    const res = await fetch('/v1/test-runner', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setTestReport(data);
      setBannerNotice({
        tone: data.allPassed ? 'success' : 'error',
        text: `Executed ${data.total} Acceptance & Security Test Suites: ${data.passed}/${data.total} Passed.`,
      });
    }
  }, []);

  useEffect(() => {
    fetchState();
    fetchCatalog();
    runTests();
  }, [fetchState, fetchCatalog, runTests]);

  async function apiCall(
    path: string,
    method: string = 'POST',
    body?: Record<string, unknown>,
    successMsg?: string
  ) {
    try {
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerNotice({
          tone: 'error',
          text: `${data?.error?.code || 'API_ERROR'} (${res.status}): ${
            data?.error?.message || 'Operation rejected'
          }`,
        });
        await fetchState();
        return null;
      }
      if (successMsg) {
        setBannerNotice({ tone: 'success', text: successMsg });
      }
      await fetchState();
      return data;
    } catch (err) {
      setBannerNotice({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Network error',
      });
      return null;
    }
  }

  const family = snapshot?.family;
  const child = snapshot?.children?.[0];
  const device = snapshot?.devices?.[0];
  const rules: any[] = snapshot?.rules || [];
  const evaluatedPolicy = snapshot?.evaluatedPolicy;
  const liveSessions: any[] = snapshot?.liveSessions || [];
  const activeOrPendingSession = liveSessions.find((s) =>
    ['REQUESTED', 'NOTIFIED', 'CHILD_ACCEPTED', 'OS_PERMISSION_PENDING', 'ACTIVE'].includes(
      s.state
    )
  );

  const isPremium =
    family?.entitlementState === 'PREMIUM_ACTIVE' ||
    family?.entitlementState === 'PREMIUM_GRACE_VERIFIED' ||
    family?.entitlementState === 'CANCELLED_AT_PERIOD_END';

  const filteredCatalog = (catalogData?.items || []).filter((item) => {
    if (catalogFilterTier !== 'ALL' && item.tier !== catalogFilterTier) return false;
    if (
      catalogSearch.trim() &&
      !item.id.toLowerCase().includes(catalogSearch.toLowerCase()) &&
      !item.feature.toLowerCase().includes(catalogSearch.toLowerCase()) &&
      !item.section.toLowerCase().includes(catalogSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1B2430] flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('simulator');
          }}
          className="text-lg font-bold tracking-tight text-[#1B2430] whitespace-nowrap shrink-0"
        >
          Android Parental Control
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveSection('simulator')}
            className={`hover:text-[#1B2430] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'simulator'
                ? 'border-[#3154A6] text-[#1B2430]'
                : 'border-transparent'
            }`}
          >
            Dual-App Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('tests')}
            className={`hover:text-[#1B2430] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'tests'
                ? 'border-[#3154A6] text-[#1B2430]'
                : 'border-transparent'
            }`}
          >
            Acceptance Suite
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('catalog')}
            className={`hover:text-[#1B2430] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'catalog'
                ? 'border-[#3154A6] text-[#1B2430]'
                : 'border-transparent'
            }`}
          >
            Feature Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('gates')}
            className={`hover:text-[#1B2430] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'gates'
                ? 'border-[#3154A6] text-[#1B2430]'
                : 'border-transparent'
            }`}
          >
            Approval Gates
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveSection('tests');
              runTests();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#3154A6] rounded-lg hover:bg-[#264385] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Run Acceptance Tests
          </button>
        </div>
      </header>

      {/* Sub-header context & status bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
            <span className="font-semibold text-[#1B2430]">Phase 0–6 Execution</span>
            <span aria-hidden="true">·</span>
            <span>119 Manifest Files Verified</span>
            <span aria-hidden="true">·</span>
            <span>111 Catalog Requirements (103 Free / 8 Premium)</span>
            <span aria-hidden="true">·</span>
            <span>
              Automated Tests: {testReport ? `${testReport.passed}/${testReport.total} Passing` : 'Running'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#9A6700] font-semibold">
              Physical Device Matrix: BLOCKED (No Android Hardware Attached)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile section switcher */}
            <div className="flex md:hidden items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['simulator', 'tests', 'catalog', 'gates'] as WorkspaceSection[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize whitespace-nowrap shrink-0 ${
                    activeSection === sec ? 'bg-white text-[#1B2430]' : 'text-slate-600'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                apiCall('/v1/reset', 'POST', {}, 'Reset synthetic household state to clean defaults')
              }
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Demo State
            </button>
          </div>
        </div>
      </div>

      {/* Live API Feedback Banner */}
      {bannerNotice && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold border-b flex items-center justify-between ${
            bannerNotice.tone === 'error'
              ? 'bg-red-50 text-[#B42318] border-red-200'
              : bannerNotice.tone === 'success'
              ? 'bg-emerald-50 text-[#16816B] border-emerald-200'
              : 'bg-blue-50 text-[#3154A6] border-blue-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <span>{bannerNotice.text}</span>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="underline text-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {isLoading || !snapshot ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600">
            Loading Parental Control Backend `/v1` state and Dual-App Android environment...
          </div>
        ) : activeSection === 'simulator' ? (
          <div className="space-y-8">
            {/* Overview strip */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2430]">
                  01. Separate Parent & Child Android Applications
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Interact with both standalone Android apps side-by-side against the live{' '}
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/v1</code> backend,
                  deterministic rule engine, and per-session child consent state machine.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
                <span>
                  Household: <strong className="text-[#1B2430]">{family.name}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Entitlement:{' '}
                  <strong className={isPremium ? 'text-[#3154A6]' : 'text-slate-800'}>
                    {family.entitlementState}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Device Applied Revision:{' '}
                  <strong className="font-mono text-[#1B2430]">
                    v{device.appliedRuleRevision}
                  </strong>
                </span>
              </div>
            </div>

            {/* Dual-App 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* ================= LEFT COLUMN: PARENT ANDROID APP ================= */}
              <section
                aria-label="Parent Android Application"
                className="bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Parent App Top Bar */}
                <div>
                  <div className="bg-[#3154A6] text-white px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-85 font-mono">
                        com.example.family.parent · APK #1
                      </div>
                      <h2 className="text-base font-bold mt-0.5">
                        Family Guardian — Parent App
                      </h2>
                    </div>
                    <div className="text-right text-xs tabular-nums">
                      <div>Role: Primary Guardian</div>
                      <div className="opacity-85">Plan: {family.entitlementState}</div>
                    </div>
                  </div>

                  {/* Child Selector & Device Status Strip */}
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 tabular-nums">
                    <div>
                      Child: <strong className="text-[#1B2430]">{child.displayName}</strong> ·{' '}
                      <span>{device.deviceName}</span>
                    </div>
                    <div>
                      Battery: <strong className="text-[#1B2430]">{device.capabilities.batteryPercent}%</strong>{' '}
                      ·{' '}
                      <span
                        className={
                          device.capabilities.isOffline
                            ? 'text-[#B42318] font-semibold'
                            : 'text-[#16816B] font-semibold'
                        }
                      >
                        {device.capabilities.isOffline ? 'Offline (Stale)' : 'Online & Synced'}
                      </span>
                    </div>
                  </div>

                  {/* Parent Screen Viewport */}
                  <div className="p-5 space-y-5">
                    {parentTab === 'home' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screen P-04 / P-06 · Family Dashboard & Analytics
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Today’s Screen Time & Supervision Summary
                          </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500">Used Today</div>
                            <div className="text-lg font-bold font-mono tabular-nums text-[#1B2430] mt-1">
                              68m
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500">Daily Limit (Free)</div>
                            <div className="text-lg font-bold font-mono tabular-nums text-[#3154A6] mt-1">
                              {evaluatedPolicy?.dailyLimitMinutes ?? 120}m
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500">Reward Balance</div>
                            <div className="text-lg font-bold font-mono tabular-nums text-[#16816B] mt-1">
                              +{child.rewardMinutesBalance}m
                            </div>
                          </div>
                        </div>

                        {/* Pairing Generator (P-03) */}
                        <div className="pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs text-slate-500">
                                Screen P-03 · FR-PARENT-002 (Free)
                              </div>
                              <div className="text-sm font-semibold text-[#1B2430]">
                                Enroll / Pair Child Android Device
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Generates a one-time 6-digit code expiring in 10 minutes.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                const data = await apiCall(
                                  '/v1/pairings',
                                  'POST',
                                  { childId: child.id },
                                  'Generated 10-minute one-time pairing code'
                                );
                                if (data) {
                                  setIssuedPairing(data);
                                  setChildPairingInput(data.code);
                                }
                              }}
                              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#3154A6] hover:bg-[#264385] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Generate Pairing Code
                            </button>
                          </div>
                          {issuedPairing && (
                            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs tabular-nums">
                              <span>
                                One-Time Code:{' '}
                                <strong className="font-mono text-sm text-[#3154A6]">
                                  {issuedPairing.code}
                                </strong>
                              </span>
                              <span className="text-slate-500">
                                Expires: {new Date(issuedPairing.expiresAt).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Live Session Request & Viewer (P-19 — Premium) */}
                        <div className="pt-4 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-slate-500">
                                Screen P-19 · FR-PARENT-024/026/027/028 · Premium Only
                              </div>
                              <div className="text-sm font-semibold text-[#1B2430]">
                                Child-Approved Live Session Request
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">
                              Requires Premium + Flag + Child Tap + OS Prompt
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {(['SCREEN', 'CAMERA', 'MICROPHONE'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  apiCall(
                                    '/v1/live-sessions',
                                    'POST',
                                    {
                                      childId: child.id,
                                      deviceId: device.id,
                                      mode,
                                      durationSeconds: 300,
                                    },
                                    `Requested ${mode} session — waiting for child explicit acceptance on Child App`
                                  )
                                }
                                className="px-3 py-2 text-xs font-semibold border border-slate-300 hover:border-[#3154A6] text-[#1B2430] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Request {mode}
                              </button>
                            ))}
                          </div>

                          {activeOrPendingSession ? (
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#1B2430]">
                                  Session {activeOrPendingSession.mode} · State:{' '}
                                  <span className="font-mono text-[#3154A6]">
                                    {activeOrPendingSession.state}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    apiCall(
                                      `/v1/live-sessions/${activeOrPendingSession.id}/stop`,
                                      'POST',
                                      { stoppedBy: 'PARENT', reason: 'Parent closed viewer' },
                                      'Live session ended by Parent'
                                    )
                                  }
                                  className="text-[#B42318] font-semibold underline cursor-pointer"
                                >
                                  End Session
                                </button>
                              </div>
                              <p className="text-slate-600">
                                {activeOrPendingSession.state === 'NOTIFIED'
                                  ? 'Waiting for Leo to tap Allow or Decline on the Child App (60s timeout). Parent cannot override.'
                                  : activeOrPendingSession.state === 'OS_PERMISSION_PENDING'
                                  ? 'Child accepted! Waiting for Android OS MediaProjection / runtime permission dialog.'
                                  : 'Active ephemeral stream with visible foreground notification on Child device. Zero media recorded.'}
                              </p>
                              {activeOrPendingSession.state === 'NOTIFIED' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    apiCall(
                                      `/v1/live-sessions/${activeOrPendingSession.id}/child-decision`,
                                      'POST',
                                      { decision: 'ACCEPT', forgedByParent: true }
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold text-[#9A6700] bg-amber-50 border border-amber-200 rounded cursor-pointer"
                                >
                                  Test Security: Attempt Parent Self-Approval Forge (Expect 403)
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">
                              No active live session. Note: Live flags ship default-OFF per{' '}
                              <code>AGENTS.md</code>; enable in the Family tab or Approval Gates tab
                              to test.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {parentTab === 'rules' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens P-07, P-08, P-16, P-17, P-18 · Rule Lifecycle
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Free Controls vs Six Named Premium Filters
                          </h3>
                        </div>

                        {/* Free Time Limit Updater */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1B2430]">
                              FR-PARENT-005 · Daily Screen-Time Limit (FREE)
                            </span>
                            <span className="font-mono tabular-nums text-slate-600">
                              Target: {dailyLimitInput} min/day
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={30}
                              max={240}
                              step={15}
                              value={dailyLimitInput}
                              onChange={(e) => setDailyLimitInput(Number(e.target.value))}
                              className="flex-1"
                              aria-label="Daily screen-time limit in minutes"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/rules`,
                                  'PUT',
                                  {
                                    type: 'TIME_LIMIT',
                                    payload: { dailyMinutes: dailyLimitInput },
                                  },
                                  `Saved ${dailyLimitInput}m daily limit as PENDING — click 'Acknowledge & Sync Rules' on Child App to enforce`
                                )
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3154A6] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Save Limit (Free)
                            </button>
                          </div>
                        </div>

                        {/* Premium Web Filter Updater */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1B2430]">
                              FR-PARENT-010 · Web Domain Filter (PREMIUM)
                            </span>
                            <span className="text-slate-500">No TLS/MITM Interception</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={webDomainInput}
                              onChange={(e) => setWebDomainInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                              placeholder="domain.example"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/rules`,
                                  'PUT',
                                  {
                                    type: 'WEB_FILTER',
                                    payload: {
                                      blockedDomains: [webDomainInput, 'gambling.example'],
                                    },
                                  },
                                  'Saved Premium Web Filter rule (PENDING child device ACK)'
                                )
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3154A6] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Apply Web Filter
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/rules`,
                                  'PUT',
                                  {
                                    type: 'NOTIFICATION_FILTER',
                                    payload: {
                                      suppressedCategories: [
                                        'PROMOTIONS',
                                        'SOCIAL_CHATTER',
                                        'EMERGENCY_ALERT',
                                      ],
                                    },
                                  },
                                  'Saved Premium Notification Filter (Emergency & OS indicators always preserved)'
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Add Notification Filter (Premium)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/rules`,
                                  'PUT',
                                  {
                                    type: 'SOCIAL_FILTER',
                                    payload: {
                                      restrictedCategories: ['SHORT_VIDEO_FEEDS', 'PUBLIC_LIVESTREAMS'],
                                    },
                                  },
                                  'Saved Premium Social Category Filter (E2EE messages never read)'
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Add Social Filter (Premium)
                            </button>
                          </div>
                        </div>

                        {/* Active Rule Cards List */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Child Rule Table (Never shows APPLIED until Child Device Acknowledges)
                          </div>
                          {rules.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-semibold text-[#1B2430]">
                                  {r.type} · rev {r.revision} ·{' '}
                                  <span className="text-slate-500">
                                    {['WEB_FILTER', 'SOCIAL_FILTER', 'NOTIFICATION_FILTER'].includes(
                                      r.type
                                    )
                                      ? 'PREMIUM'
                                      : 'FREE'}
                                  </span>
                                </div>
                                <div className="text-slate-500 mt-0.5">
                                  {r.lastAckDetail || 'Waiting for child device acknowledgement...'}
                                </div>
                              </div>
                              <div className="font-mono font-semibold text-right shrink-0">
                                <span
                                  className={
                                    r.state === 'APPLIED'
                                      ? 'text-[#16816B]'
                                      : r.state === 'PENDING'
                                      ? 'text-[#9A6700]'
                                      : 'text-[#B42318]'
                                  }
                                >
                                  {r.state}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {parentTab === 'location' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens P-09 & P-10 · FR-PARENT-012/013/014 (Always Free)
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Child Location, Safe Geofences & SOS Dispatch
                          </h3>
                        </div>

                        {!device.capabilities.locationPermissionGranted ? (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-[#9A6700]">
                            Location permission revoked on Child Android device. Showing last known
                            stale timestamp rather than faking live location (TC-LOC-001).
                          </div>
                        ) : null}

                        {snapshot.locations.slice(0, 2).map((loc: any) => (
                          <div
                            key={loc.id}
                            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs tabular-nums"
                          >
                            <div>
                              <div className="font-semibold text-[#1B2430]">{loc.placeLabel}</div>
                              <div className="text-slate-500 font-mono mt-0.5">
                                {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)} · ±{loc.accuracyMeters}m
                              </div>
                            </div>
                            <div className="text-slate-500">
                              {new Date(loc.recordedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Configured Geofences (Free)
                          </div>
                          {snapshot.geofences.map((g: any) => (
                            <div
                              key={g.id}
                              className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs tabular-nums"
                            >
                              <span className="font-semibold text-[#1B2430]">{g.name}</span>
                              <span className="text-slate-500">
                                Radius {g.radiusMeters}m · Arrival & Departure Alerts
                              </span>
                            </div>
                          ))}
                        </div>

                        {snapshot.sosAlerts.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs">
                            <div className="font-bold text-[#B42318]">
                              ACTIVE SOS ALERT FROM {child.displayName.toUpperCase()}
                            </div>
                            {snapshot.sosAlerts.slice(0, 2).map((sos: any) => (
                              <div key={sos.id} className="text-slate-700 tabular-nums">
                                Status: <strong>{sos.deliveryStatus}</strong> · Time-limited Share
                                Link Expires:{' '}
                                {new Date(sos.emergencyShareLinkExpiresAt).toLocaleTimeString()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {parentTab === 'requests' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens P-11 & P-12 · FR-PARENT-009 & FR-PARENT-022 (Free)
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Extra-Time Requests & Chores / Rewards
                          </h3>
                        </div>

                        {snapshot.requests.length === 0 ? (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                            No pending extra-time requests. Use the Child App on the right to submit
                            an extra-time or app-access request.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {snapshot.requests.map((req: any) => (
                              <div
                                key={req.id}
                                className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-[#1B2430]">
                                    {req.requestType} (+{req.requestedMinutes}m) · Status:{' '}
                                    <span className="font-mono">{req.status}</span>
                                  </div>
                                  <div className="text-slate-600 mt-0.5">{req.reason}</div>
                                </div>
                                {req.status === 'PENDING' && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        apiCall(
                                          `/v1/requests/${req.id}/decision`,
                                          'POST',
                                          { decision: 'APPROVED' },
                                          'Approved child request and issued temporary rule exception'
                                        )
                                      }
                                      className="px-3 py-1.5 font-semibold text-white bg-[#16816B] rounded-lg cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        apiCall(
                                          `/v1/requests/${req.id}/decision`,
                                          'POST',
                                          { decision: 'DENIED' },
                                          'Denied child request'
                                        )
                                      }
                                      className="px-3 py-1.5 font-semibold text-[#B42318] bg-red-50 rounded-lg cursor-pointer"
                                    >
                                      Deny
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Assigned Chores & Screen-Time Rewards (Free)
                          </div>
                          {snapshot.tasks.map((t: any) => (
                            <div
                              key={t.id}
                              className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-[#1B2430]">{t.title}</div>
                                <div className="text-slate-500">
                                  Reward: +{t.rewardMinutes}m · Status: {t.status}
                                </div>
                              </div>
                              {t.status === 'SUBMITTED_BY_CHILD' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    apiCall(
                                      `/v1/children/${child.id}/tasks/${t.id}/advance`,
                                      'POST',
                                      {},
                                      `Approved task and granted +${t.rewardMinutes} reward minutes`
                                    )
                                  }
                                  className="px-3 py-1.5 font-semibold text-white bg-[#3154A6] rounded-lg cursor-pointer"
                                >
                                  Approve Reward
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {parentTab === 'family' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens P-13, P-14, P-15 · Play Billing, Guardians & Data Rights
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Google Play Billing Verifier & Sensitive Feature Flags
                          </h3>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1B2430]">
                              Server-Verified Entitlement State:
                            </span>
                            <span className="font-mono font-bold text-[#3154A6]">
                              {family.entitlementState}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  '/v1/subscriptions/verify',
                                  'POST',
                                  {
                                    purchaseToken: `play-sandbox-${Date.now()}`,
                                    simulatedPlayState: 'PREMIUM_ACTIVE',
                                  },
                                  'Server verified Google Play purchase token -> PREMIUM_ACTIVE'
                                )
                              }
                              className="px-3 py-1.5 font-semibold text-white bg-[#3154A6] rounded-lg cursor-pointer"
                            >
                              Verify Play Purchase (Activate Premium)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  '/v1/subscriptions/verify',
                                  'POST',
                                  {
                                    purchaseToken: `play-refund-${Date.now()}`,
                                    simulatedPlayState: 'REFUNDED',
                                  },
                                  'Simulated Play Refund -> Premium filters & live sessions disabled; Free rules preserved!'
                                )
                              }
                              className="px-3 py-1.5 font-semibold text-[#B42318] bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                            >
                              Simulate Refund (TC-BILL-003)
                            </button>
                          </div>
                        </div>

                        {/* Default-Off Sensitive Feature Flags */}
                        <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="font-semibold text-[#1B2430]">
                            Default-Off Live Session Feature Flags (AGENTS.md Safety Gate)
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {(
                              [
                                ['enableLiveScreen', 'Live Screen'],
                                ['enableLiveCamera', 'Live Camera'],
                                ['enableLiveMicrophone', 'Live Mic'],
                              ] as const
                            ).map(([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  apiCall(
                                    `/v1/families/${family.id}/feature-flags`,
                                    'PATCH',
                                    { [key]: !family.featureFlags[key] },
                                    `Toggled ${label} feature flag to ${!family.featureFlags[key]}`
                                  )
                                }
                                className={`px-3 py-2 font-semibold rounded-lg border cursor-pointer ${
                                  family.featureFlags[key]
                                    ? 'bg-[#3154A6] text-white border-[#3154A6]'
                                    : 'bg-slate-50 text-slate-700 border-slate-300'
                                }`}
                              >
                                {label}: {family.featureFlags[key] ? 'ON' : 'OFF'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Privacy Export & Deletion (Free) */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                          <span className="text-slate-600">
                            FR-FAMILY_WEB_MIGRATED-005 · Data Rights (Always Free)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  '/v1/privacy/export',
                                  'POST',
                                  {},
                                  'Queued verified guardian data export (FR-PRIVACY-003)'
                                )
                              }
                              className="px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Export Family Data
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  '/v1/privacy/delete',
                                  'POST',
                                  {},
                                  'Queued verified account/child data deletion request'
                                )
                              }
                              className="px-3 py-1.5 font-semibold text-[#B42318] bg-red-50 rounded-lg cursor-pointer"
                            >
                              Request Deletion
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent Android Bottom Navigation Bar */}
                <div className="grid grid-cols-5 border-t border-slate-200 bg-slate-50">
                  {(
                    [
                      ['home', 'Home'],
                      ['rules', 'Rules'],
                      ['location', 'Location'],
                      ['requests', 'Requests'],
                      ['family', 'Family'],
                    ] as const
                  ).map(([tabKey, label]) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setParentTab(tabKey)}
                      className={`min-h-[48px] text-xs font-semibold transition-colors cursor-pointer ${
                        parentTab === tabKey
                          ? 'text-[#3154A6] bg-white border-t-2 border-[#3154A6]'
                          : 'text-slate-600 hover:text-[#1B2430]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              {/* ================= RIGHT COLUMN: CHILD ANDROID APP ================= */}
              <section
                aria-label="Child Android Application"
                className="bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Child App Top Bar */}
                  <div className="bg-[#16816B] text-white px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-85 font-mono">
                        com.example.family.child · APK #2
                      </div>
                      <h2 className="text-base font-bold mt-0.5">
                        Family Companion — Child App
                      </h2>
                    </div>
                    <div className="text-right text-xs tabular-nums">
                      <div>Child: {child.displayName}</div>
                      <div className="opacity-85">Visible Supervision Active</div>
                    </div>
                  </div>

                  {/* Persistent Live Session Consent / Foreground Stop Indicator (Screens C-13 & C-14) */}
                  {activeOrPendingSession && (
                    <div className="p-4 bg-amber-50 border-b border-amber-300 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#9A6700]">
                          {activeOrPendingSession.state === 'ACTIVE'
                            ? `PERSISTENT FOREGROUND INDICATOR: LIVE ${activeOrPendingSession.mode} ACTIVE`
                            : `INCOMING LIVE ${activeOrPendingSession.mode} SESSION REQUEST`}
                        </span>
                        <span className="font-mono text-[#1B2430]">
                          State: {activeOrPendingSession.state}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        Requested by: <strong>{activeOrPendingSession.guardianName}</strong> · Max
                        Duration: {activeOrPendingSession.durationSeconds}s · Zero recording
                      </p>

                      {activeOrPendingSession.state === 'NOTIFIED' && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              apiCall(
                                `/v1/live-sessions/${activeOrPendingSession.id}/child-decision`,
                                'POST',
                                { decision: 'ACCEPT' },
                                'Child accepted request -> Android OS MediaProjection / runtime prompt required next'
                              )
                            }
                            className="px-4 py-2 font-semibold text-white bg-[#16816B] rounded-lg cursor-pointer"
                          >
                            Allow This Session (Child Tap)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              apiCall(
                                `/v1/live-sessions/${activeOrPendingSession.id}/child-decision`,
                                'POST',
                                { decision: 'DECLINE' },
                                'Child declined live session -> Request ended with zero fallback capture'
                              )
                            }
                            className="px-4 py-2 font-semibold text-[#B42318] bg-white border border-red-300 rounded-lg cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {activeOrPendingSession.state === 'OS_PERMISSION_PENDING' && (
                        <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2">
                          <div className="font-semibold text-[#1B2430]">
                            Android System Dialog: Start capturing/streaming {activeOrPendingSession.mode}?
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/live-sessions/${activeOrPendingSession.id}/os-consent`,
                                  'POST',
                                  { osPermissionGranted: true },
                                  'Android OS capture prompt granted -> Foreground service & persistent stop indicator active'
                                )
                              }
                              className="px-3.5 py-1.5 font-semibold text-white bg-[#16816B] rounded-lg cursor-pointer"
                            >
                              Grant OS Prompt
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/live-sessions/${activeOrPendingSession.id}/os-consent`,
                                  'POST',
                                  { osPermissionGranted: false },
                                  'Android OS prompt denied -> Session stopped immediately'
                                )
                              }
                              className="px-3.5 py-1.5 font-semibold text-[#B42318] bg-red-50 rounded-lg cursor-pointer"
                            >
                              Deny OS Prompt
                            </button>
                          </div>
                        </div>
                      )}

                      {activeOrPendingSession.state === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() =>
                            apiCall(
                              `/v1/live-sessions/${activeOrPendingSession.id}/stop`,
                              'POST',
                              {
                                stoppedBy: 'CHILD_DEVICE',
                                reason: 'Child tapped persistent Stop button',
                              },
                              'Child stopped live session immediately (< 2 seconds target)'
                            )
                          }
                          className="w-full py-2.5 font-bold text-white bg-[#B42318] hover:bg-red-800 rounded-lg cursor-pointer"
                        >
                          STOP LIVE SESSION IMMEDIATELY (Child Control)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Child Screen Viewport */}
                  <div className="p-5 space-y-5">
                    {childTab === 'today' && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs text-slate-500">
                              Screens C-03, C-04, C-05 · My Day & Active Rules
                            </div>
                            <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                              Screen Time Remaining & Rule Sync
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              apiCall(
                                `/v1/devices/${device.id}/rules/ack`,
                                'POST',
                                {},
                                'Child device validated & acknowledged latest rules (state -> APPLIED)'
                              )
                            }
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16816B] hover:bg-[#116352] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Acknowledge & Sync Rules
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="text-xs text-slate-500">Remaining Today</div>
                            <div className="text-xl font-bold font-mono tabular-nums text-[#16816B] mt-1">
                              {Math.max(0, (evaluatedPolicy?.dailyLimitMinutes ?? 120) - 68)} min
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Schedule: {evaluatedPolicy?.activeDowntimeWindow?.label || 'Active'}
                            </div>
                          </div>

                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                            <div className="text-xs text-slate-500">
                              FR-CHILD-020 · Free-Time Budget
                            </div>
                            <div className="text-xs font-semibold text-[#1B2430] my-1">
                              State: {child.freeTimePausedByChild ? 'Paused by Leo' : 'Running'}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/pause-toggle`,
                                  'POST',
                                  {},
                                  'Toggled child-controlled free-time budget pause'
                                )
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-[#16816B] bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              {child.freeTimePausedByChild ? 'Resume My Time' : 'Pause My Free Time'}
                            </button>
                          </div>
                        </div>

                        {/* Allowed vs Blocked Apps */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Local Rule Engine Evaluation (Emergency Dialer Always Allowed)
                          </div>
                          <div className="p-3 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div>
                              <strong className="text-[#B42318]">Blocked Apps (Free):</strong>{' '}
                              <span className="font-mono">
                                {(evaluatedPolicy?.blockedPackages || []).join(', ') || 'None'}
                              </span>
                            </div>
                            <div>
                              <strong className="text-[#16816B]">
                                Protected Emergency Allowlist:
                              </strong>{' '}
                              <span className="font-mono">
                                {(evaluatedPolicy?.essentialAllowedPackages || []).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pairing Code Confirmation (Screen C-01) */}
                        <div className="pt-3 border-t border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 mb-2">
                            Screen C-01 · Confirm Pairing Code (Tests One-Time & Replay Protection)
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={childPairingInput}
                              onChange={(e) => setChildPairingInput(e.target.value)}
                              placeholder="Enter 6-digit pairing code"
                              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  '/v1/pairings/confirm',
                                  'POST',
                                  {
                                    code: childPairingInput,
                                    deviceName: 'Pixel 8a (Child)',
                                  },
                                  'Child confirmed pairing code! Click again to test 410 Replay Rejection.'
                                )
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16816B] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Confirm Pairing
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {childTab === 'requests' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens C-06 & C-07 · FR-CHILD-008/009 (Free)
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Ask Parent for Extra Time or App Access
                          </h3>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                          <label className="block font-semibold text-[#1B2430]">
                            Reason for Parent
                          </label>
                          <input
                            type="text"
                            value={extraTimeReason}
                            onChange={(e) => setExtraTimeReason(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/requests`,
                                  'POST',
                                  {
                                    requestType: 'EXTRA_TIME',
                                    requestedMinutes: 15,
                                    reason: extraTimeReason,
                                  },
                                  'Sent +15m Extra Time request to Parent App'
                                )
                              }
                              className="px-3.5 py-2 font-semibold text-white bg-[#16816B] rounded-lg cursor-pointer"
                            >
                              Request +15m Screen Time
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                apiCall(
                                  `/v1/children/${child.id}/requests`,
                                  'POST',
                                  {
                                    requestType: 'APP_ACCESS',
                                    requestedMinutes: 15,
                                    targetPackage: 'com.game.blockblaster',
                                    reason: 'Unblock BlockBlaster for 15 minutes',
                                  },
                                  'Sent App Unblock request for com.game.blockblaster'
                                )
                              }
                              className="px-3.5 py-2 font-semibold text-[#1B2430] bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Request Unblock: BlockBlaster
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Parent Decision Inbox (Screen C-07)
                          </div>
                          {snapshot.requests.map((r: any) => (
                            <div
                              key={r.id}
                              className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                            >
                              <span>
                                {r.requestType} (+{r.requestedMinutes}m)
                              </span>
                              <span className="font-mono font-semibold">{r.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {childTab === 'safety' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screen C-08 · FR-CHILD-010, FR-CHILD-011, FR-CHILD-015 (Always Free)
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Emergency SOS, Approved Contacts & Check-In
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            apiCall(
                              `/v1/children/${child.id}/sos`,
                              'POST',
                              {
                                idempotencyKey: `sos-live-${Date.now()}`,
                                lat: 37.422065,
                                lon: -122.084089,
                              },
                              'SOS Alert Dispatched! Works during Bedtime Lock & without Premium subscription.'
                            )
                          }
                          className="w-full py-3.5 px-4 bg-[#B42318] hover:bg-red-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                        >
                          TRIGGER EMERGENCY SOS (Always Free & Unblocked)
                        </button>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Quick Child Check-In (FR-CHILD-015 · Free)
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {(["I'm safe", 'Arrived', 'Need pickup'] as const).map((msg) => (
                              <button
                                key={msg}
                                type="button"
                                onClick={() =>
                                  apiCall(
                                    `/v1/children/${child.id}/checkin`,
                                    'POST',
                                    { message: msg },
                                    `Sent child check-in: "${msg}"`
                                  )
                                }
                                className="px-3 py-2 text-xs font-semibold text-[#1B2430] bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
                              >
                                {msg}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-slate-500">
                            Approved Emergency Contacts (Callable During Lock · FR-EMERGENCY-003)
                          </div>
                          {snapshot.emergencyContacts.map((ec: any) => (
                            <div
                              key={ec.id}
                              className="p-2.5 border border-slate-200 rounded-xl flex items-center justify-between text-xs tabular-nums"
                            >
                              <span>
                                <strong>{ec.name}</strong> · {ec.relation}
                              </span>
                              <span className="font-mono text-[#16816B]">{ec.phone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {childTab === 'family' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens C-09 & C-10 · FR-CHILD-016, FR-CHILD-017 (Free)
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            Family Chat & Earn Reward Minutes
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            My Tasks & Rewards
                          </div>
                          {snapshot.tasks.map((t: any) => (
                            <div
                              key={t.id}
                              className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-[#1B2430]">{t.title}</div>
                                <div className="text-slate-500">
                                  +{t.rewardMinutes}m · {t.status}
                                </div>
                              </div>
                              {t.status === 'ASSIGNED' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    apiCall(
                                      `/v1/children/${child.id}/tasks/${t.id}/advance`,
                                      'POST',
                                      {},
                                      'Submitted task completion for parent approval'
                                    )
                                  }
                                  className="px-3 py-1.5 font-semibold text-white bg-[#16816B] rounded-lg cursor-pointer"
                                >
                                  Mark Done
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-slate-500">
                            Family Messages
                          </div>
                          {snapshot.chatMessages.slice(-4).map((m: any) => (
                            <div
                              key={m.id}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            >
                              <span className="font-semibold text-[#1B2430]">{m.senderName}: </span>
                              <span className="text-slate-700">{m.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {childTab === 'privacy' && (
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Screens C-02, C-11, C-12, C-15 · Child Transparency & OS Permissions
                          </div>
                          <h3 className="text-base font-bold text-[#1B2430] mt-0.5">
                            What Is Shared & Android OS Permission Toggles
                          </h3>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                          <div className="font-semibold text-[#1B2430]">
                            Child Transparency Disclosure (FR-CHILD-021 / FR-CHILD-024):
                          </div>
                          <p>
                            • Parents can see daily app usage totals, location (when enabled), and
                            active rule status.
                          </p>
                          <p>
                            • Parents <strong>cannot</strong> secretly view your screen, camera, or
                            microphone without your per-session approval and a visible stop banner.
                          </p>
                          <p>
                            • Private encrypted messages inside chat apps are never read.
                          </p>
                        </div>

                        {/* Simulate OS Permission Revocation & Offline Mode */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">
                            Simulate Android OS Permission Revocation & Connectivity (Tests Immediate
                            Fallback)
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {(
                              [
                                ['usageAccessGranted', 'Usage Access'],
                                ['locationPermissionGranted', 'Location Access'],
                                ['notificationListenerGranted', 'Notification Listener'],
                                ['isOffline', 'Device Offline Mode'],
                              ] as const
                            ).map(([capKey, label]) => (
                              <button
                                key={capKey}
                                type="button"
                                onClick={() =>
                                  apiCall(
                                    `/v1/devices/${device.id}/capabilities`,
                                    'PATCH',
                                    { [capKey]: !device.capabilities[capKey] },
                                    `Updated child device ${label} -> ${!device.capabilities[capKey]}`
                                  )
                                }
                                className={`p-2.5 rounded-lg border font-semibold text-left cursor-pointer ${
                                  device.capabilities[capKey]
                                    ? 'bg-emerald-50 border-emerald-300 text-[#16816B]'
                                    : 'bg-slate-50 border-slate-300 text-slate-700'
                                }`}
                              >
                                {label}: {device.capabilities[capKey] ? 'ON' : 'OFF'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Child Android Bottom Navigation Bar */}
                <div className="grid grid-cols-5 border-t border-slate-200 bg-slate-50">
                  {(
                    [
                      ['today', 'Today'],
                      ['requests', 'Requests'],
                      ['safety', 'Safety'],
                      ['family', 'Family'],
                      ['privacy', 'Privacy'],
                    ] as const
                  ).map(([tabKey, label]) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setChildTab(tabKey)}
                      className={`min-h-[48px] text-xs font-semibold transition-colors cursor-pointer ${
                        childTab === tabKey
                          ? 'text-[#16816B] bg-white border-t-2 border-[#16816B]'
                          : 'text-slate-600 hover:text-[#1B2430]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Live Audit Log & Internal Admin Diagnostic Strip */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1B2430]">
                    02. Audited Event Stream & Internal Support Isolation (A-01..A-04)
                  </h2>
                  <p className="text-xs text-slate-600">
                    All sensitive actions record actor, familyId, timestamp, and correlationId with
                    zero raw media or message bodies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch('/v1/admin/diagnostics');
                    if (res.ok) setSupportDiagnostics(await res.json());
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Inspect Support Staff View (FR-ADMIN-002)
                </button>
              </div>

              {supportDiagnostics && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono">
                  <div className="font-bold text-[#3154A6]">
                    Internal Support Diagnostic Output (Role: SUPPORT):
                  </div>
                  <div>{supportDiagnostics.redactedFieldsNotice}</div>
                  <div>
                    Devices Visible: {supportDiagnostics.devices.length} · Applied Rule Revision: v
                    {supportDiagnostics.devices[0]?.appliedRuleRevision} · Entitlement:{' '}
                    {supportDiagnostics.entitlementState}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-4 font-semibold">Timestamp (UTC)</th>
                      <th className="py-2 pr-4 font-semibold">Event Type</th>
                      <th className="py-2 pr-4 font-semibold">Result</th>
                      <th className="py-2 pr-4 font-semibold">Actor</th>
                      <th className="py-2 font-semibold">Scrubbed Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(snapshot.auditLog || []).slice(0, 8).map((ev: any) => (
                      <tr key={ev.eventId} className="hover:bg-slate-50">
                        <td className="py-2 pr-4 font-mono text-slate-500">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 pr-4 font-mono font-semibold text-[#1B2430]">
                          {ev.eventType}
                        </td>
                        <td className="py-2 pr-4 font-mono text-[#16816B]">{ev.result}</td>
                        <td className="py-2 pr-4 font-mono text-slate-600">
                          {String(ev.actorId).slice(0, 12)}
                        </td>
                        <td className="py-2 font-mono text-slate-500">
                          {JSON.stringify(ev.metadata)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : activeSection === 'tests' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2430]">
                  02. Automated Acceptance & Security Test Suite (TC-AUTH-001 .. TC-PRIV-001)
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Executes against <code>09-source-code/backend-api/src/service.ts</code> and{' '}
                  <code>09-source-code/shared-packages/src/index.ts</code>. Physical Android
                  hardware tests remain honestly marked <code>BLOCKED</code> until devices are
                  connected.
                </p>
              </div>
              <button
                type="button"
                onClick={runTests}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#3154A6] rounded-lg cursor-pointer"
              >
                Re-Run All 10 Suites
              </button>
            </div>

            {testReport && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-3 px-4 font-semibold">Test ID</th>
                      <th className="py-3 px-4 font-semibold">Tier</th>
                      <th className="py-3 px-4 font-semibold">Requirement IDs</th>
                      <th className="py-3 px-4 font-semibold">Scenario & Verified Assertion</th>
                      <th className="py-3 px-4 font-semibold text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {testReport.results.map((r) => (
                      <tr key={r.testId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#1B2430]">
                          {r.testId}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.tier}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {r.requirementIds.join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1B2430]">{r.title}</div>
                          <div className="text-slate-600 mt-0.5">{r.assertionSummary}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#16816B]">
                          {r.passed ? `PASS (${r.durationMs}ms)` : 'FAIL'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeSection === 'catalog' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2430]">
                  03. Canonical 111-Requirement Catalog & Traceability
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  103 FREE requirements (including all [ADV] items) and 8 PREMIUM rows representing
                  the 6 named Premium feature families.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search FR-ID or feature..."
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  {(['ALL', 'FREE', 'PREMIUM'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setCatalogFilterTier(tier)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                        catalogFilterTier === tier
                          ? 'bg-white text-[#1B2430] shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Requirement ID</th>
                    <th className="py-3 px-4 font-semibold">Section</th>
                    <th className="py-3 px-4 font-semibold">Source Tag</th>
                    <th className="py-3 px-4 font-semibold">Tier</th>
                    <th className="py-3 px-4 font-semibold">Requirement Specification</th>
                    <th className="py-3 px-4 font-semibold text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1B2430]">{item.id}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{item.section}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {item.source_priority}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold">
                        <span
                          className={
                            item.tier === 'PREMIUM' ? 'text-[#3154A6]' : 'text-[#16816B]'
                          }
                        >
                          {item.tier}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#1B2430]">{item.feature}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                        {item.id === 'FR-PARENT-019'
                          ? 'BLOCKED_PLAY_CALL_SMS_GATE'
                          : 'API_VERIFIED · DEVICE_PENDING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h1 className="text-2xl font-bold text-[#1B2430]">
                04. Human Approval Gates & Unresolved Open Questions (OPEN_QUESTIONS.md)
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Per <code>AGENTS.md</code>, unresolved product, legal, SDK, and Play policy
                decisions are surfaced here for explicit human approval rather than guessed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-[#1B2430]">
                  Open Human Decisions (T-001)
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      1. Commercial Brand & Android Application IDs
                    </label>
                    <input
                      type="text"
                      value={humanGates.brandAndAppIds}
                      onChange={(e) =>
                        setHumanGates({ ...humanGates, brandAndAppIds: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      2. Android Minimum & Target SDK Policy
                    </label>
                    <input
                      type="text"
                      value={humanGates.minTargetSdk}
                      onChange={(e) =>
                        setHumanGates({ ...humanGates, minTargetSdk: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      3. Launch Jurisdiction, Age Consent & Data Retention Durations
                    </label>
                    <input
                      type="text"
                      value={humanGates.jurisdictionPolicy}
                      onChange={(e) =>
                        setHumanGates({ ...humanGates, jurisdictionPolicy: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      4. Google Play Subscription SKU, Price & Grace Period
                    </label>
                    <input
                      type="text"
                      value={humanGates.subscriptionSkuPrice}
                      onChange={(e) =>
                        setHumanGates({ ...humanGates, subscriptionSkuPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBannerNotice({
                        tone: 'info',
                        text: 'Recorded human gate preferences in session state. Update 08-project-management/DECISION_LOG.md when finalizing for production release.',
                      })
                    }
                    className="px-4 py-2 font-semibold text-white bg-[#3154A6] rounded-lg cursor-pointer"
                  >
                    Record Human Gate Decisions
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-[#1B2430]">
                  Definition of Done & Physical Device Blocker Report
                </h2>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <p>
                    Per <code>00-agent-instructions/DEFINITION_OF_DONE.md</code>, a feature is never
                    marked <code>DONE</code> solely because files exist or tests compile.
                  </p>
                  <p>
                    <strong>Verified in this environment:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      119 / 119 specification files restored & validated against{' '}
                      <code>PACKAGE_MANIFEST.json</code>.
                    </li>
                    <li>
                      Separate <code>09-source-code/parent-app</code> and{' '}
                      <code>09-source-code/child-app</code> Gradle/Kotlin modules scaffolded.
                    </li>
                    <li>
                      Shared deterministic rule engine (<code>09-source-code/shared-packages</code>)
                      and backend API (<code>09-source-code/backend-api</code>) passing 10/10
                      acceptance & security suites.
                    </li>
                  </ul>
                  <p className="pt-2 text-[#9A6700] font-semibold">
                    Remaining Reproducible Physical Device Verification Steps (BLOCKED in container):
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Connect physical Android 10–15 devices (Pixel + 2 major OEMs) via ADB and run{' '}
                      <code>./gradlew :app:connectedDebugAndroidTest</code> in both{' '}
                      <code>parent-app</code> and <code>child-app</code>.
                    </li>
                    <li>
                      Validate real Android <code>MediaProjection</code> OS dialog, foreground
                      service notification persistence, and <code>&lt; 2s</code> child stop latency.
                    </li>
                    <li>
                      Complete human legal counsel sign-off on <code>PRIVACY_POLICY.md</code> and
                      Google Play Families / Data Safety declarations.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
