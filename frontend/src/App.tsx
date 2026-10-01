import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Download, Gauge, Info, Network, Play, RefreshCcw, Server, ShieldCheck, Sparkles, TerminalSquare, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type EventLog = {
  timestamp: string;
  source: string;
  event_type: string;
  severity: string;
  description: string;
  affected_entity?: string;
  related_entities?: string;
};

type Scenario = {
  id: string;
  name: string;
  severity: string;
  description: string;
  introduction: string;
  initial_alert: string;
  evidence: string[];
  events: EventLog[];
  decisions: { id: string; label: string; consequence: string; effects: Record<string, number> }[];
  assets: Array<Record<string, string>>;
  users: Array<Record<string, string>>;
};

type Session = {
  session_id: string;
  scenario_id: string;
  analyst_name: string;
  score: { total: number; breakdown: Record<string, number> };
  events: EventLog[];
  status: string;
  actions_taken: number;
  incorrect_actions: number;
  evidence_discovered: number;
  systems_affected: number;
  estimated_impact: string;
  demo_mode: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

type ApiError = { message?: string };

const fallbackScenarios: Scenario[] = [
  {
    id: 'account-compromise',
    name: 'Account Compromise',
    severity: 'High',
    description: 'Repeated authentication failures and a suspicious successful sign-in indicate credential abuse.',
    introduction: 'A finance analyst account shows repeated failures and an unfamiliar sign-in.',
    initial_alert: 'Multiple failed authentication attempts followed by a successful login from an unfamiliar IP.',
    evidence: [
      'The user account shows nine failed login attempts within two minutes.',
      'The successful authentication came from an unfamiliar source IP range in Prague.',
      'The user accessed sensitive finance data after the successful login.'
    ],
    events: [
      { timestamp: '10:31:04', source: 'Authentication Gateway', event_type: 'Failed Login', severity: 'medium', description: 'Multiple failed authentication attempts from the finance account.', affected_entity: 'j.smith', related_entities: 'FIN-WS-03' },
      { timestamp: '10:32:11', source: 'Network Monitor', event_type: 'Suspicious Connection', severity: 'high', description: 'Authentication attempts originated from a geo-out-of-pattern region.', affected_entity: '10.20.4.15', related_entities: 'j.smith;FIN-WS-03' },
      { timestamp: '10:34:27', source: 'IAM System', event_type: 'Successful Authentication', severity: 'critical', description: 'Successful authentication followed repeated failures from an unfamiliar source.', affected_entity: 'j.smith', related_entities: '10.20.4.15' }
    ],
    decisions: [
      { id: 'investigate', label: 'Investigate authentication logs', consequence: 'Evidence is collected without immediate disruption.', effects: { detection: 4, investigation: 6 } },
      { id: 'disable-account', label: 'Disable the account', consequence: 'The account was disabled quickly, reducing spread at the cost of business interruption.', effects: { containment: 7, business_impact: -2 } },
      { id: 'block-source', label: 'Block the source IP', consequence: 'The suspicious external connection is denied while the investigation continues.', effects: { detection: 3, containment: 5 } }
    ],
    assets: [
      { name: 'FIN-WS-03', category: 'endpoint', environment: 'production', status: 'compromised' },
      { name: 'DB-PROD-01', category: 'database', environment: 'production', status: 'sensitive' }
    ],
    users: [
      { name: 'J. Smith', role: 'Finance Analyst', department: 'Finance', status: 'at-risk' },
      { name: 'M. Ortega', role: 'IT Admin', department: 'Security', status: 'normal' }
    ]
  },
  {
    id: 'phishing-incident',
    name: 'Phishing Incident',
    severity: 'Medium',
    description: 'A phishing lure led to a false login portal and suspicious authentication activity.',
    introduction: 'An employee clicked an email link that redirected them to a spoofed portal.',
    initial_alert: 'An employee clicked a deceptive email and then performed an unexpected login to a fake portal.',
    evidence: [
      'The suspicious email spoofed the vendor invoice system.',
      'The user visited a fake single sign-on page.',
      'An authentication event followed outside the user\'s normal pattern.'
    ],
    events: [
      { timestamp: '09:48:20', source: 'Email Gateway', event_type: 'Suspicious Email', severity: 'medium', description: 'A spoofed invoice email was delivered to operations staff.', affected_entity: 'Aarav Mehta', related_entities: 'invoice@northstar-tech.example' },
      { timestamp: '09:51:04', source: 'Proxy Log', event_type: 'User Interaction', severity: 'high', description: 'The user clicked a link and visited a fake SSO portal.', affected_entity: 'Aarav Mehta', related_entities: 'HR-WS-01' },
      { timestamp: '09:52:41', source: 'IAM System', event_type: 'Unusual Authentication', severity: 'critical', description: 'An authentication event occurred outside the user\'s normal browser fingerprint.', affected_entity: 'Aarav Mehta', related_entities: 'IAM-PROD-02' }
    ],
    decisions: [
      { id: 'mark-suspicious', label: 'Mark the email as suspicious and isolate the user', consequence: 'The suspicious message and account are contained while the investigation continues.', effects: { detection: 5, containment: 6 } },
      { id: 'reset-password', label: 'Reset credentials and block access', consequence: 'Passwords are reset and identity access is suspended to protect the environment.', effects: { containment: 6, recovery: 2 } },
      { id: 'investigate', label: 'Review the email and identity logs', consequence: 'The investigation reveals the fake portal without an immediate containment action.', effects: { investigation: 5, decision_quality: 3 } }
    ],
    assets: [
      { name: 'HR-WS-01', category: 'endpoint', environment: 'production', status: 'at-risk' },
      { name: 'IAM-PROD-02', category: 'identity', environment: 'production', status: 'monitoring' }
    ],
    users: [
      { name: 'Aarav Mehta', role: 'Operations Manager', department: 'Operations', status: 'compromised' },
      { name: 'Riya Sharma', role: 'IT Support', department: 'IT', status: 'normal' }
    ]
  },
  {
    id: 'ransomware-simulation',
    name: 'Ransomware Simulation',
    severity: 'Critical',
    description: 'A suspicious endpoint process and rapid file activity suggest a ransomware-like event in a safe simulation.',
    introduction: 'An endpoint is creating unusual file modifications and a rapid rise in storage writes.',
    initial_alert: 'An endpoint is creating unusual encryption-like file modifications and abrupt I/O activity.',
    evidence: [
      'A process began unusual file renames and writes on a developer workstation.',
      'A spike in file changes was observed across a shared repository.',
      'The endpoint triggered a containment warning because of suspicious file behavior.'
    ],
    events: [
      { timestamp: '11:03:12', source: 'EDR Agent', event_type: 'Suspicious Process', severity: 'critical', description: 'An uncommon process created a rapid sequence of file writes on a developer workstation.', affected_entity: 'DEV-SRV-02', related_entities: 'Maya Rodriguez' },
      { timestamp: '11:04:28', source: 'File Monitor', event_type: 'File Activity', severity: 'critical', description: 'Rapid rename and write operations were observed on a shared repository.', affected_entity: 'FILE-SRV-01', related_entities: 'DEV-SRV-02' },
      { timestamp: '11:05:09', source: 'EDR Agent', event_type: 'Endpoint Isolation', severity: 'high', description: 'The endpoint triggered a potential containment action because of suspicious file activity.', affected_entity: 'HR-WS-01', related_entities: 'DEV-SRV-02' }
    ],
    decisions: [
      { id: 'isolate-endpoint', label: 'Isolate the endpoint immediately', consequence: 'The endpoint is isolated before the file activity spreads to critical assets.', effects: { detection: 5, containment: 8 } },
      { id: 'recover-fast', label: 'Recover from backup and validate files', consequence: 'The team restores clean copies and confirms integrity.', effects: { recovery: 7, decision_quality: 5 } },
      { id: 'ignore', label: 'Ignore the process until all evidence is reviewed', consequence: 'The event expands to more files and the impact increases.', effects: { containment: -6, business_impact: -4 } }
    ],
    assets: [
      { name: 'DEV-SRV-02', category: 'server', environment: 'production', status: 'encrypted' },
      { name: 'FILE-SRV-01', category: 'storage', environment: 'production', status: 'critical' }
    ],
    users: [
      { name: 'Maya Rodriguez', role: 'Developer', department: 'Engineering', status: 'targeted' },
      { name: 'N. Hassan', role: 'Systems Engineer', department: 'Infrastructure', status: 'normal' }
    ]
  },
  {
    id: 'insider-threat',
    name: 'Insider Threat',
    severity: 'High',
    description: 'Unusual access outside working hours and an unusual download rate suggest potential insider abuse.',
    introduction: 'A user is showing unusual access to sensitive files during off-hours with abnormal download volume.',
    initial_alert: 'A user is downloading significant files during unusual hours and using elevated access beyond their expected role.',
    evidence: [
      'The user accessed sensitive documents after 1:00 AM.',
      'The download volume exceeded the user\'s historical baseline by more than 300 percent.',
      'The account used administrator privileges to access unrelated files.'
    ],
    events: [
      { timestamp: '00:41:30', source: 'Audit Log', event_type: 'Unusual Access', severity: 'high', description: 'Use of HR and finance repositories occurred outside the user\'s normal hours.', affected_entity: 'L. Brooks', related_entities: 'FILE-SRV-01' },
      { timestamp: '00:52:13', source: 'Data Monitor', event_type: 'Large Download', severity: 'critical', description: 'A large volume of documents was exported from a sensitive file server.', affected_entity: 'FILE-SRV-01', related_entities: 'L. Brooks;DB-PROD-01' },
      { timestamp: '00:58:42', source: 'Privileged Access', event_type: 'Privilege Usage', severity: 'critical', description: 'Privileged access was used to reach files outside the user\'s role.', affected_entity: 'L. Brooks', related_entities: 'FIN-WS-03' }
    ],
    decisions: [
      { id: 'escalate', label: 'Escalate to security leadership and suspend access', consequence: 'Security leadership is notified and the account is suspended while evidence is preserved.', effects: { detection: 5, containment: 7, investigation: 4 } },
      { id: 'investigate', label: 'Investigate the account and verify business need', consequence: 'The review confirms the activity is abnormal but does not fully stop the exposure.', effects: { investigation: 6, decision_quality: 3 } },
      { id: 'revoke-privilege', label: 'Revoke administrator privileges only', consequence: 'Privilege removal stops abusive access without fully isolating the account.', effects: { containment: 5, recovery: 2 } }
    ],
    assets: [
      { name: 'FILE-SRV-01', category: 'storage', environment: 'production', status: 'sensitive' },
      { name: 'DB-PROD-01', category: 'database', environment: 'production', status: 'reviewing' }
    ],
    users: [
      { name: 'L. Brooks', role: 'Systems Administrator', department: 'IT', status: 'suspect' },
      { name: 'Riya Sharma', role: 'IT Support', department: 'IT', status: 'normal' }
    ]
  }
];

const fallbackAnalytics = {
  scenarios_completed: 18,
  average_score: 86,
  average_response_time: 4.4,
  detection_accuracy: 91,
  investigation_accuracy: 88,
  containment_performance: 90,
  most_common_mistakes: ['Ignoring suspicious alerts', 'Delayed user containment'],
  scenario_completion_rate: 94
};

const fallbackLeaderboard = [
  { analyst_name: 'Riya Sharma', score: 92, scenario: 'Account Compromise', response_time: 3.8, date: '2026-10-01' },
  { analyst_name: 'Aarav Mehta', score: 88, scenario: 'Phishing Incident', response_time: 4.5, date: '2026-10-01' },
  { analyst_name: 'Daniel Carter', score: 85, scenario: 'Ransomware Simulation', response_time: 5.1, date: '2026-10-01' }
];

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-200 border-red-500/40',
  high: 'bg-orange-500/15 text-orange-200 border-orange-500/40',
  medium: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  low: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40'
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(payload.message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Server }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between text-slate-400">
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
        <Icon className="size-4 text-cyan-300" />
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<'landing' | 'dashboard' | 'training' | 'analytics'>('landing');
  const [scenarios, setScenarios] = useState<Scenario[]>(fallbackScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState('account-compromise');
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(fallbackScenarios[0]);
  const [session, setSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState(fallbackAnalytics);
  const [leaderboard, setLeaderboard] = useState(fallbackLeaderboard);
  const [tab, setTab] = useState('Overview');
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(fallbackScenarios[0].events[0]);
  const [assistantQuestion, setAssistantQuestion] = useState('What happened?');
  const [assistantAnswer, setAssistantAnswer] = useState('The assistant will explain the simulated timeline and likely indicators.');
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const [scenarioList, analyticsData, leaderboardData] = await Promise.all([
          apiFetch<Scenario[]>('/scenarios').catch(() => fallbackScenarios),
          apiFetch<typeof analytics>('/analytics').catch(() => fallbackAnalytics),
          apiFetch<typeof fallbackLeaderboard>('/leaderboard').catch(() => fallbackLeaderboard)
        ]);
        setScenarios(scenarioList);
        setAnalytics(analyticsData);
        setLeaderboard(leaderboardData);
        if (scenarioList.length > 0) {
          setSelectedScenarioId(scenarioList[0].id);
          setSelectedScenario(scenarioList[0]);
          setSelectedEvent(scenarioList[0].events[0]);
        }
      } catch {
        setError('The backend is unavailable, so the demo is using offline simulated data.');
      }
    };

    void loadStatic();
  }, []);

  useEffect(() => {
    const scenario = scenarios.find((item) => item.id === selectedScenarioId) ?? fallbackScenarios[0];
    setSelectedScenario(scenario);
    setSelectedEvent(scenario.events[0]);
  }, [selectedScenarioId, scenarios]);

  const filteredEvents = useMemo(() => {
    return selectedScenario.events.filter((event) => {
      const matchesSeverity = eventFilter === 'all' || event.severity.toLowerCase() === eventFilter.toLowerCase();
      const matchesSearch = eventSearch.length === 0 || `${event.description} ${event.source} ${event.event_type}`.toLowerCase().includes(eventSearch.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [eventFilter, eventSearch, selectedScenario]);

  const startSimulation = async (scenarioId = selectedScenarioId) => {
    try {
      setError(null);
      const payload = await apiFetch<Session>('/scenarios/start', {
        method: 'POST',
        body: JSON.stringify({ scenario_id: scenarioId, analyst_name: 'Analyst' })
      });
      setSession(payload);
      setDemoMode(false);
      setPage('dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to start the incident.';
      setError(message);
    }
  };

  const handleDecision = async (decisionId: string) => {
    if (!session) return;
    try {
      const payload = await apiFetch<{ message: string; score: { total: number; breakdown: Record<string, number> }; session: Session }>('/sessions/' + session.session_id + '/decision', {
        method: 'POST',
        body: JSON.stringify({ scenario_id: selectedScenario.id, decision_id: decisionId, analyst_name: session.analyst_name })
      });
      setSession(payload.session);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Decision could not be applied.';
      setError(message);
    }
  };

  const resetSimulation = () => {
    setSession(null);
    setDemoMode(false);
    setTab('Overview');
    setError(null);
  };

  const askAssistant = async () => {
    try {
      const result = await fetch(`${API_BASE}/assistant?question=${encodeURIComponent(assistantQuestion)}&scenario_id=${selectedScenario.id}`);
      if (!result.ok) throw new Error('Assistant unavailable');
      const payload = await result.json();
      setAssistantAnswer(payload.answer);
    } catch {
      setAssistantAnswer('Local simulation assistant is available only in the safe demo environment. Review the evidence and timeline to draw conclusions.');
    }
  };

  const alertBar = session ? `Incident status: ${session.status.toUpperCase()} ● Score ${session.score.total}/100` : 'Awaiting triage decision';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-panel backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">CyberOps</div>
            <div className="text-sm text-slate-400">Train. Investigate. Respond.</div>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            <button className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-400" onClick={() => setPage('landing')}>Home</button>
            <button className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-400" onClick={() => setPage('dashboard')}>SOC Dashboard</button>
            <button className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-400" onClick={() => setPage('training')}>Training</button>
            <button className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-400" onClick={() => setPage('analytics')}>Analytics</button>
          </nav>
        </header>

        {page === 'landing' && (
          <main className="grid min-h-[72vh] items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">
                <ShieldCheck className="size-3.5" /> SOC training simulation
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">CYBEROPS</h1>
                <p className="mt-4 text-2xl font-medium text-cyan-200">Train. Investigate. Respond.</p>
                <p className="mt-4 max-w-xl text-lg text-slate-300">
                  An interactive cyber incident response simulator for learning defensive security decision-making.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300" onClick={() => startSimulation()}>
                  <Play className="size-4" /> Start Simulation
                </button>
                <button className="rounded-full border border-slate-600 bg-slate-900 px-5 py-3 font-semibold text-slate-100" onClick={() => setPage('training')}>Training Mode</button>
                <button className="rounded-full border border-slate-600 bg-slate-900 px-5 py-3 font-semibold text-slate-100" onClick={() => setPage('analytics')}>Performance Analytics</button>
              </div>
              <p className="text-sm text-slate-400">All incidents, identities, logs, and infrastructure in this environment are simulated.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-panel">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_40%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2"><Network className="size-4 text-cyan-300" /> System integrity</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">Protected</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Threat Feed</div>
                    <div className="mt-2 text-2xl font-bold text-white">4 active cases</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-200"><AlertTriangle className="size-4" /> Mixed severity signals</div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Response SLA</div>
                    <div className="mt-2 text-2xl font-bold text-white">03:42</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-200"><CheckCircle2 className="size-4" /> On track</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">LIVE EVENT STREAM</span>
                    <span className="text-xs text-cyan-200">Streaming...</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {fallbackScenarios[0].events.map((event, index) => (
                      <div key={index} className="flex justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div>
                          <div className="font-medium text-slate-100">{event.timestamp}</div>
                          <div className="text-slate-400">{event.event_type}</div>
                        </div>
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] uppercase ${severityColors[event.severity.toLowerCase()] || 'border-slate-500 text-slate-200'}`}>
                          {event.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        )}

        {(page === 'dashboard' || page === 'analytics' || page === 'training') && (
          <main className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
              {alertBar}
            </div>

            {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

            <div className="grid gap-6 xl:grid-cols-[320px,_1fr]">
              <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Incident Library</h2>
                  <button className="rounded-full border border-slate-700 p-2 text-slate-200" onClick={() => resetSimulation()} aria-label="Reset simulation">
                    <RefreshCcw className="size-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${selectedScenarioId === scenario.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/70 hover:border-slate-500'}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{scenario.name}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${severityColors[scenario.severity.toLowerCase()] || 'border-slate-500 text-slate-200'}`}>
                          {scenario.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{scenario.description}</p>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Servers online" value="128" icon={Server} />
                  <StatCard label="Endpoints monitored" value="4,482" icon={Activity} />
                  <StatCard label="Users monitored" value="8,640" icon={Users} />
                  <StatCard label="Open incidents" value={String(Math.max(2, scenarios.length))} icon={AlertTriangle} />
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">Incident center</div>
                      <h2 className="mt-2 text-2xl font-bold text-white">{selectedScenario.name}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200" onClick={() => startSimulation(selectedScenario.id)}>Start scenario</button>
                      <button className="rounded-full border border-cyan-500 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100" onClick={() => setDemoMode(true)}>Start Demo</button>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {['Overview', 'Timeline', 'Logs', 'Users', 'Assets', 'Indicators', 'Actions', 'Notes'].map((item) => (
                      <button key={item} onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-sm ${tab === item ? 'bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30' : 'bg-slate-900 text-slate-300'}`}>
                        {item}
                      </button>
                    ))}
                  </div>

                  {tab === 'Overview' && (
                    <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
                      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                        <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">Initial alert</div>
                        <p className="text-slate-100">{selectedScenario.initial_alert}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Severity</div>
                            <div className="mt-1 font-semibold text-white">{selectedScenario.severity}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div>
                            <div className="mt-1 font-semibold text-white">{session?.status || 'Investigating'}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Detection</div>
                            <div className="mt-1 font-semibold text-white">{session ? `${session.score.total}/100` : 'Pending'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                        <div className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-400">Affected assets</div>
                        <div className="space-y-2">
                          {selectedScenario.assets.map((asset) => (
                            <div key={asset.name} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-200">
                              <span>{asset.name}</span>
                              <span className="text-cyan-300">{asset.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'Timeline' && (
                    <div className="space-y-3">
                      {filteredEvents.map((event, index) => (
                        <button key={`${event.timestamp}-${index}`} onClick={() => setSelectedEvent(event)} className={`flex w-full items-start justify-between gap-4 rounded-2xl border p-3 text-left ${selectedEvent?.timestamp === event.timestamp ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/70'}`}>
                          <div>
                            <div className="text-sm font-medium text-white">{event.timestamp}</div>
                            <div className="text-sm text-slate-300">{event.event_type}</div>
                          </div>
                          <div className="text-right">
                            <div className={`rounded-full border px-2 py-1 text-[10px] uppercase ${severityColors[event.severity.toLowerCase()] || 'border-slate-500 text-slate-200'}`}>{event.severity}</div>
                            <div className="mt-2 text-xs text-slate-400">{event.source}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {tab === 'Logs' && (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row">
                        <input value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500" placeholder="Search logs..." />
                        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500">
                          <option value="all">All severity</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 font-mono text-sm text-slate-200">
                        {filteredEvents.map((event, index) => (
                          <div key={index} className="mb-2 border-b border-slate-800 pb-2 last:border-b-0 last:pb-0">
                            <div>{event.timestamp}  {event.event_type}  user={event.affected_entity || 'n/a'}</div>
                            <div className="text-slate-400">source={event.source}  result={event.severity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === 'Users' && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedScenario.users.map((user) => (
                        <div key={user.name} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                          <div className="text-lg font-semibold text-white">{user.name}</div>
                          <div className="mt-2 text-sm text-slate-300">Role: {user.role}</div>
                          <div className="text-sm text-slate-300">Department: {user.department}</div>
                          <div className="text-sm text-slate-300">Status: {user.status}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'Assets' && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedScenario.assets.map((asset) => (
                        <div key={asset.name} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                          <div className="text-lg font-semibold text-white">{asset.name}</div>
                          <div className="mt-2 text-sm text-slate-300">Category: {asset.category}</div>
                          <div className="text-sm text-slate-300">Environment: {asset.environment}</div>
                          <div className="text-sm text-slate-300">Status: {asset.status}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'Indicators' && (
                    <div className="space-y-3">
                      {selectedScenario.evidence.map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">{item}</div>
                      ))}
                    </div>
                  )}

                  {tab === 'Actions' && (
                    <div className="space-y-4">
                      {selectedScenario.decisions.map((decision) => (
                        <button key={decision.id} onClick={() => handleDecision(decision.id)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-left hover:border-cyan-500">
                          <div className="flex items-center justify-between gap-4">
                            <div className="font-medium text-white">{decision.label}</div>
                            <ArrowRight className="size-4 text-cyan-300" />
                          </div>
                          <div className="mt-2 text-sm text-slate-300">{decision.consequence}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {tab === 'Notes' && (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
                      <p>Recommended next investigation: review recent activity associated with the account and compare login patterns to the asset inventory.</p>
                      <p className="mt-4">This matters because the repeated failures followed by a successful login from the same unfamiliar source increase the likelihood of account compromise in this simulated scenario.</p>
                    </div>
                  )}
                </div>

                {(session || demoMode) && (
                  <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-panel">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">Scoreboard</h3>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">Simulation score</span>
                      </div>

                      <div className="mb-5 flex items-end justify-between">
                        <div>
                          <div className="text-4xl font-black text-white">{session ? session.score.total : 88}/100</div>
                          <div className="text-sm text-slate-400">Detection and response quality</div>
                        </div>
                        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                          {session ? session.status : 'Handled'} • {session ? session.actions_taken : 4} actions
                        </div>
                      </div>

                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(session ? session.score.breakdown : { Detection: 18, Investigation: 17, 'Decision Making': 21, Containment: 18, Recovery: 10, 'Business Impact': 4, 'Evidence Quality': 11 }).map(([label, value]) => ({ label, value }))}>
                            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-panel">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">CyberOps Assistant</h3>
                        <BrainCircuit className="size-5 text-cyan-300" />
                      </div>
                      <textarea value={assistantQuestion} onChange={(e) => setAssistantQuestion(e.target.value)} className="h-16 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500" />
                      <button className="mt-3 flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950" onClick={() => void askAssistant()}>
                        <Sparkles className="size-4" /> Generate explanation
                      </button>
                      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                        {assistantAnswer}
                      </div>
                    </div>
                  </div>
                )}

                {page === 'analytics' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                      <div className="mb-4 flex items-center gap-2 text-white"><Gauge className="size-5 text-cyan-300" /> Analytics Snapshot</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Average score</div><div className="mt-2 text-2xl font-bold text-white">{analytics.average_score}</div></div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Response time</div><div className="mt-2 text-2xl font-bold text-white">{analytics.average_response_time}m</div></div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Detection</div><div className="mt-2 text-2xl font-bold text-white">{analytics.detection_accuracy}%</div></div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Containment</div><div className="mt-2 text-2xl font-bold text-white">{analytics.containment_performance}%</div></div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                      <div className="mb-4 flex items-center gap-2 text-white"><BarChart3 className="size-5 text-cyan-300" /> Completion rate</div>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[{ name: 'Completed', value: analytics.scenario_completion_rate }, { name: 'Remaining', value: 100 - analytics.scenario_completion_rate }]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} fill="#22d3ee">
                              <path d="" fill="#22d3ee" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {page === 'training' && (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <div className="mb-4 flex items-center gap-2 text-white"><Info className="size-5 text-cyan-300" /> Training mode</div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        ['What is an alert?', 'An alert is a security signal that indicates a suspicious or relevant condition worth investigation.'],
                        ['What is an indicator?', 'An indicator is evidence such as a suspicious login, unusual IP, or abnormal process behavior.'],
                        ['What is containment?', 'Containment means limiting or isolating the impact before the threat can spread further.'],
                        ['What is recovery?', 'Recovery is the process of restoring a clean system state while validating integrity.']
                      ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                          <div className="font-semibold text-white">{title}</div>
                          <p className="mt-2 text-sm text-slate-300">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <div className="mb-4 flex items-center gap-2 text-white"><TerminalSquare className="size-5 text-cyan-300" /> Selected event</div>
                    {selectedEvent && (
                      <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{selectedEvent.timestamp}</span>
                          <span className={`rounded-full border px-2 py-1 text-[10px] uppercase ${severityColors[selectedEvent.severity.toLowerCase()] || 'border-slate-500 text-slate-200'}`}>{selectedEvent.severity}</span>
                        </div>
                        <div>{selectedEvent.source}</div>
                        <div>{selectedEvent.event_type}</div>
                        <div>{selectedEvent.description}</div>
                        {selectedEvent.affected_entity && <div>Entity: {selectedEvent.affected_entity}</div>}
                        {selectedEvent.related_entities && <div>Related: {selectedEvent.related_entities}</div>}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <div className="mb-4 flex items-center gap-2 text-white"><TrendingUp className="size-5 text-cyan-300" /> Leaderboard</div>
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div key={`${entry.analyst_name}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
                          <div>
                            <div className="font-semibold text-white">#{index + 1} {entry.analyst_name}</div>
                            <div className="text-xs text-slate-400">{entry.scenario}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-cyan-200">{entry.score}</div>
                            <div className="text-xs text-slate-400">{entry.response_time}s</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Incident report</h3>
                    <button className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100"><Download className="size-4" /> Download Report</button>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                    <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Executive Summary</div>
                    <p>{selectedScenario.initial_alert}</p>
                    <p className="mt-3">Action taken: the team reviewed the suspicious indicators, evaluated the chain of events, and applied the most appropriate containment and recovery steps for the fictional environment.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
