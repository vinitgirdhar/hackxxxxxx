import { motion } from "framer-motion";
import {
  Users, PhoneCall, ArrowRight, ArrowUpRight, Flame, Target,
  BarChart3, Gem, Mic, Plus, Send, RefreshCw, Zap, Sparkles,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

// ─── Fade-up animation helper ─────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── Mock data ────────────────────────────────────────────────────
const mockOverview = {
  totalLeads: 1247,
  callsInitiated: 990,
  hotLeads: 312,
  warmLeads: 489,
  coldLeads: 446,
  conversionRate: 34.7,
};

const mockLeads = [
  { id: '1', name: 'Priya Menon',  phone: '+91 98765 43210', score: 9.1, bucket: 'HOT',  status: 'COMPLETED' },
  { id: '2', name: 'Arjun Sharma', phone: '+91 87654 32109', score: 8.5, bucket: 'HOT',  status: 'COMPLETED' },
  { id: '3', name: 'Neha Kapoor',  phone: '+91 76543 21098', score: 6.2, bucket: 'WARM', status: 'COMPLETED' },
  { id: '4', name: 'Rohit Verma',  phone: '+91 65432 10987', score: 4.8, bucket: 'WARM', status: 'CALLING'   },
  { id: '5', name: 'Anjali Singh', phone: '+91 54321 09876', score: 2.1, bucket: 'COLD', status: 'COMPLETED' },
  { id: '6', name: 'Vikram Nair',  phone: '+91 43210 98765', score: null, bucket: null,  status: 'PENDING'   },
  { id: '7', name: 'Kavya Reddy',  phone: '+91 32109 87654', score: 7.3, bucket: 'HOT',  status: 'COMPLETED' },
];

const mockFunnel = {
  stages: [
    { name: 'Leads Imported',   count: 1247, percentage: 100 },
    { name: 'Calls Attempted',  count: 990,  percentage: 79  },
    { name: 'Calls Connected',  count: 743,  percentage: 60  },
    { name: 'Qualified',        count: 433,  percentage: 35  },
    { name: 'HOT Leads',        count: 312,  percentage: 25  },
  ],
};

// ─── Color maps ───────────────────────────────────────────────────
const bucketColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOT:  { bg: "rgba(31,138,112,0.1)",  text: "#1F8A70", border: "rgba(31,138,112,0.25)",  dot: "#1F8A70"  },
  WARM: { bg: "rgba(212,175,55,0.1)",  text: "#A67C2E", border: "rgba(212,175,55,0.25)",  dot: "#D4AF37"  },
  COLD: { bg: "rgba(100,116,139,0.08)",text: "#64748B", border: "rgba(100,116,139,0.2)",  dot: "#94A3B8"  },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(31,138,112,0.08)",  text: "#1F8A70" },
  CALLING:   { bg: "rgba(212,175,55,0.08)",  text: "#A67C2E" },
  FAILED:    { bg: "rgba(239,68,68,0.08)",   text: "#DC2626" },
  PENDING:   { bg: "rgba(100,116,139,0.08)", text: "#64748B" },
};

const funnelColors = ["#1F8A70", "#D4AF37", "#0F3D3E", "#E6C76E", "#A67C2E"];

const cards = [
  { key: "totalLeads",     label: "Total Leads", icon: Users,     color: "#0F3D3E", bg: "linear-gradient(135deg,rgba(15,61,62,0.06),rgba(15,61,62,0.01))",     border: "rgba(15,61,62,0.15)",   iconBg: "rgba(15,61,62,0.07)",   trend: "+12%",    sparkData: [18,22,19,28,25,32,30,38,35,42] },
  { key: "callsInitiated", label: "Calls Made",  icon: PhoneCall, color: "#D4AF37", bg: "linear-gradient(135deg,rgba(212,175,55,0.06),rgba(212,175,55,0.01))",   border: "rgba(212,175,55,0.15)", iconBg: "rgba(212,175,55,0.07)", trend: "+8%",     sparkData: [14,16,20,18,24,22,28,26,30,34] },
  { key: "hotLeads",       label: "Hot Leads",   icon: Flame,     color: "#1F8A70", bg: "linear-gradient(135deg,rgba(31,138,112,0.06),rgba(31,138,112,0.01))",   border: "rgba(31,138,112,0.15)", iconBg: "rgba(31,138,112,0.07)", trend: "+24%",    sparkData: [8,12,10,16,14,20,22,18,26,30]  },
  { key: "conversionRate", label: "Conversion",  icon: Target,    color: "#A67C2E", bg: "linear-gradient(135deg,rgba(166,124,46,0.06),rgba(166,124,46,0.01))",   border: "rgba(166,124,46,0.15)", iconBg: "rgba(166,124,46,0.07)", trend: "+3.2 pts",sparkData: [28,30,29,32,31,34,33,35,34,36] },
];

// ─── Animated counter ─────────────────────────────────────────────
function AnimatedValue({ value, suffix = "" }: { value: number | string | undefined; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const prevRef = useRef(0);

  useEffect(() => {
    if (value === undefined) return;
    const numVal = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numVal)) { setDisplay(String(value)); return; }
    const start = prevRef.current;
    const diff = numVal - start;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / 900, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(Number.isInteger(numVal) ? Math.round(current).toLocaleString() : current.toFixed(1));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prevRef.current = numVal;
  }, [value]);

  return <span className="tabular-nums">{display}{suffix}</span>;
}

// ─── Sparkline ────────────────────────────────────────────────────
function Sparkline({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ");
  const fillD = `M 0,${26 - ((data[0] - min) / range) * 24} ${data.map((v, i) => `L ${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ")} L100,26 L0,26 Z`;
  return (
    <svg viewBox="0 0 100 26" className="w-24 h-8" preserveAspectRatio="none">
      <path d={fillD} fill={color} fillOpacity="0.06" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy={26 - ((data[data.length - 1] - min) / range) * 24} r="3" fill={color} opacity="0.8">
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── 3D Tilt hook ─────────────────────────────────────────────────
function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !innerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    innerRef.current.style.transform = `rotateX(${((y - rect.height / 2) / (rect.height / 2)) * -8}deg) rotateY(${((x - rect.width / 2) / (rect.width / 2)) * 8}deg) scale3d(1.02,1.02,1.02)`;
    const shine = innerRef.current.querySelector('.tilt-shine') as HTMLElement | null;
    if (shine) { shine.style.setProperty('--shine-x', `${x}px`); shine.style.setProperty('--shine-y', `${y}px`); }
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = 'rotateX(0) rotateY(0) scale3d(1,1,1)';
  }, []);
  return { ref, innerRef, handleMouseMove, handleMouseLeave };
}

// ─── Stat Card ────────────────────────────────────────────────────
function TiltStatCard({ card, val, delay }: { card: typeof cards[0]; val: string | number | undefined; delay: number }) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  return (
    <motion.div {...fadeUp(delay)}>
      <div ref={ref} className="tilt-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div ref={innerRef} className="tilt-card-inner stat-card relative p-5 cursor-default rounded-[20px]"
          style={{ background: card.bg, border: `1px solid ${card.border}` }}>
          <div className="tilt-shine rounded-[20px]" />
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none" style={{ background: card.color, opacity: 0.08, filter: "blur(20px)" }} />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="text-[13px] font-medium" style={{ color: "#71717a" }}>{card.label}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.iconBg, border: `1px solid ${card.border}` }}>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight relative z-10" style={{ color: "#09090b" }}>
            {val !== undefined ? <AnimatedValue value={val} suffix={card.key === "conversionRate" ? "%" : ""} /> : <div className="h-8 w-20 shimmer rounded-lg" />}
          </div>
          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg" style={{ backgroundColor: `${card.color}08`, border: `1px solid ${card.color}12` }}>
              <ArrowUpRight className="h-3 w-3" style={{ color: card.color }} />
              <span className="text-[11px] font-bold" style={{ color: card.color }}>{card.trend}</span>
            </div>
            <Sparkline color={card.color} data={card.sparkData} />
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg,transparent,${card.color}20,transparent)` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Animated donut ───────────────────────────────────────────────
function BucketDonut({ hot = 0, warm = 0, cold = 0 }: { hot?: number; warm?: number; cold?: number }) {
  const total = hot + warm + cold || 1;
  const r = 38, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  const hotD = (hot / total) * circ, warmD = (warm / total) * circ, coldD = (cold / total) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="12" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#1F8A70" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${hotD} ${circ}` }}
          transition={{ duration: 1.2, delay: 0.3 }} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#D4AF37" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${warmD} ${circ}` }}
          transition={{ duration: 1.2, delay: 0.5 }} strokeDashoffset={-hotD} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#CBD5E1" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${coldD} ${circ}` }}
          transition={{ duration: 1.2, delay: 0.7 }} strokeDashoffset={-(hotD + warmD)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
          className="text-xl font-bold leading-none tabular-nums">{total}</motion.div>
        <div className="text-[9px] mt-0.5 font-medium" style={{ color: "#71717a" }}>total</div>
      </div>
    </div>
  );
}

// ─── Live Call Simulator ──────────────────────────────────────────
function LiveCallSimulator() {
  const [isCalling, setIsCalling] = useState(false);
  return (
    <div className="premium-card p-6 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: isCalling ? "#1F8A70" : "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <PhoneCall className={`w-6 h-6 ${isCalling ? "text-white animate-bounce" : ""}`} style={{ color: isCalling ? "white" : "#94a3b8" }} />
            </div>
            {isCalling && [1, 2, 3].map(i => (
              <div key={i} className="absolute inset-0 rounded-2xl animate-ping" style={{ backgroundColor: "#1F8A70", opacity: 0.2, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: "#09090b" }}>{isCalling ? "Active Intelligence" : "Sarvam Engine"}</div>
            <div className="text-[10px] font-medium uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#71717a" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isCalling ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              {isCalling ? "Synthesizing Response" : "Ready for deployment"}
            </div>
          </div>
        </div>
        <motion.button onClick={() => setIsCalling(!isCalling)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`px-5 py-2 text-xs font-bold shadow-lg ${isCalling ? "bg-zinc-900 text-white rounded-xl" : "btn-royal rounded-xl"}`}>
          {isCalling ? "Terminate" : "Simulate Call"}
        </motion.button>
      </div>
      <div className="relative h-16 bg-black/5 rounded-2xl flex items-center justify-center gap-1 px-4 overflow-hidden border border-black/5">
        {!isCalling ? (
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.2)" }}>Standing by...</div>
        ) : (
          [...Array(32)].map((_, i) => {
            const h = 15 + Math.random() * 35;
            return (
              <motion.div key={i} animate={{ height: [h, h * 0.4, h * 1.2, h] }}
                transition={{ duration: 0.6 + Math.random() * 0.8, repeat: Infinity }}
                className="w-1 rounded-full" style={{ backgroundColor: i % 2 === 0 ? "#1F8A70" : "#D4AF37", opacity: 0.6 }} />
            );
          })
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[10px] flex items-center gap-1.5" style={{ color: "#71717a" }}>
          <Mic className="w-3 h-3" /> Neural Latency: <span className="font-mono" style={{ color: "#09090b" }}>240ms</span>
        </div>
        <div className="text-[10px] flex items-center gap-1.5" style={{ color: "#71717a" }}>
          <Sparkles className="w-3 h-3" style={{ color: "#D4AF37" }} /> Confidence: <span className="font-bold" style={{ color: "#09090b" }}>98.2%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { icon: Plus,      label: "Add Lead",  color: "#1F8A70", bg: "rgba(31,138,112,0.08)"  },
    { icon: Send,      label: "Export",    color: "#D4AF37", bg: "rgba(212,175,55,0.08)"  },
    { icon: RefreshCw, label: "Sync CRM",  color: "#0F3D3E", bg: "rgba(15,61,62,0.08)"   },
    { icon: Zap,       label: "Run Batch", color: "#A67C2E", bg: "rgba(166,124,46,0.08)" },
  ];
  return (
    <div className="premium-card p-5 h-full">
      <div className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "#09090b" }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
        Quick Toolkit
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, i) => (
          <motion.button key={i} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl border depth-shadow-sm group relative overflow-hidden"
            style={{ backgroundColor: "white", borderColor: "rgba(0,0,0,0.07)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:rotate-12"
              style={{ backgroundColor: act.bg, border: `1px solid ${act.color}15` }}>
              <act.icon className="w-5 h-5" style={{ color: act.color }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color: "#71717a" }}>{act.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
          <motion.div {...fadeUp(0)}>
            <h1 className="text-3xl font-serif text-zinc-950 tracking-tight">Good morning 👋</h1>
            <p className="text-sm mt-1" style={{ color: "#71717a" }}>Real-time lead qualification performance.</p>
          </motion.div>

          {/* Ornament divider */}
          <motion.div {...fadeUp(0.05)} className="ornament-line text-[10px] font-medium tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.35)" }}>
            <Gem className="w-3 h-3" style={{ color: "rgba(212,175,55,0.3)" }} />
          </motion.div>

          {/* Stat cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => {
              const val = card.key === "conversionRate"
                ? mockOverview.conversionRate.toFixed(1)
                : (mockOverview as Record<string, number>)[card.key];
              return <TiltStatCard key={card.key} card={card} val={val} delay={0.08 + i * 0.06} />;
            })}
          </div>

          {/* Live call + quick actions */}
          <div className="grid gap-5 lg:grid-cols-5">
            <motion.div {...fadeUp(0.25)} className="lg:col-span-3"><LiveCallSimulator /></motion.div>
            <motion.div {...fadeUp(0.3)} className="lg:col-span-2"><QuickActions /></motion.div>
          </div>

          {/* Main 2-col grid */}
          <div className="grid gap-5 lg:grid-cols-3">

            {/* Recent Activity */}
            <motion.div {...fadeUp(0.35)} className="lg:col-span-2 premium-card">
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2" style={{ color: "#09090b" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(31,138,112,0.08)" }}>
                      <BarChart3 className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
                    </div>
                    Recent Activity
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>Latest leads through the pipeline</div>
                </div>
              </div>

              {mockLeads.map((lead, i) => {
                const bc = bucketColors[lead.bucket ?? ""] ?? bucketColors.COLD;
                const sc = statusColors[lead.status] ?? statusColors.PENDING;
                return (
                  <motion.div key={lead.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(0.1 + i * 0.05, 0.35) }}
                    className="activity-row flex items-center justify-between px-6 py-3.5 group cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.3)" }}>
                        {lead.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: "#09090b" }}>{lead.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono" style={{ color: "#71717a" }}>{lead.phone}</span>
                          {lead.score != null && (
                            <>
                              <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
                              <span className="text-[10px] font-bold tabular-nums" style={{ color: lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8" }}>
                                {lead.score.toFixed(1)}/10
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {lead.bucket && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: bc.dot }} />
                          {lead.bucket}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {lead.status}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#71717a" }} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Lead Distribution */}
              <motion.div {...fadeUp(0.45)} className="premium-card">
                <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="font-semibold text-sm flex items-center gap-2" style={{ color: "#09090b" }}>
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
                    Lead Distribution
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>Current bucket breakdown</div>
                </div>
                <div className="p-5 flex items-center gap-5">
                  <BucketDonut hot={mockOverview.hotLeads} warm={mockOverview.warmLeads} cold={mockOverview.coldLeads} />
                  <div className="space-y-3 flex-1">
                    {[
                      { label: "Hot",  value: mockOverview.hotLeads,  color: "#1F8A70", pct: Math.round((mockOverview.hotLeads  / (mockOverview.hotLeads + mockOverview.warmLeads + mockOverview.coldLeads)) * 100) },
                      { label: "Warm", value: mockOverview.warmLeads, color: "#D4AF37", pct: Math.round((mockOverview.warmLeads / (mockOverview.hotLeads + mockOverview.warmLeads + mockOverview.coldLeads)) * 100) },
                      { label: "Cold", value: mockOverview.coldLeads, color: "#CBD5E1", pct: Math.round((mockOverview.coldLeads / (mockOverview.hotLeads + mockOverview.warmLeads + mockOverview.coldLeads)) * 100) },
                    ].map(b => (
                      <div key={b.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                            <span className="text-xs font-medium" style={{ color: "#71717a" }}>{b.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tabular-nums" style={{ color: b.color }}>{b.value}</span>
                            <span className="text-[10px] font-mono w-7 text-right" style={{ color: "#71717a" }}>{b.pct}%</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${b.color}10` }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full" style={{ backgroundColor: b.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Funnel */}
              <motion.div {...fadeUp(0.5)} className="premium-card">
                <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="font-semibold text-sm flex items-center gap-2" style={{ color: "#09090b" }}>
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
                    Funnel Overview
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>Stage-by-stage conversion</div>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {mockFunnel.stages.map((stage, idx) => {
                    const color = funnelColors[idx % funnelColors.length];
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium" style={{ color: "#71717a" }}>{stage.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tabular-nums" style={{ color: "#09090b" }}>{stage.count}</span>
                            <span className="text-[10px] font-mono w-8 text-right" style={{ color: "#71717a" }}>{stage.percentage}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}10` }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${stage.percentage}%` }}
                            transition={{ duration: 1.2, delay: 0.5 + idx * 0.12 }}
                            className="h-full rounded-full" style={{ backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
