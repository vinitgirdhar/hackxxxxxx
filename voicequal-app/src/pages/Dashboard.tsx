import { motion, AnimatePresence } from "framer-motion";
import {
  Users, PhoneCall, ArrowRight, Flame, Target,
  BarChart3, Gem, RefreshCw, Zap, Sparkles,
  Search, Volume2, Clock, CalendarDays,
  ArrowUpRight, Building2, Mail, ChevronDown,
  TrendingUp, Star, CheckCircle2, AlertCircle,
  DollarSign, Tag, MoreHorizontal, Plus,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { triggerCall } from "../api/triggerCall";
import { MOCK_CALLS } from "../lib/mockCalls";

// ElevenLabs API key
const ELEVENLABS_API_KEY = "f86cd3c5c5c32a9b951409b35041b6bb83e73a5b7e711db8f783babbeb94f103";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type Overview = {
  totalLeads: number; callsInitiated: number; hotLeads: number;
  warmLeads: number; coldLeads: number; conversionRate: number; topScore: number;
};
type LiveLead = {
  id: string; name: string; score: number | null; bucket: string | null;
  status: string; company: string; recording?: string;
};

function mapDbStatus(s: string) {
  if (s === 'done') return 'COMPLETED';
  if (s === 'initiated' || s === 'in_progress') return 'CALLING';
  if (s === 'failed') return 'FAILED';
  return 'PENDING';
}

const bucketColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOT:  { bg: "rgba(31,138,112,0.1)",   text: "#1F8A70", border: "rgba(31,138,112,0.25)", dot: "#1F8A70" },
  WARM: { bg: "rgba(212,175,55,0.1)",   text: "#A67C2E", border: "rgba(212,175,55,0.25)", dot: "#D4AF37" },
  COLD: { bg: "rgba(100,116,139,0.08)", text: "#64748B", border: "rgba(100,116,139,0.2)", dot: "#94A3B8" },
};
const statusColors: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(31,138,112,0.08)", text: "#1F8A70" },
  CALLING:   { bg: "rgba(212,175,55,0.08)", text: "#A67C2E" },
  FAILED:    { bg: "rgba(239,68,68,0.08)",  text: "#DC2626" },
  PENDING:   { bg: "rgba(100,116,139,0.08)",text: "#64748B" },
};

const cards = [
  { key: "totalLeads",    label: "Total Calls",  icon: Users,     color: "#0F3D3E", bg: "linear-gradient(135deg,rgba(15,61,62,0.07),rgba(15,61,62,0.02))",     border: "rgba(15,61,62,0.15)",    iconBg: "rgba(15,61,62,0.08)",    trend: "+12%",  sparkData: [4,6,5,8,7,9,8,10,9,12] },
  { key: "callsInitiated",label: "Calls Done",   icon: PhoneCall, color: "#D4AF37", bg: "linear-gradient(135deg,rgba(212,175,55,0.07),rgba(212,175,55,0.02))", border: "rgba(212,175,55,0.15)",  iconBg: "rgba(212,175,55,0.08)",  trend: "+8%",   sparkData: [3,5,4,7,6,8,7,9,8,11] },
  { key: "hotLeads",      label: "Hot Leads",    icon: Flame,     color: "#1F8A70", bg: "linear-gradient(135deg,rgba(31,138,112,0.07),rgba(31,138,112,0.02))", border: "rgba(31,138,112,0.15)",  iconBg: "rgba(31,138,112,0.08)",  trend: "+23%",  sparkData: [1,2,3,3,4,5,5,7,6,8] },
  { key: "conversionRate",label: "Conv. Rate",   icon: Target,    color: "#A67C2E", bg: "linear-gradient(135deg,rgba(166,124,46,0.07),rgba(166,124,46,0.02))",  border: "rgba(166,124,46,0.15)",  iconBg: "rgba(166,124,46,0.08)",  trend: "+5%",   sparkData: [10,12,11,14,13,15,14,16,15,18] },
];

// ─── useTilt3D ────────────────────────────────────────────────────────────
function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !innerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    innerRef.current.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = '';
  }, []);
  return { ref, innerRef, handleMouseMove, handleMouseLeave };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KPICard({ card, value }: { card: typeof cards[0]; value: number }) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  const fmt = (v: number) => card.key === 'conversionRate' ? `${v.toFixed(1)}%` : v.toLocaleString();
  const maxSpark = Math.max(...card.sparkData, 1);
  return (
    <motion.div ref={ref} className="tilt-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...fadeUp(0.05)}>
      <div ref={innerRef} className="premium-card p-5 relative overflow-hidden cursor-default h-full" style={{ background: card.bg, border: `1px solid ${card.border}`, transition: 'transform 0.15s ease-out' }}>
        <div className="tilt-shine rounded-[20px]" />
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.iconBg, border: `1px solid ${card.border}` }}>
            <card.icon className="w-5 h-5" style={{ color: card.color }} />
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
            <ArrowUpRight className="w-2.5 h-2.5" /> {card.trend}
          </span>
        </div>
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="text-3xl font-black leading-none tabular-nums mb-1 relative z-10" style={{ color: "#09090b" }}>
          {fmt(value)}
        </motion.div>
        <div className="text-[11px] font-bold uppercase tracking-widest relative z-10" style={{ color: "#94a3b8" }}>{card.label}</div>
        <div className="mt-3 h-8 flex items-end gap-[2px] relative z-10">
          {card.sparkData.map((v, i) => (
            <motion.div key={i} className="flex-1 rounded-t-sm" initial={{ height: 0 }} animate={{ height: `${(v / maxSpark) * 100}%` }} transition={{ duration: 0.6, delay: 0.4 + i * 0.03, ease: [0.16,1,0.3,1] }} style={{ backgroundColor: card.color, opacity: 0.25 + (i / card.sparkData.length) * 0.55 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────
function BucketDonut({ hot = 0, warm = 0, cold = 0 }: { hot?: number; warm?: number; cold?: number }) {
  const total = hot + warm + cold || 1;
  const r = 42, cx = 52, cy = 52, circ = 2 * Math.PI * r;
  const hotD = (hot / total) * circ, warmD = (warm / total) * circ, coldD = (cold / total) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="104" height="104" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#1F8A70" strokeWidth="10" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${hotD} ${circ}` }} transition={{ duration: 1.4, delay: 0.3, ease: [0.16,1,0.3,1] }} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#D4AF37" strokeWidth="10" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${warmD} ${circ}` }} transition={{ duration: 1.4, delay: 0.5, ease: [0.16,1,0.3,1] }} strokeDashoffset={-hotD} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#CBD5E1" strokeWidth="10" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${coldD} ${circ}` }} transition={{ duration: 1.4, delay: 0.7, ease: [0.16,1,0.3,1] }} strokeDashoffset={-(hotD + warmD)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.6, type:"spring", stiffness:300 }}
          className="text-2xl font-black leading-none tabular-nums" style={{ color:"#09090b" }}>{total.toLocaleString()}</motion.div>
        <div className="text-[9px] mt-0.5 font-bold uppercase tracking-widest" style={{ color:"#94a3b8" }}>total</div>
      </div>
    </div>
  );
}

// ─── Conversion Funnel ────────────────────────────────────────────────────
function ConversionFunnel({ total, completed, hot }: { total: number; completed: number; hot: number }) {
  const stages = [
    { label: "Total Calls", value: total, color: "#0F3D3E" },
    { label: "Completed", value: completed, color: "#D4AF37" },
    { label: "Hot Leads", value: hot, color: "#1F8A70" },
  ];
  const maxVal = Math.max(total, 1);
  return (
    <div className="flex flex-col gap-3">
      {stages.map((s, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{s.label}</span>
            <span className="text-xs font-black tabular-nums" style={{ color: "#09090b" }}>{s.value}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.04)" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / maxVal) * 100}%` }}
              transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: s.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CRM Data ────────────────────────────────────────────────────────────
type CRMContact = {
  id: string; name: string; company: string; email: string;
  deal: number; stage: string; score: number; label: "HOT" | "WARM" | "COLD";
  lastCall: string; tags: string[];
};

const CRM_STAGES = ["Contacted", "Qualified", "Proposal", "Negotiation", "Closed"];

const CRM_DATA: CRMContact[] = [
  { id:"c1",  name:"Rajesh Kumar",   company:"TechSoft Solutions",   email:"rajesh@techsoft.in",    deal:480000, stage:"Negotiation", score:8.5, label:"HOT",  lastCall:"Today, 9:15 AM",  tags:["SaaS","Enterprise"] },
  { id:"c2",  name:"Priya Sharma",   company:"FinEdge Capital",      email:"priya@finedge.com",     deal:320000, stage:"Proposal",    score:7.8, label:"HOT",  lastCall:"Today, 9:48 AM",  tags:["Fintech"] },
  { id:"c3",  name:"Sunita Verma",   company:"HealthBridge Pvt Ltd", email:"sunita@healthbridge.in",deal:760000, stage:"Closed",      score:9.0, label:"HOT",  lastCall:"Today, 10:55 AM", tags:["Healthcare","Urgent"] },
  { id:"c4",  name:"Siddharth Roy",  company:"NeoFinance Ltd",       email:"sid@neofinance.com",    deal:540000, stage:"Negotiation", score:8.8, label:"HOT",  lastCall:"Today, 3:20 PM",  tags:["Fintech","Series B"] },
  { id:"c5",  name:"Manish Patel",   company:"GreenEnergy Corp",     email:"manish@greenenergy.co", deal:920000, stage:"Closed",      score:9.2, label:"HOT",  lastCall:"Today, 2:00 PM",  tags:["Energy","Capex"] },
  { id:"c6",  name:"Aarav Mehta",    company:"LogiTrack India",      email:"aarav@logitrack.in",    deal:210000, stage:"Qualified",   score:5.5, label:"WARM", lastCall:"Today, 10:22 AM", tags:["Logistics"] },
  { id:"c7",  name:"Deepika Joshi",  company:"EduPrime Network",     email:"deepika@eduprime.in",   deal:180000, stage:"Proposal",    score:6.2, label:"WARM", lastCall:"Today, 12:05 PM", tags:["EdTech"] },
  { id:"c8",  name:"Vikram Singh",   company:"AutoParts Direct",     email:"vikram@autoparts.in",   deal:390000, stage:"Qualified",   score:8.0, label:"HOT",  lastCall:"Today, 12:40 PM", tags:["Auto","Fleet"] },
  { id:"c9",  name:"Ritu Agarwal",   company:"MediScan Diagnostics", email:"ritu@mediscan.in",      deal:270000, stage:"Proposal",    score:6.8, label:"WARM", lastCall:"Today, 2:45 PM",  tags:["Healthcare"] },
  { id:"c10", name:"Arjun Kapoor",   company:"SmartCity Infra",      email:"arjun@smartcity.gov.in",deal:1200000,stage:"Qualified",   score:5.8, label:"WARM", lastCall:"Today, 4:40 PM",  tags:["Govt","Infra"] },
  { id:"c11", name:"Neha Gupta",     company:"InsureMax Digital",    email:"neha@insuremax.com",    deal:145000, stage:"Negotiation", score:7.5, label:"HOT",  lastCall:"Today, 5:15 PM",  tags:["Insurance"] },
  { id:"c12", name:"Ananya Bose",    company:"CloudServe Tech",      email:"ananya@cloudserve.io",  deal:95000,  stage:"Contacted",   score:3.2, label:"COLD", lastCall:"Today, 1:15 PM",  tags:["Cloud"] },
];

function fmtInr(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

function CRMPanel({ panelRef }: { panelRef?: React.RefObject<HTMLDivElement> }) {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = CRM_DATA.filter(c => {
    const matchStage = !activeStage || c.stage === activeStage;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const stageCounts = CRM_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = CRM_DATA.filter(c => c.stage === s).length;
    return acc;
  }, {});

  const stageValues = CRM_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = CRM_DATA.filter(c => c.stage === s).reduce((sum, c) => sum + c.deal, 0);
    return acc;
  }, {});

  const totalPipeline = CRM_DATA.reduce((s, c) => s + c.deal, 0);
  const closedValue   = CRM_DATA.filter(c => c.stage === "Closed").reduce((s, c) => s + c.deal, 0);

  const STAGE_COLORS: Record<string, string> = {
    Contacted:   "#94a3b8",
    Qualified:   "#3B82F6",
    Proposal:    "#D4AF37",
    Negotiation: "#F97316",
    Closed:      "#1F8A70",
  };

  const labelColor = (l: string) =>
    l === "HOT" ? "#1F8A70" : l === "WARM" ? "#D4AF37" : "#94a3b8";

  return (
    <motion.div ref={panelRef} {...fadeUp(0.2)} className="premium-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(212,175,55,0.02)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>
              CRM Pipeline
            </div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>
              {CRM_DATA.length} contacts · {fmtInr(totalPipeline)} pipeline · {fmtInr(closedValue)} closed
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none"
              style={{ borderColor: "rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.02)", color: "#09090b", width: 160 }} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
            <Plus className="w-3 h-3" /> Add Contact
          </button>
        </div>
      </div>

      {/* Pipeline stage bar */}
      <div className="px-6 py-3 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.01)" }}>
        <button onClick={() => setActiveStage(null)}
          className="text-[10px] font-black px-3 py-1 rounded-full transition-all"
          style={{ background: !activeStage ? "rgba(15,61,62,0.1)" : "transparent", color: !activeStage ? "#0F3D3E" : "#94a3b8", border: `1px solid ${!activeStage ? "rgba(15,61,62,0.2)" : "transparent"}` }}>
          All ({CRM_DATA.length})
        </button>
        {CRM_STAGES.map(s => (
          <button key={s} onClick={() => setActiveStage(activeStage === s ? null : s)}
            className="text-[10px] font-black px-3 py-1 rounded-full transition-all flex items-center gap-1.5"
            style={{
              background: activeStage === s ? `${STAGE_COLORS[s]}15` : "transparent",
              color: activeStage === s ? STAGE_COLORS[s] : "#94a3b8",
              border: `1px solid ${activeStage === s ? `${STAGE_COLORS[s]}30` : "transparent"}`,
            }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_COLORS[s] }} />
            {s} <span className="opacity-70">({stageCounts[s]})</span>
            <span className="ml-0.5 opacity-60">{fmtInr(stageValues[s])}</span>
          </button>
        ))}
      </div>

      {/* Pipeline progress bar */}
      <div className="px-6 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="h-2 rounded-full overflow-hidden flex gap-0.5" style={{ background: "rgba(0,0,0,0.04)" }}>
          {CRM_STAGES.map(s => {
            const pct = (stageValues[s] / totalPipeline) * 100;
            return (
              <motion.div key={s} initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                title={`${s}: ${fmtInr(stageValues[s])}`}
                className="h-full rounded-full" style={{ background: STAGE_COLORS[s], minWidth: pct > 0 ? 4 : 0 }} />
            );
          })}
        </div>
        <div className="flex gap-4 mt-1.5">
          {CRM_STAGES.map(s => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_COLORS[s] }} />
              <span className="text-[9px] font-bold" style={{ color: "#94a3b8" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.01)" }}>
              {["Contact", "Stage", "Deal Value", "BANT", "Last Call", "Tags", ""].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const sc = STAGE_COLORS[c.stage] ?? "#94a3b8";
              const lc = labelColor(c.label);
              const isExp = expanded === c.id;
              return (
                <>
                  <motion.tr key={c.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setExpanded(isExp ? null : c.id)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: isExp ? "rgba(31,138,112,0.03)" : undefined }}>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: `linear-gradient(135deg,${lc},${lc}88)` }}>
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-black" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{c.name}</div>
                          <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#94a3b8" }}>
                            <Building2 className="w-2.5 h-2.5" />{c.company}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}25` }}>
                        {c.stage}
                      </span>
                    </td>

                    {/* Deal */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-black tabular-nums" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>
                        {fmtInr(c.deal)}
                      </div>
                    </td>

                    {/* BANT score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-7 h-7">
                          <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                            <motion.circle cx="14" cy="14" r="10" fill="none" stroke={lc} strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: `0 ${2 * Math.PI * 10}` }}
                              animate={{ strokeDasharray: `${(c.score / 10) * 2 * Math.PI * 10} ${2 * Math.PI * 10}` }}
                              transition={{ duration: 1, delay: i * 0.05 }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-black" style={{ color: lc }}>{c.score}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: `${lc}12`, color: lc }}>{c.label}</span>
                      </div>
                    </td>

                    {/* Last call */}
                    <td className="px-4 py-3">
                      <div className="text-[10px] font-medium flex items-center gap-1" style={{ color: "#71717a" }}>
                        <Clock className="w-2.5 h-2.5 shrink-0" />{c.lastCall}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map(t => (
                          <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: "rgba(212,175,55,0.08)", color: "#A67C2E", border: "1px solid rgba(212,175,55,0.15)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Expand */}
                    <td className="px-4 py-3">
                      <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                      </motion.div>
                    </td>
                  </motion.tr>

                  {/* Expanded detail row */}
                  <AnimatePresence>
                    {isExp && (
                      <tr key={`${c.id}-exp`}>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            className="overflow-hidden">
                            <div className="px-6 py-4 grid grid-cols-4 gap-4"
                              style={{ background: "rgba(31,138,112,0.03)", borderBottom: "1px solid rgba(31,138,112,0.08)" }}>
                              {/* Email */}
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Email</div>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 shrink-0" style={{ color: "#1F8A70" }} />
                                  <span className="text-xs font-medium" style={{ color: "#09090b" }}>{c.email}</span>
                                </div>
                              </div>
                              {/* Deal size */}
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Deal Value</div>
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="w-3 h-3 shrink-0" style={{ color: "#D4AF37" }} />
                                  <span className="text-sm font-black" style={{ color: "#09090b" }}>₹{c.deal.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              {/* BANT breakdown */}
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>BANT Score</div>
                                <div className="flex items-center gap-2">
                                  {["B","A","N","T"].map((k, idx) => {
                                    const vals = [
                                      Math.round(c.score * 0.9 + Math.random()),
                                      Math.round(c.score * 1.05),
                                      Math.round(c.score * 0.95),
                                      Math.round(c.score * 0.88 + 0.5),
                                    ];
                                    const v = Math.min(10, vals[idx]);
                                    return (
                                      <div key={k} className="flex flex-col items-center">
                                        <span className="text-[8px] font-black" style={{ color: labelColor(c.label) }}>{k}</span>
                                        <span className="text-[10px] font-black" style={{ color: "#09090b" }}>{v}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* Actions */}
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Actions</div>
                                <div className="flex gap-2">
                                  <button className="text-[10px] font-black px-2.5 py-1 rounded-lg"
                                    style={{ background: "rgba(31,138,112,0.1)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.2)" }}>
                                    Call Again
                                  </button>
                                  <button className="text-[10px] font-black px-2.5 py-1 rounded-lg"
                                    style={{ background: "rgba(212,175,55,0.1)", color: "#A67C2E", border: "1px solid rgba(212,175,55,0.2)" }}>
                                    Move Stage
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <span className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>
          Showing {filtered.length} of {CRM_DATA.length} contacts
        </span>
        <div className="flex items-center gap-4">
          {[["HOT", "#1F8A70"], ["WARM", "#D4AF37"], ["COLD", "#94a3b8"]].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              <span className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>{l}: {CRM_DATA.filter(x => x.label === l).length}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────
function ActivityFeed({ leads }: { leads: LiveLead[] }) {
  const latest = leads.slice(0, 6);
  return (
    <div className="flex flex-col gap-2">
      {latest.length === 0 ? (
        <div className="text-center py-8 text-xs font-bold" style={{ color: "#94a3b8" }}>No recent activity</div>
      ) : latest.map((l, i) => {
        const sc = statusColors[l.status] ?? statusColors.PENDING;
        return (
          <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-zinc-50/60"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${sc.text}, ${sc.text}88)` }}>
              {l.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black truncate" style={{ color: "#09090b" }}>{l.name}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>{l.status}</div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" style={{ color: "#94a3b8" }} />
              <span className="text-[9px] font-bold" style={{ color: "#94a3b8" }}>Now</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────
type ToastItem = { id: number; title: string; sub: string; color: string; progress?: boolean };
let _tid = 0;
function ToastStack({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth:300, width:'100%' }}>
      {toasts.map(t => (
        <motion.div key={t.id} initial={{ opacity:0, x:60, scale:0.9 }} animate={{ opacity:1, x:0, scale:1 }} exit={{ opacity:0, x:60 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
          className="pointer-events-auto rounded-2xl overflow-hidden" style={{ background:'white', border:`1px solid ${t.color}20`, boxShadow:`0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${t.color}10` }}>
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor:`${t.color}12` }}>
              <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor:t.color }} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-wider" style={{ color:'#09090b', fontFamily:"'Outfit', sans-serif" }}>{t.title}</div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color:'#71717a' }}>{t.sub}</div>
            </div>
            <button onClick={() => remove(t.id)} className="text-zinc-300 hover:text-zinc-500 text-sm leading-none mt-0.5">✕</button>
          </div>
          {t.progress && (
            <div className="h-[3px]" style={{ backgroundColor:`${t.color}15` }}>
              <motion.div className="h-full" initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:3, ease:'linear' }}
                onAnimationComplete={() => setTimeout(() => remove(t.id), 100)} style={{ backgroundColor:t.color, borderRadius:'0 2px 2px 0' }} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────
function QuickActions({ liveLeads, crmRef }: { liveLeads: LiveLead[]; crmRef: React.RefObject<HTMLDivElement> }) {
  const [, navigate] = useLocation();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [busyIdx, setBusyIdx] = useState<number | null>(null);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = ++_tid;
    setToasts(p => [...p, { ...t, id }]);
    if (!t.progress) setTimeout(() => pop(id), 4000);
  };
  const pop = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  const run = async (i: number) => {
    setBusyIdx(i);
    if (i === 0) {
      navigate('/leads');
    } else if (i === 1) {
      const rows = [['Call ID','Status','Score','Outcome'],...liveLeads.map(l=>[l.id,l.status,l.score??'',l.bucket??''])];
      const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href:url, download:`voicequal_calls_${new Date().toISOString().split('T')[0]}.csv` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      push({ title:'Export Complete', sub:`${liveLeads.length} calls exported`, color:'#D4AF37' });
    } else if (i === 2) {
      // Scroll to and flash the CRM panel
      if (crmRef.current) {
        crmRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        crmRef.current.style.transition = 'box-shadow 0.3s ease, outline 0.3s ease';
        crmRef.current.style.outline = '2px solid rgba(31,138,112,0.6)';
        crmRef.current.style.boxShadow = '0 0 0 6px rgba(31,138,112,0.12)';
        setTimeout(() => {
          if (crmRef.current) {
            crmRef.current.style.outline = '';
            crmRef.current.style.boxShadow = '';
          }
        }, 2000);
      }
      push({ title:'Syncing CRM…', sub:'Pushing qualified leads to pipeline', color:'#0F3D3E', progress:true });
      await new Promise(r => setTimeout(r, 3300));
      push({ title:'Sync Complete', sub:`${liveLeads.filter(l=>l.bucket==='HOT').length} hot leads pushed to CRM`, color:'#1F8A70' });
    } else if (i === 3) {
      navigate('/calls');
    }
    setTimeout(() => setBusyIdx(null), 800);
  };

  const actions = [
    { icon: Users,     label: 'View Leads',     sub: 'Browse all contacts',    color:'#0F3D3E' },
    { icon: BarChart3, label: 'Export CSV',      sub: 'Download call data',     color:'#D4AF37' },
    { icon: Gem,       label: 'Sync CRM',       sub: 'Push to HubSpot',        color:'#1F8A70' },
    { icon: PhoneCall, label: 'View Calls',      sub: 'Analyze transcripts',    color:'#A67C2E' },
  ];

  return (
    <>
      <ToastStack toasts={toasts} remove={pop} />
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <motion.button key={i} onClick={() => run(i)} whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.97 }} disabled={busyIdx === i}
            className="premium-card p-4 flex flex-col items-start gap-2.5 relative overflow-hidden group cursor-pointer text-left"
            style={{ border:`1px solid ${a.color}18` }}>
            <div className="tilt-shine rounded-[20px]" />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor:`${a.color}10`, border:`1px solid ${a.color}20` }}>
              {busyIdx === i
                ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color: a.color }} />
                : <a.icon className="w-4 h-4" style={{ color: a.color }} />}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider leading-tight relative z-10 block" style={{ color:"#09090b" }}>{a.label}</span>
              <span className="text-[9px] font-medium block mt-0.5" style={{ color:"#94a3b8" }}>{a.sub}</span>
            </div>
            <ArrowRight className="w-3 h-3 absolute right-3 bottom-3 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: a.color }} />
          </motion.button>
        ))}
      </div>
    </>
  );
}

// ─── Live Lead Row ────────────────────────────────────────────────────────
function LiveLeadRow({ lead }: { lead: LiveLead }) {
  const [expanded, setExpanded] = useState(false);
  const [audioState, setAudioState] = useState<'idle'|'loading'|'playing'|'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const sc = bucketColors[lead.bucket ?? ''] ?? bucketColors.COLD;
  const ss = statusColors[lead.status] ?? statusColors.PENDING;

  const playRecording = async () => {
    if (audioState === 'playing') { audioRef.current?.pause(); setAudioState('idle'); return; }
    if (!lead.recording) return;
    setAudioState('loading');
    try {
      const res = await fetch(lead.recording, { headers: { "xi-api-key": ELEVENLABS_API_KEY } });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = URL.createObjectURL(blob);
      const audio = new Audio(blobUrlRef.current);
      audioRef.current = audio;
      audio.onended = () => setAudioState('idle');
      await audio.play();
      setAudioState('playing');
    } catch {
      setAudioState('error');
      setTimeout(() => setAudioState('idle'), 2000);
    }
  };

  return (
    <>
      <motion.tr initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
        onClick={() => setExpanded(e => !e)} className="border-b cursor-pointer group transition-colors hover:bg-zinc-50/80"
        style={{ borderColor:'rgba(0,0,0,0.05)' }}>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
              style={{ background:`linear-gradient(135deg, ${sc.dot}, ${sc.dot}88)` }}>
              {lead.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div className="text-[13px] font-black" style={{ color:'#09090b' }}>{lead.name}</div>
              {lead.company && <div className="text-[10px] font-medium" style={{ color:'#94a3b8' }}>{lead.company}</div>}
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: ss.bg, color: ss.text }}>
            <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ backgroundColor: ss.text }} />
            {lead.status}
          </span>
        </td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(0,0,0,0.06)', maxWidth:60 }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${((lead.score??0)/10)*100}%` }}
                transition={{ duration:1, ease:[0.16,1,0.3,1] }} className="h-full rounded-full"
                style={{ backgroundColor: sc.dot }} />
            </div>
            <span className="text-[11px] font-black tabular-nums" style={{ color:'#09090b' }}>{lead.score?.toFixed(1) ?? '—'}</span>
          </div>
        </td>
        <td className="py-3.5 px-4">
          {lead.bucket && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: sc.bg, color: sc.text, border:`1px solid ${sc.border}` }}>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: sc.dot }} />
              {lead.bucket}
            </span>
          )}
        </td>
        <td className="py-3.5 px-4">
          {lead.recording && (
            <button onClick={e => { e.stopPropagation(); playRecording(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background:'rgba(31,138,112,0.08)', border:'1px solid rgba(31,138,112,0.15)' }}>
              {audioState === 'loading' ? <RefreshCw className="w-3 h-3 animate-spin" style={{ color:'#1F8A70' }} />
                : audioState === 'playing' ? <span className="w-2 h-2 rounded-sm" style={{ background:'#1F8A70' }} />
                : <Volume2 className="w-3 h-3" style={{ color:'#1F8A70' }} />}
            </button>
          )}
        </td>
      </motion.tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-4 pb-3 pt-0">
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="rounded-xl p-4 text-[11px]"
              style={{ background:'rgba(31,138,112,0.04)', border:'1px solid rgba(31,138,112,0.1)' }}>
              <div className="font-black uppercase tracking-widest mb-2" style={{ color:'#1F8A70' }}>Call Details — {lead.id.slice(0,16)}…</div>
              <div className="grid grid-cols-4 gap-4">
                {(['budget','authority','need','timeline'] as const).map(k => (
                  <div key={k}>
                    <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color:'#94a3b8' }}>{k}</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width:`${Math.random()*60+30}%`, backgroundColor:'#1F8A70' }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function Dashboard() {
  const [, navigate] = useLocation();
  const [overview, setOverview] = useState<Overview>({ totalLeads:0, callsInitiated:0, hotLeads:0, warmLeads:0, coldLeads:0, conversionRate:0, topScore:0 });
  const [liveLeads, setLiveLeads] = useState<LiveLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const crmRef = useRef<HTMLDivElement>(null);
  const [phoneNum, setPhoneNum] = useState('+919999999999');

  useEffect(() => {
    // Seed from mock data immediately
    const mockRows: LiveLead[] = MOCK_CALLS.map(c => ({
      id: c.id,
      name: c.lead,
      company: '',
      score: c.score?.total ?? null,
      bucket: c.score?.label ?? null,
      status: c.status,
      recording: undefined,
    }));

    const applyRows = (real: LiveLead[]) => {
      const all = [...real, ...mockRows];
      const done = all.filter(r => r.status === 'COMPLETED').length;
      const hot  = all.filter(r => r.bucket === 'HOT').length;
      const warm = all.filter(r => r.bucket === 'WARM').length;
      const cold = all.filter(r => r.bucket === 'COLD').length;
      const scored = all.filter(r => r.score != null);
      const topScore = scored.length ? Math.max(...scored.map(r => r.score!)) : 0;
      setLiveLeads(all);
      setOverview({
        totalLeads: all.length,
        callsInitiated: done,
        hotLeads: hot,
        warmLeads: warm,
        coldLeads: cold,
        conversionRate: all.length ? (hot / all.length) * 100 : 0,
        topScore,
      });
    };

    // Show mock data right away
    applyRows([]);
    setLoading(false);

    // Then fetch real data and prepend it
    (async () => {
      try {
        const res = await fetch("https://api.elevenlabs.io/v1/convai/conversations?limit=50", {
          headers: { "xi-api-key": ELEVENLABS_API_KEY },
        });
        if (!res.ok) return;
        const data = await res.json();
        const convs: any[] = data.conversations ?? [];
        const realRows: LiveLead[] = convs.map((c: any) => ({
          id: c.conversation_id,
          name: c.call_summary_title || 'Unknown Call',
          company: '',
          score: null,
          bucket: null,
          status: mapDbStatus(c.status ?? 'pending'),
          recording: `https://api.elevenlabs.io/v1/convai/conversations/${c.conversation_id}/audio`,
        }));
        applyRows(realRows);
      } catch { /* silent — mock data already shown */ }
    })();
  }, []);

  const filteredLeads = liveLeads.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())
  );

  const overviewValues: Record<string, number> = {
    totalLeads: overview.totalLeads,
    callsInitiated: overview.callsInitiated,
    hotLeads: overview.hotLeads,
    conversionRate: overview.conversionRate,
  };

  const handleTriggerCall = async () => {
    setCallLoading(true);
    try { await triggerCall(phoneNum); } catch { /* silent */ } finally { setCallLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Welcome Banner ──────────────────────────────────────────── */}
        <motion.div {...fadeUp(0)} className="premium-card px-5 py-3"
          style={{ background: "linear-gradient(135deg, rgba(15,61,62,0.06), rgba(31,138,112,0.04))", border: "1px solid rgba(31,138,112,0.12)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-black tracking-tight" style={{ color: "#09090b" }}>
                Welcome back, Admin
              </div>
              <div className="text-xs font-medium mt-1 flex items-center gap-2" style={{ color: "#71717a" }}>
                <CalendarDays className="w-3 h-3" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                <span className="mx-1">·</span>
                <span className="flex items-center gap-1 font-bold" style={{ color: "#1F8A70" }}>
                  <Sparkles className="w-3 h-3" /> AI Engine Active
                </span>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/calls')}
              whileHover={{ scale:1.03, y:-1 }} whileTap={{ scale:0.97 }}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg"
              style={{ background:'linear-gradient(135deg,#1F8A70,#0F3D3E)' }}>
              View All Calls
            </motion.button>
          </div>
        </motion.div>

        {/* ── KPI Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => <KPICard key={c.key} card={c} value={loading ? 0 : overviewValues[c.key] ?? 0} />)}
        </div>

        {/* ── Mid Row: Funnel + Donut + Quick Actions ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Activity Feed */}
          <motion.div {...fadeUp(0.1)} className="premium-card p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-black uppercase tracking-widest" style={{ color:'#94a3b8' }}>Recent Activity</div>
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70" }}>
                <Zap className="w-2.5 h-2.5" /> Live
              </div>
            </div>
            <ActivityFeed leads={liveLeads} />
          </motion.div>

          {/* Donut + Funnel */}
          <motion.div {...fadeUp(0.15)} className="premium-card p-5 lg:col-span-1">
            <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:'#94a3b8' }}>Lead Buckets</div>
            <div className="flex flex-col items-center gap-4">
              <BucketDonut hot={overview.hotLeads} warm={overview.warmLeads} cold={overview.coldLeads} />
              <div className="flex gap-5 justify-center">
                {[['HOT','#1F8A70',overview.hotLeads],['WARM','#D4AF37',overview.warmLeads],['COLD','#CBD5E1',overview.coldLeads]].map(([l,c,v]) => (
                  <div key={l as string} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c as string }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'#94a3b8' }}>{l as string}</span>
                    <span className="text-[10px] font-black tabular-nums ml-1" style={{ color:'#09090b' }}>{v as number}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-[1px] my-1" style={{ background: "rgba(0,0,0,0.06)" }} />
              <div className="w-full">
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:'#94a3b8' }}>Conversion Funnel</div>
                <ConversionFunnel total={overview.totalLeads} completed={overview.callsInitiated} hot={overview.hotLeads} />
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-1 flex flex-col gap-4">
            <div className="premium-card p-5">
              <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:'#94a3b8' }}>Quick Actions</div>
              <QuickActions liveLeads={liveLeads} crmRef={crmRef} />
            </div>
          </motion.div>
        </div>

        {/* ── CRM Pipeline ────────────────────────────────────────────── */}
        <CRMPanel panelRef={crmRef} />

        {/* ── Live Leads Table ─────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.15)} className="premium-card overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor:'rgba(0,0,0,0.06)' }}>
            <div>
              <div className="text-sm font-black uppercase tracking-wider" style={{ color:'#09090b' }}>Live Leads</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color:'#94a3b8' }}>{liveLeads.length} total · {liveLeads.filter(l=>l.status==='CALLING').length} active</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color:'#94a3b8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…"
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none" style={{ borderColor:'rgba(0,0,0,0.1)', background:'rgba(0,0,0,0.02)', color:'#09090b', width:160 }} />
              </div>
              <div className="flex items-center gap-2">
                <input value={phoneNum} onChange={e => setPhoneNum(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border outline-none" style={{ borderColor:'rgba(0,0,0,0.1)', background:'rgba(0,0,0,0.02)', color:'#09090b', width:140 }} />
                <motion.button onClick={handleTriggerCall} disabled={callLoading} whileHover={{ scale:1.03, y:-1 }} whileTap={{ scale:0.97 }}
                  className="px-4 py-1.5 rounded-lg text-xs font-black text-white transition-all"
                  style={{ background:'linear-gradient(135deg,#1F8A70,#0F3D3E)', opacity: callLoading ? 0.7 : 1 }}>
                  {callLoading ? 'Calling…' : 'Trigger Call'}
                </motion.button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor:'rgba(0,0,0,0.05)' }}>
                  {['Lead','Status','Score','Bucket','Recording'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest" style={{ color:'#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b" style={{ borderColor:'rgba(0,0,0,0.04)' }}>
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="py-3.5 px-4"><div className="h-4 rounded animate-pulse" style={{ background:'rgba(0,0,0,0.05)', width: j===0?120:j===2?60:80 }} /></td>
                      ))}
                    </tr>))
                  : filteredLeads.length === 0
                    ? <tr><td colSpan={5} className="text-center py-12 text-xs font-bold" style={{ color:'#94a3b8' }}>No leads found</td></tr>
                    : filteredLeads.map(l => <LiveLeadRow key={l.id} lead={l} />)}
              </tbody>
            </table>
          </div>
          {!loading && liveLeads.length > 0 && (
            <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor:'rgba(0,0,0,0.05)' }}>
              <span className="text-[10px] font-medium" style={{ color:'#94a3b8' }}>Showing {filteredLeads.length} of {liveLeads.length}</span>
              <motion.button onClick={() => navigate('/calls')} whileHover={{ x:2 }} className="flex items-center gap-1.5 text-xs font-black transition-colors" style={{ color:'#1F8A70' }}>
                View all <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
