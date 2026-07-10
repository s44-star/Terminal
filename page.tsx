'use client';

/**
 * LEXCONV // GTM INTELLIGENCE TERMINAL  —  src/app/page.tsx
 *
 * Wallet layer: TonConnect (real on-chain payment via Tonkeeper / any TON wallet).
 * The <TonConnectUIProvider> lives in ./providers.tsx (dynamic, ssr:false).
 * Wallet hooks/button imported here are import-safe on the server; the page
 * itself only renders on the client because the provider gates its children.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
} from '@tonconnect/ui-react';
import {
  Terminal,
  Activity,
  Zap,
  Layers,
  Cpu,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  ChevronRight,
  Loader2,
  Check,
  Sparkles,
  TrendingUp,
  Radio,
  Gauge,
  Mail,
  MessageSquare,
  Megaphone,
  Wallet,
  ShieldCheck,
  Circle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Payment config — TON                                              */
/* ------------------------------------------------------------------ */

/**
 * ⚠️ REPLACE before accepting live payments.
 * Paste your Tonkeeper (or any TON) wallet address here — raw ("0:...") or
 * user-friendly ("EQ.../UQ...") format both work. While left as the zero
 * placeholder, confirmPay() hard-blocks the transaction so nothing burns.
 */
const RECIPIENT_ADDRESS =
  '0:0000000000000000000000000000000000000000000000000000000000000000';

const IS_PLACEHOLDER = /^0:0{60,}$/.test(RECIPIENT_ADDRESS);

// $5 ≈ 1 TON. Adjust to your working rate; tiers scale off this.
const USD_PER_TON = 5;

const tonFor = (usd: number) => usd / USD_PER_TON;
const nanoFor = (usd: number) => Math.round(tonFor(usd) * 1e9).toString();
const fmtTon = (ton: number) => (Number.isInteger(ton) ? ton.toString() : ton.toFixed(2));

/* ------------------------------------------------------------------ */
/*  Types & static config                                             */
/* ------------------------------------------------------------------ */

type Phase = 'idle' | 'running' | 'complete';
type TabKey = 'narrative' | 'blueprint' | 'allocation';

interface Metric {
  label: string;
  value: number; // 0..100
}

interface Report {
  brand: string;
  offer: string;
  segment: string;
  message: string;
  overall: number;
  metrics: Metric[];
  hooks: string[];
  funnel: { stage: string; label: string; action: string; kpi: string }[];
  outreach: { channel: string; icon: 'mail' | 'dm' | 'ad'; subject: string; body: string }[];
  generatedAt: string;
  sessionId: string;
}

interface Tier {
  id: string;
  name: string;
  price: number;
  tag: string;
  perks: string[];
  featured?: boolean;
}

const STAGES = [
  'Initializing Analytics Suite...',
  'Parsing narrative structure...',
  'Scoring semantic alignment...',
  'Compiling conversion frameworks...',
  'Generating outreach sequences...',
  'Allocating resource logic...',
  'Finalizing intelligence report...',
];

const TIERS: Tier[] = [
  {
    id: 'launch',
    name: 'Early Adopter — Launch Pass',
    price: 5,
    tag: 'LIMITED',
    featured: true,
    perks: ['Full report export', 'All 3 intelligence modules', 'Founder pricing — locked forever'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 125,
    tag: 'ANCHOR',
    perks: ['Priority compute lane', 'Quarterly strategy refresh', 'Dedicated allocation model'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 50,
    tag: 'POPULAR',
    perks: ['Extended funnel library', 'A/B headline matrix', 'Multi-segment scoring'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 25,
    tag: 'ENTRY',
    perks: ['Single report export', 'Core scoring engine', 'Standard outreach templates'],
  },
];

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-analysis (no randomness → stable output)     */
/* ------------------------------------------------------------------ */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function scoreFrom(seed: string, floor: number, ceil: number): number {
  const span = ceil - floor;
  return floor + (hash(seed) % (span + 1));
}

function buildReport(brand: string, offer: string, segment: string, message: string): Report {
  const b = brand.trim() || 'Unnamed Venture';
  const o = offer.trim() || 'the offering';
  const s = segment.trim() || 'the target segment';
  const m = message.trim() || o;

  const metrics: Metric[] = [
    { label: 'Message Clarity', value: scoreFrom(m + 'clarity', 62, 96) },
    { label: 'Emotional Resonance', value: scoreFrom(m + 'emotion', 55, 92) },
    { label: 'Specificity Index', value: scoreFrom(o + 'spec', 58, 94) },
    { label: 'Authority Signal', value: scoreFrom(b + 'auth', 60, 95) },
    { label: 'Urgency Pressure', value: scoreFrom(m + 'urgency', 48, 90) },
    { label: 'Segment Fit', value: scoreFrom(s + 'fit', 64, 97) },
  ];
  const overall = Math.round(metrics.reduce((a, c) => a + c.value, 0) / metrics.length);

  const hooks = [
    `The ${o} ${s} teams quietly switch to before Q3 close.`,
    `Stop bleeding pipeline. ${b} turns cold ${s} into booked calls.`,
    `${s}: your competitors already deployed this. You haven't.`,
    `One system. Zero guesswork. ${o} that pays for itself in 30 days.`,
    `Why 40+ operators replaced their stack with ${b} last quarter.`,
  ];

  const funnel = [
    { stage: 'TOFU', label: 'Attention Capture', action: `Authority content mapped to ${s} pain triggers`, kpi: 'CTR / Reach' },
    { stage: 'MOFU', label: 'Consideration', action: `${o} demo + comparison teardown vs. incumbent`, kpi: 'MQL → SQL' },
    { stage: 'BOFU', label: 'Conversion', action: 'Risk-reversal offer + scarcity-gated onboarding', kpi: 'Close Rate' },
    { stage: 'LOOP', label: 'Expansion', action: 'Referral loop + tier upgrade nudge at value moment', kpi: 'NRR' },
  ];

  const outreach: Report['outreach'] = [
    {
      channel: 'Cold Email',
      icon: 'mail',
      subject: `${b}: a faster path for ${s}`,
      body: `Hi {{first_name}} — noticed {{company}} is scaling ${s} ops. ${b} helps teams like yours cut ${o} overhead by ~30% without adding headcount. Worth a 12-min look this week?`,
    },
    {
      channel: 'Direct Message',
      icon: 'dm',
      subject: 'Warm DM opener',
      body: `Saw your post on ${s} — sharp take. We built ${b} for exactly this problem. Not pitching, just think you'd find the allocation model useful. Want me to send it over?`,
    },
    {
      channel: 'Retargeting Ad',
      icon: 'ad',
      subject: 'Paid re-engagement',
      body: `Still evaluating ${o}? ${b} deploys in a day, not a quarter. Founder pricing closes soon → claim your access.`,
    },
  ];

  return {
    brand: b,
    offer: o,
    segment: s,
    message: m,
    overall,
    metrics,
    hooks,
    funnel,
    outreach,
    generatedAt: new Date().toISOString(),
    sessionId: 'GTM-' + hash(b + o + Date.now()).toString(36).toUpperCase().slice(0, 8),
  };
}

/* ------------------------------------------------------------------ */
/*  Resource Logic Allocation — strict if/then engine                 */
/* ------------------------------------------------------------------ */

interface Allocation {
  strategy: string;
  cpl: number;
  channels: { name: string; pct: number }[];
}

function allocate(budget: number): Allocation {
  if (!Number.isFinite(budget) || budget <= 0) {
    return { strategy: 'INVALID INPUT', cpl: 0, channels: [] };
  }
  if (budget < 100) {
    return {
      strategy: 'Bootstrap / Organic-Led',
      cpl: 4,
      channels: [
        { name: 'Content / SEO', pct: 45 },
        { name: 'Direct Outreach', pct: 40 },
        { name: 'Paid Social', pct: 15 },
      ],
    };
  }
  if (budget < 500) {
    return {
      strategy: 'Hybrid Traction',
      cpl: 9,
      channels: [
        { name: 'Paid Social', pct: 30 },
        { name: 'Content / SEO', pct: 25 },
        { name: 'Direct Outreach', pct: 20 },
        { name: 'Paid Search', pct: 15 },
        { name: 'Retargeting', pct: 10 },
      ],
    };
  }
  if (budget < 2000) {
    return {
      strategy: 'Paid Acceleration',
      cpl: 16,
      channels: [
        { name: 'Paid Search', pct: 30 },
        { name: 'Paid Social', pct: 25 },
        { name: 'Retargeting', pct: 15 },
        { name: 'Content / SEO', pct: 15 },
        { name: 'Direct Outreach', pct: 10 },
        { name: 'Creative / Tooling', pct: 5 },
      ],
    };
  }
  return {
    strategy: 'Full-Funnel Scale',
    cpl: 22,
    channels: [
      { name: 'Paid Search', pct: 28 },
      { name: 'Paid Social', pct: 27 },
      { name: 'Retargeting', pct: 18 },
      { name: 'Content / SEO', pct: 12 },
      { name: 'Direct Outreach', pct: 8 },
      { name: 'Creative / Tooling', pct: 7 },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                    */
/* ------------------------------------------------------------------ */

function ScoreBar({ label, value }: Metric) {
  const tone = value >= 85 ? 'text-emerald-400' : value >= 70 ? 'text-cyan-400' : 'text-amber-400';
  const bar = value >= 85 ? 'bg-emerald-400' : value >= 70 ? 'bg-cyan-400' : 'bg-amber-400';
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className={tone}>{value.toString().padStart(2, '0')}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full ${bar} transition-[width] duration-700 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, kicker, title }: { icon: any; kicker: string; title: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-zinc-800 pb-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">{kicker}</div>
        <h3 className="font-mono text-sm font-medium text-zinc-100">{title}</h3>
      </div>
    </div>
  );
}

function Awaiting() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 py-16 text-center">
      <Radio className="h-6 w-6 text-zinc-600" />
      <div className="font-mono text-xs text-zinc-500">AWAITING INPUT</div>
      <div className="max-w-xs font-mono text-[11px] leading-relaxed text-zinc-600">
        Submit a brief in the intake console to generate the intelligence report.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress(); // user-friendly, '' when disconnected

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [stage, setStage] = useState(0);
  const [tab, setTab] = useState<TabKey>('narrative');
  const [report, setReport] = useState<Report | null>(null);

  const [budget, setBudget] = useState<number>(500);
  const [selectedTier, setSelectedTier] = useState<string>('launch');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [processingPay, setProcessingPay] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [tgReady, setTgReady] = useState(false);

  // Uncontrolled intake fields (DOM-ref pattern)
  const brandRef = useRef<HTMLInputElement>(null);
  const offerRef = useRef<HTMLInputElement>(null);
  const segmentRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  /* -- Telegram SDK init (client only) -- */
  useEffect(() => {
    setMounted(true);
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        tg.ready?.();
        tg.expand?.();
        tg.setHeaderColor?.('#09090b');
        tg.setBackgroundColor?.('#09090b');
        setTgReady(true);
      }
    } catch {
      /* non-Telegram browser — degrade gracefully */
    }
  }, []);

  /* -- Loading sequence -- */
  useEffect(() => {
    if (phase !== 'running') return;
    let i = 0;
    setStage(0);
    const tick = () => {
      i += 1;
      if (i < STAGES.length) {
        setStage(i);
        timer = window.setTimeout(tick, 560);
      } else {
        const r = buildReport(
          brandRef.current?.value ?? '',
          offerRef.current?.value ?? '',
          segmentRef.current?.value ?? '',
          messageRef.current?.value ?? '',
        );
        setReport(r);
        setTab('narrative');
        setPhase('complete');
      }
    };
    let timer = window.setTimeout(tick, 560);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const run = () => {
    if (phase === 'running') return;
    setPaid(false);
    setPayError(null);
    setReport(null);
    setPhase('running');
  };

  const reset = () => {
    setPhase('idle');
    setReport(null);
    setPaid(false);
    setSheetOpen(false);
    setProcessingPay(false);
    setPayError(null);
    setStage(0);
    setTab('narrative');
    if (brandRef.current) brandRef.current.value = '';
    if (offerRef.current) offerRef.current.value = '';
    if (segmentRef.current) segmentRef.current.value = '';
    if (messageRef.current) messageRef.current.value = '';
  };

  const alloc = useMemo(() => allocate(budget), [budget]);
  const tier = TIERS.find((t) => t.id === selectedTier) ?? TIERS[0];
  const tonAmount = tonFor(tier.price);
  const tonLabel = fmtTon(tonAmount);
  const shortAddr = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : '';

  /* -- Payment sheet control -- */
  const openSheet = () => {
    if (!report) return;
    setPayError(null);
    setSheetOpen(true);
  };

  /* -- Real TonConnect on-chain payment -- */
  const confirmPay = async () => {
    setPayError(null);

    if (IS_PLACEHOLDER) {
      setPayError('Recipient not set. Replace RECIPIENT_ADDRESS with your wallet address.');
      return;
    }

    // Not connected → open the wallet-connection modal instead of paying.
    if (!wallet) {
      try {
        await tonConnectUI.openModal();
      } catch {
        /* modal dismissed */
      }
      return;
    }

    setProcessingPay(true);
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 min TTL
        messages: [
          {
            address: RECIPIENT_ADDRESS,
            amount: nanoFor(tier.price), // nanoTON, as string
          },
        ],
      });

      setProcessingPay(false);
      setSheetOpen(false);
      setPaid(true);
      try {
        (window as any)?.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
      } catch {
        /* noop */
      }
    } catch {
      setProcessingPay(false);
      setPayError('Transaction cancelled or rejected in wallet. Try again.');
    }
  };

  /* -- Markdown compilation + download -- */
  const download = () => {
    if (!report || !paid) return;
    const md = compileMarkdown(report, budget, alloc, tier);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.brand.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-gtm-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-emerald-400/20 selection:text-emerald-200">
      {/* ambient grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* ---------------------------------------------------------- */}
      {/* Top bar                                                    */}
      {/* ---------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-[13px] font-semibold tracking-tight text-zinc-100">
                LEXCONV<span className="text-zinc-600"> // </span>
                <span className="text-emerald-400">GTM TERMINAL</span>
              </div>
              <div className="font-mono text-[10px] text-zinc-500">Go-To-Market Intelligence · v1.0</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 font-mono text-[10px] text-zinc-500 md:flex">
              <span className={`inline-flex h-1.5 w-1.5 rounded-full ${mounted && tgReady ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              {mounted ? (tgReady ? 'TELEGRAM CTX' : 'WEB CTX') : 'BOOTING'}
            </div>
            <div className="hidden items-center gap-2 font-mono text-[10px] text-zinc-500 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full ${phase === 'running' ? 'animate-ping bg-cyan-400' : 'bg-emerald-400'} opacity-60`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${phase === 'running' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              </span>
              {phase === 'running' ? 'PROCESSING' : phase === 'complete' ? 'READY' : 'IDLE'}
            </div>

            {/* Native TON wallet connect — top right */}
            <TonConnectButton className="ton-connect-btn" />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/* Body                                                       */}
      {/* ---------------------------------------------------------- */}
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ---------------- Intake console (left) --------------- */}
          <section className="lg:col-span-4">
            <div className="sticky top-20 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-5 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100">
                  Intake Console
                </h2>
              </div>

              <div className="space-y-4">
                <Field label="Brand / Venture" hint="e.g. Inspector, MLINZI">
                  <input ref={brandRef} type="text" placeholder="Acme Systems" defaultValue="" className="intake" />
                </Field>
                <Field label="Core Offer" hint="the product or service">
                  <input ref={offerRef} type="text" placeholder="compliance automation" className="intake" />
                </Field>
                <Field label="Target Segment" hint="who you sell to">
                  <input ref={segmentRef} type="text" placeholder="industrial ops leaders" className="intake" />
                </Field>
                <Field label="Core Message" hint="your positioning in one line">
                  <textarea ref={messageRef} rows={3} placeholder="Cut audit overhead 30% without adding headcount." className="intake resize-none" />
                </Field>

                <button
                  onClick={run}
                  disabled={phase === 'running'}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {phase === 'running' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running Analysis
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      {phase === 'complete' ? 'Re-run Analysis' : 'Run Analysis'}
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

              {/* live boot log */}
              {phase === 'running' && (
                <div className="mt-5 space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  {STAGES.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 font-mono text-[11px]">
                      {i < stage ? (
                        <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                      ) : i === stage ? (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-cyan-400" />
                      ) : (
                        <Circle className="h-3 w-3 shrink-0 text-zinc-700" />
                      )}
                      <span className={i < stage ? 'text-zinc-500' : i === stage ? 'text-cyan-300' : 'text-zinc-700'}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ---------------- Terminal output (right) ------------- */}
          <section className="lg:col-span-8">
            {/* tabs */}
            <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-1">
              <TabButton active={tab === 'narrative'} onClick={() => setTab('narrative')} icon={Activity} label="Narrative Alignment" />
              <TabButton active={tab === 'blueprint'} onClick={() => setTab('blueprint')} icon={Layers} label="Conversion Blueprint" />
              <TabButton active={tab === 'allocation'} onClick={() => setTab('allocation')} icon={Gauge} label="Resource Logic" />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
              {/* ---- Tab 1: Narrative Alignment Core ---- */}
              {tab === 'narrative' && (
                <div>
                  <SectionHeader icon={Activity} kicker="Module 01" title="Narrative Alignment Core" />
                  {!report ? (
                    <Awaiting />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 py-7 sm:flex-row sm:gap-6">
                        <RingScore value={report.overall} />
                        <div className="text-center sm:text-left">
                          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
                            Composite Alignment Score
                          </div>
                          <div className="mt-1 max-w-xs font-mono text-[11px] leading-relaxed text-zinc-400">
                            {report.overall >= 85
                              ? 'Elite positioning. Message and segment are tightly coupled — scale spend.'
                              : report.overall >= 70
                              ? 'Strong foundation. Tighten urgency and specificity before scaling paid.'
                              : 'Reposition first. Clarify the core promise before increasing distribution.'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        {report.metrics.map((m) => (
                          <ScoreBar key={m.label} {...m} />
                        ))}
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">
                          <TrendingUp className="h-3.5 w-3.5" /> Semantic Read
                        </div>
                        <p className="font-mono text-[11px] leading-relaxed text-zinc-400">
                          Analyzed positioning for <span className="text-emerald-300">{report.brand}</span> targeting{' '}
                          <span className="text-cyan-300">{report.segment}</span>. Core promise registers as{' '}
                          {report.metrics[0].value >= 80 ? 'high-clarity' : 'moderately clear'} with{' '}
                          {report.metrics[4].value >= 70 ? 'sufficient' : 'weak'} urgency signaling.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Tab 2: Conversion Blueprint Engine ---- */}
              {tab === 'blueprint' && (
                <div>
                  <SectionHeader icon={Layers} kicker="Module 02" title="Conversion Blueprint Engine" />
                  {!report ? (
                    <Awaiting />
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
                          Structured Funnel
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {report.funnel.map((f, i) => (
                            <div key={f.stage} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-mono text-[11px] font-semibold text-emerald-400">{f.stage}</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
                              </div>
                              <div className="font-mono text-[12px] text-zinc-200">{f.label}</div>
                              <div className="mt-1 font-mono text-[11px] leading-relaxed text-zinc-500">{f.action}</div>
                              <div className="mt-2 inline-flex rounded border border-cyan-400/20 bg-cyan-400/5 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">{f.kpi}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
                          Headline Hooks
                        </div>
                        <div className="space-y-1.5">
                          {report.hooks.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                              <span className="mt-0.5 font-mono text-[10px] text-emerald-400/60">{String(i + 1).padStart(2, '0')}</span>
                              <span className="font-mono text-[12px] leading-relaxed text-zinc-300">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
                          Automated Outreach Templates
                        </div>
                        <div className="space-y-2">
                          {report.outreach.map((o) => (
                            <div key={o.channel} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 text-cyan-400">
                                  {o.icon === 'mail' ? <Mail className="h-3 w-3" /> : o.icon === 'dm' ? <MessageSquare className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
                                </span>
                                <span className="font-mono text-[11px] font-semibold text-zinc-200">{o.channel}</span>
                                <span className="ml-auto font-mono text-[10px] text-zinc-600">{o.subject}</span>
                              </div>
                              <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400">{o.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Tab 3: Resource Logic Allocation ---- */}
              {tab === 'allocation' && (
                <div>
                  <SectionHeader icon={Gauge} kicker="Module 03" title="Resource Logic Allocation" />
                  <div className="space-y-5">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
                        Trial Budget (USD / month)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg text-zinc-500">$</span>
                        <input
                          type="number"
                          min={0}
                          value={Number.isFinite(budget) ? budget : ''}
                          onChange={(e) => setBudget(parseFloat(e.target.value))}
                          className="w-full bg-transparent font-mono text-2xl font-semibold text-emerald-300 outline-none placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="500"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[50, 250, 1000, 5000].map((b) => (
                          <button
                            key={b}
                            onClick={() => setBudget(b)}
                            className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
                          >
                            ${b.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {alloc.channels.length === 0 ? (
                      <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 font-mono text-[11px] text-amber-400">
                        ⚠ Enter a budget greater than $0 to compute distribution.
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="font-mono text-[11px] text-zinc-400">
                            STRATEGY LOCK → <span className="font-semibold text-emerald-300">{alloc.strategy}</span>
                          </div>
                          <div className="font-mono text-[11px] text-zinc-400">
                            EST. CPL <span className="text-cyan-400">${alloc.cpl}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {alloc.channels.map((c) => {
                            const amt = (c.pct / 100) * budget;
                            return (
                              <div key={c.name} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                                <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
                                  <span className="text-zinc-300">{c.name}</span>
                                  <span className="text-zinc-400">
                                    <span className="text-emerald-400">${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <span className="text-zinc-600"> · {c.pct}%</span>
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-[width] duration-500" style={{ width: `${c.pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Stat label="Total Deploy" value={`$${budget.toLocaleString()}`} />
                          <Stat label="Proj. Leads" value={`${Math.floor(budget / alloc.cpl).toLocaleString()}`} />
                          <Stat label="Channels" value={`${alloc.channels.length}`} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- Checkout panel ---------------- */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100">
                    Unlock Full Intelligence Export
                  </h2>
                </div>
                <div className="hidden font-mono text-[10px] text-zinc-500 sm:block">
                  {wallet ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {shortAddr}
                    </span>
                  ) : (
                    <span className="text-zinc-600">wallet: disconnected</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TIERS.map((t) => {
                  const active = selectedTier === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      className={[
                        'group relative rounded-lg border p-4 text-left transition',
                        t.featured
                          ? active
                            ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/40'
                            : 'border-emerald-400/40 bg-emerald-400/5 hover:border-emerald-400'
                          : active
                          ? 'border-cyan-400/60 bg-zinc-950 ring-1 ring-cyan-400/30'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700',
                      ].join(' ')}
                    >
                      {t.featured && (
                        <div className="absolute -top-2 left-4 rounded-full border border-emerald-400/40 bg-zinc-950 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-emerald-400">
                          Best Value
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[9px] uppercase tracking-widest ${t.featured ? 'text-emerald-400/70' : 'text-zinc-500'}`}>
                          {t.tag}
                        </span>
                        {active && <Check className={`h-3.5 w-3.5 ${t.featured ? 'text-emerald-400' : 'text-cyan-400'}`} />}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className={`font-mono text-2xl font-bold ${t.featured ? 'text-emerald-300' : 'text-zinc-100'}`}>
                          ${t.price}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-600">≈ {fmtTon(tonFor(t.price))} TON</span>
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-medium text-zinc-300">{t.name}</div>
                      <ul className="mt-3 space-y-1">
                        {t.perks.map((p) => (
                          <li key={p} className="flex items-start gap-1.5 font-mono text-[10px] leading-relaxed text-zinc-500">
                            <Check className={`mt-0.5 h-2.5 w-2.5 shrink-0 ${t.featured ? 'text-emerald-400/70' : 'text-zinc-600'}`} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {/* action bar */}
              <div className="mt-5 flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-mono text-[11px] text-zinc-500">
                  {paid ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Payment settled on-chain · export unlocked
                    </span>
                  ) : (
                    <span>
                      Selected: <span className="text-zinc-300">{tier.name}</span> ·{' '}
                      <span className="text-emerald-400">${tier.price}</span>{' '}
                      <span className="text-zinc-600">(≈ {tonLabel} TON)</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!paid ? (
                    <button
                      onClick={openSheet}
                      disabled={!report}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      Pay with TON
                    </button>
                  ) : null}

                  <button
                    onClick={download}
                    disabled={!paid || !report}
                    className={[
                      'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition',
                      paid && report
                        ? 'border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20'
                        : 'cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-600',
                    ].join(' ')}
                  >
                    {paid ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {paid ? 'Download .md' : 'Locked'}
                    {paid && <Download className="h-3.5 w-3.5" />}
                  </button>

                  {(report || paid) && (
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-5 font-mono text-[10px] text-zinc-600">
          <span>© {new Date().getFullYear()} LEXCONV · GTM Intelligence Terminal</span>
          {report && <span>SESSION {report.sessionId}</span>}
        </footer>
      </main>

      {/* ---------------------------------------------------------- */}
      {/* TON payment sheet                                          */}
      {/* ---------------------------------------------------------- */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl border border-zinc-800 bg-zinc-900 p-6 sm:rounded-2xl">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
                <Wallet className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-mono text-[13px] font-semibold text-zinc-100">Confirm Payment</div>
                <div className="font-mono text-[10px] text-zinc-500">TON · on-chain settlement</div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="text-zinc-400">{tier.name}</span>
                <span className="text-zinc-200">${tier.price}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 font-mono text-[12px]">
                <span className="text-zinc-400">Total due</span>
                <span className="font-semibold text-emerald-300">{tonLabel} TON</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 font-mono text-[11px]">
                <span className="text-zinc-500">Wallet</span>
                <span className={wallet ? 'text-cyan-400' : 'text-zinc-600'}>
                  {wallet ? shortAddr : 'not connected'}
                </span>
              </div>
            </div>

            {payError && (
              <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[10px] leading-relaxed text-red-400">
                {payError}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setSheetOpen(false)}
                disabled={processingPay}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400 transition hover:text-zinc-200 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmPay}
                disabled={processingPay}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/15 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-400/25 disabled:opacity-60"
              >
                {processingPay ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirm in wallet…
                  </>
                ) : !wallet ? (
                  <>
                    <Wallet className="h-3.5 w-3.5" /> Connect Wallet
                  </>
                ) : (
                  <>
                    <Wallet className="h-3.5 w-3.5" /> Pay {tonLabel} TON
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-center font-mono text-[9px] leading-relaxed text-zinc-600">
              Broadcasts a real transfer via your connected TON wallet. Set RECIPIENT_ADDRESS to your
              Tonkeeper address before going live.
            </p>
          </div>
        </div>
      )}

      {/* component-scoped styles */}
      <style jsx global>{`
        .intake {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #27272a;
          background-color: #09090b;
          padding: 0.625rem 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          color: #e4e4e7;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .intake::placeholder {
          color: #52525b;
        }
        .intake:focus {
          border-color: rgba(52, 211, 153, 0.5);
          box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.08);
        }
        /* keep the TON connect button snug in the header */
        .ton-connect-btn {
          display: inline-flex;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">{label}</label>
        {hint && <span className="font-mono text-[9px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest transition sm:text-[11px]',
        active ? 'bg-zinc-950 text-emerald-400 ring-1 ring-emerald-400/20' : 'text-zinc-500 hover:text-zinc-300',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center">
      <div className="font-mono text-lg font-bold text-emerald-300">{value}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

function RingScore({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const tone = value >= 85 ? '#34d399' : value >= 70 ? '#22d3ee' : '#fbbf24';
  return (
    <div className="relative h-24 w-24">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold" style={{ color: tone }}>
          {value}
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown report compiler                                          */
/* ------------------------------------------------------------------ */

function compileMarkdown(r: Report, budget: number, alloc: Allocation, tier: Tier): string {
  const line = '─'.repeat(52);
  const metricLines = r.metrics.map((m) => `- **${m.label}:** ${m.value}/100`).join('\n');
  const hookLines = r.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n');
  const funnelLines = r.funnel
    .map((f) => `### ${f.stage} — ${f.label}\n- **Action:** ${f.action}\n- **KPI:** ${f.kpi}`)
    .join('\n\n');
  const outreachLines = r.outreach
    .map((o) => `### ${o.channel}\n> ${o.subject}\n\n\`\`\`\n${o.body}\n\`\`\``)
    .join('\n\n');
  const allocLines = alloc.channels
    .map((c) => {
      const amt = (c.pct / 100) * budget;
      return `| ${c.name} | ${c.pct}% | $${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })} |`;
    })
    .join('\n');

  return `# GTM INTELLIGENCE REPORT
${line}
**Brand:** ${r.brand}
**Offer:** ${r.offer}
**Segment:** ${r.segment}
**Session:** ${r.sessionId}
**Generated:** ${new Date(r.generatedAt).toLocaleString()}
**License:** ${tier.name} ($${tier.price} · ${fmtTon(tonFor(tier.price))} TON)
${line}

## 01 · Narrative Alignment Core

**Composite Alignment Score: ${r.overall}/100**

${metricLines}

**Core message analyzed:**
> ${r.message}

---

## 02 · Conversion Blueprint Engine

### Structured Funnel

${funnelLines}

### Headline Hooks

${hookLines}

### Automated Outreach Templates

${outreachLines}

---

## 03 · Resource Logic Allocation

**Strategy Lock:** ${alloc.strategy}
**Monthly Budget:** $${budget.toLocaleString()}
**Estimated CPL:** $${alloc.cpl}
**Projected Leads:** ${Math.floor(budget / alloc.cpl).toLocaleString()}

| Channel | Allocation | Monthly Spend |
|---------|-----------|---------------|
${allocLines}

${line}
Generated by LEXCONV // GTM Terminal — instruments of lasting impact.
`;
}
