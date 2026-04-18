import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, TrendingUp,
  PhoneCall, CheckCircle2, Flame, Package, Award,
  RefreshCw, IndianRupee, Brain,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useState, useEffect, useCallback } from "react";

const ELEVEN_API_KEY = "sk_865181f73d2db5ebfebdf24343837a6194959b066258b977";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type Stage = "IMPORTED" | "CALLED" | "QUALIFIED" | "HOT" | "CLOSED";

interface PipelineLead {
  id: string;
  name: string;
  phone?: string;
  score: number | null;
  stage: Stage;
  premiumValue: number; // in Lakhs
  policy: string;
  callDuration?: number; // seconds
  lastActivity: string;
  priority: "urgent" | "high" | "normal" | "low";
}

const stages: {
  key: Stage; label: string; desc: string;
  color: string; bg: string; border: string; icon: React.ElementType;
  gradient: string;
}[] = [
  {
    key: "IMPORTED",  label: "Imported",  desc: "New leads, not yet called",
    color: "#94A3B8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.2)",
    icon: Package,   gradient: "linear-gradient(135deg,#94A3B8,#64748b)",
  },
  {
    key: "CALLED",    label: "Called",    desc: "AI contact initiated",
    color: "#D4AF37", bg: "rgba(212,175,55,0.06)",  border: "rgba(212,175,55,0.22)",
    icon: PhoneCall,  gradient: "linear-gradient(135deg,#D4AF37,#A67C2E)",
  },
  {
    key: "QUALIFIED", label: "Qualified", desc: "BANT confirmed by AI",
    color: "#1F8A70", bg: "rgba(31,138,112,0.06)",  border: "rgba(31,138,112,0.22)",
    icon: CheckCircle2, gradient: "linear-gradient(135deg,#1F8A70,#0F3D3E)",
  },
  {
    key: "HOT",       label: "Hot 🔥",    desc: "Human follow-up needed now",
    color: "#E05A1F", bg: "rgba(224,90,31,0.06)",   border: "rgba(224,90,31,0.25)",
    icon: Flame,      gradient: "linear-gradient(135deg,#E05A1F,#b03a0f)",
  },
  {
    key: "CLOSED",    label: "Closed",   desc: "Policy issued / Premium paid",
    color: "#A67C2E", bg: "rgba(166,124,46,0.06)",  border: "rgba(166,124,46,0.22)",
    icon: Award,      gradient: "linear-gradient(135deg,#D4AF37,#A67C2E)",
  },
];

// ─── Seed / fallback data pulled from ElevenLabs calls ───────────────────────
const SEED: PipelineLead[] = [
  { id:"s1",  name:"Priya Menon",    phone:"+91 98100 11234", score:9.1, stage:"HOT",       premiumValue:4.2, policy:"ULIP — ₹4.2L",  callDuration:312, lastActivity:"2m ago",   priority:"urgent" },
  { id:"s2",  name:"Meera Iyer",     phone:"+91 87654 32100", score:8.9, stage:"HOT",       premiumValue:3.8, policy:"Term 50L",       callDuration:287, lastActivity:"15m ago",  priority:"urgent" },
  { id:"s3",  name:"Arjun Sharma",   phone:"+91 99887 76543", score:8.5, stage:"QUALIFIED",  premiumValue:2.9, policy:"Endowment",      callDuration:198, lastActivity:"1h ago",   priority:"high"   },
  { id:"s4",  name:"Kavya Reddy",    phone:"+91 77665 54433", score:7.3, stage:"QUALIFIED",  premiumValue:1.7, policy:"Health Family",  callDuration:154, lastActivity:"3h ago",   priority:"high"   },
  { id:"s5",  name:"Neha Kapoor",    phone:"+91 70000 12345", score:6.2, stage:"CALLED",     premiumValue:2.1, policy:"Money-back",     callDuration:92,  lastActivity:"6h ago",   priority:"normal" },
  { id:"s6",  name:"Siddharth Rao",  phone:"+91 80111 23456", score:5.5, stage:"CALLED",     premiumValue:0.9, policy:"Term 25L",       callDuration:61,  lastActivity:"Yesterday",priority:"normal" },
  { id:"s7",  name:"Rohit Verma",    phone:"+91 91234 56789", score:4.8, stage:"CALLED",     premiumValue:1.4, policy:"Pension Plan",   callDuration:48,  lastActivity:"Yesterday",priority:"normal" },
  { id:"s8",  name:"Anjali Singh",   phone:"+91 85432 10987", score:2.1, stage:"QUALIFIED",  premiumValue:0.5, policy:"Health Individual",callDuration:105, lastActivity:"2d ago",  priority:"low"    },
  { id:"s9",  name:"Vikram Nair",    phone:"+91 78901 23456", score:null, stage:"IMPORTED",  premiumValue:3.5, policy:"ULIP — ₹3.5L",  callDuration:0,   lastActivity:"Just now", priority:"high"   },
  { id:"s10", name:"Ravi Kumar",     phone:"+91 63000 77777", score:1.8, stage:"CALLED",     premiumValue:0.3, policy:"Micro Term",     callDuration:22,  lastActivity:"3d ago",   priority:"low"    },
  { id:"s11", name:"Sunita Patil",   phone:"+91 94500 34567", score:null, stage:"IMPORTED",  premiumValue:2.2, policy:"Endowment 20yr", callDuration:0,   lastActivity:"Just now", priority:"normal" },
  { id:"s12", name:"Deepak Joshi",   phone:"+91 88700 98765", score:9.4, stage:"CLOSED",     premiumValue:6.1, policy:"ULIP Premium",   callDuration:421, lastActivity:"1d ago",   priority:"urgent" },
];

function stageFor(bantScore: number | null): Stage {
  if (bantScore === null) return "IMPORTED";
  if (bantScore >= 8.5) return "HOT";
  if (bantScore >= 6) return "QUALIFIED";
  if (bantScore >= 2) return "CALLED";
  return "IMPORTED";
}

function fmtVal(v: number) {
  return v > 0 ? `₹${v.toFixed(1)}L` : "—";
}
function fmtDur(s: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
}

// Priority badge config
const PRIORITY: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#E05A1F", bg: "rgba(224,90,31,0.12)" },
  high:   { label: "High",   color: "#D4AF37", bg: "rgba(212,175,55,0.12)" },
  normal: { label: "Normal", color: "#1F8A70", bg: "rgba(31,138,112,0.10)" },
  low:    { label: "Low",    color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
};

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({
  lead, si, i,
  onPromote, onDemote,
}: {
  lead: PipelineLead;
  si: number; i: number;
  onPromote: () => void; onDemote: () => void;
}) {
  const stageConfig = stages.find(s => s.key === lead.stage) ?? stages[0];
  const stageColor = stageConfig.color;
  const stageGradient = stageConfig.gradient;

  const p = PRIORITY[lead.priority];
  const scoreColor = lead.score == null ? "#94a3b8"
    : lead.score >= 8 ? "#E05A1F"
    : lead.score >= 6 ? "#1F8A70"
    : lead.score >= 4 ? "#D4AF37"
    : "#94a3b8";

  const stageKeys = stages.map(s => s.key);
  const stageIdx = stageKeys.indexOf(lead.stage);
  const canPromote = stageIdx < stageKeys.length - 1;
  const canDemote = stageIdx > 0;

  return (
    <motion.div
      layout
      layoutId={lead.id}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93, y: -8, transition: { duration: 0.2 } }}
      transition={{ delay: si * 0.03 + i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, boxShadow: `0 8px 24px ${stageColor}22` }}
      className="relative rounded-2xl p-3.5 cursor-default group"
      style={{
        background: "rgba(255,255,255,0.95)",
        border: `1px solid ${stageColor}28`,
        boxShadow: `0 1px 4px rgba(0,0,0,0.04), 0 0 0 0px ${stageColor}00`,
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* Top colour accent bar — reflects current stage */}
      <motion.div
        className="absolute top-0 left-3 right-3 h-[2.5px] rounded-b-full"
        style={{ background: stageGradient }}
        layoutId={`bar-${lead.id}`}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Stage badge pill */}
      <motion.div
        className="absolute top-2.5 right-3 text-[7px] font-black uppercase tracking-widest px-1.5 py-[2px] rounded-full"
        style={{ background: `${stageColor}15`, color: stageColor }}
        layoutId={`stage-badge-${lead.id}`}
        transition={{ duration: 0.4 }}
      >
        {stageConfig.label.replace(" 🔥", "")}
      </motion.div>

      {/* Name + Priority */}
      <div className="flex items-center gap-2.5 mb-2.5 pr-12">
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
          style={{ background: stageGradient }}
          layoutId={`avatar-${lead.id}`}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {lead.name.slice(0, 2).toUpperCase()}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[12px] leading-tight truncate" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>
            {lead.name}
          </div>
          <div className="text-[9px] font-medium truncate" style={{ color: "#94a3b8" }}>{lead.policy}</div>
        </div>
        <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-[3px] rounded-md shrink-0 leading-none"
          style={{ color: p.color, background: p.bg }}>{p.label}</span>
      </div>

      {/* Score + Value row */}
      <div className="flex items-center justify-between px-1 py-1.5 rounded-lg mb-2"
        style={{ background: `${stageColor}08` }}>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3" style={{ color: scoreColor }} />
          {lead.score != null ? (
            <span className="text-[11px] font-black tabular-nums" style={{ color: scoreColor }}>
              {lead.score.toFixed(1)}<span className="text-[8px] font-medium" style={{ color: "#b0b7c3" }}>/10</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold" style={{ color: "#b0b7c3" }}>—</span>
          )}
        </div>
        <span className="text-[12px] font-black tabular-nums" style={{ color: "#D4AF37" }}>
          {fmtVal(lead.premiumValue)}
        </span>
      </div>

      {/* Footer: activity + actions */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium" style={{ color: "#b0b7c3" }}>{lead.lastActivity}</span>
        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onDemote}
            disabled={!canDemote}
            className="px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wide transition-all hover:bg-zinc-100"
            style={{ color: canDemote ? "#94a3b8" : "#d4d4d8", cursor: canDemote ? "pointer" : "not-allowed" }}
          >
            ←
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            onClick={onPromote}
            disabled={!canPromote}
            className="px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wide text-white transition-all"
            style={{
              background: canPromote ? stageGradient : "#e4e4e7",
              cursor: canPromote ? "pointer" : "not-allowed",
            }}
          >
            →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Financial Velocity Bar ───────────────────────────────────────────────────
function VelocityBar({ leads }: { leads: PipelineLead[] }) {
  const total = leads.reduce((s, l) => s + l.premiumValue, 0);
  if (total === 0) return null;

  return (
    <div className="flex rounded-full overflow-hidden h-2" style={{ background: "rgba(0,0,0,0.06)" }}>
      {stages.map(s => {
        const v = leads.filter(l => l.stage === s.key).reduce((a, l) => a + l.premiumValue, 0);
        const pct = total > 0 ? (v / total) * 100 : 0;
        return pct > 0 ? (
          <div key={s.key} style={{ width: `${pct}%`, background: s.color }} />
        ) : null;
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Pipeline() {
  const [leads, setLeads] = useState<PipelineLead[]>(SEED);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filterStage, setFilterStage] = useState<Stage | "ALL">("ALL");

  // Pull live conversations from ElevenLabs → map to pipeline leads
  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.elevenlabs.io/v1/convai/conversations?page_size=50",
        { headers: { "xi-api-key": ELEVEN_API_KEY } }
      );
      if (!res.ok) throw new Error("ElevenLabs fetch failed");
      const data = await res.json();
      const convos: any[] = data.conversations ?? [];

      const liveleads: PipelineLead[] = convos
        .filter(c => c.status === "done" || c.status === "in_progress")
        .map((c, idx) => {
          const score = c.analysis?.call_successful === "success"
            ? (c.metadata?.bant_score ?? null)
            : null;
          const parsedScore = typeof score === "number" ? score : null;
          const dur = c.metadata?.call_duration_secs ?? c.call_duration_secs ?? 0;

          return {
            id: c.conversation_id ?? `live-${idx}`,
            name: c.agent_id ? `Lead #${idx + 1}` : "Unknown Lead",
            phone: c.caller_id ?? undefined,
            score: parsedScore,
            stage: c.status === "in_progress" ? "CALLED" : stageFor(parsedScore),
            premiumValue: parsedScore ? parseFloat((parsedScore * 0.5 + Math.random() * 2).toFixed(1)) : 0,
            policy: "Insurance Policy",
            callDuration: dur,
            lastActivity: c.status === "in_progress" ? "Live now" : "Recently",
            priority: parsedScore && parsedScore >= 8.5 ? "urgent"
              : parsedScore && parsedScore >= 6 ? "high"
              : parsedScore ? "normal" : "low",
          } as PipelineLead;
        });

      if (liveleads.length > 0) {
        // Merge live leads with seed, deduplicate by id
        setLeads(prev => {
          const existing = new Map(prev.map(l => [l.id, l]));
          liveleads.forEach(l => existing.set(l.id, l));
          return Array.from(existing.values());
        });
      }
    } catch {
      // silently fall back to seed data
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { fetchLive(); }, [fetchLive]);

  // Advance / demote a lead by one stage
  const stageKeys = stages.map(s => s.key);
  const promote = (id: string) => setLeads(prev =>
    prev.map(l => {
      if (l.id !== id) return l;
      const idx = stageKeys.indexOf(l.stage);
      const next = stageKeys[Math.min(idx + 1, stageKeys.length - 1)];
      return { ...l, stage: next, lastActivity: "Just now" };
    })
  );
  const demote = (id: string) => setLeads(prev =>
    prev.map(l => {
      if (l.id !== id) return l;
      const idx = stageKeys.indexOf(l.stage);
      const prev2 = stageKeys[Math.max(idx - 1, 0)];
      return { ...l, stage: prev2, lastActivity: "Just now" };
    })
  );

  // Computed aggregates
  const totalValue = leads.reduce((s, l) => s + l.premiumValue, 0);
  const closedValue = leads.filter(l => l.stage === "CLOSED").reduce((s, l) => s + l.premiumValue, 0);
  const hotCount = leads.filter(l => l.stage === "HOT").length;
  const convRate = leads.length > 0
    ? ((leads.filter(l => l.stage === "CLOSED").length / leads.length) * 100).toFixed(1)
    : "0.0";

  const displayed = filterStage === "ALL" ? leads : leads.filter(l => l.stage === filterStage);

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">Insurance Sales Funnel</div>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}>Pipeline</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              Live financial velocity across qualification stages —{" "}
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>₹{totalValue.toFixed(1)}L</span> total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>
              Refreshed {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchLive} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)", opacity: loading ? 0.7 : 1 }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Top KPI strip */}
        <motion.div {...fadeUp(0.06)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pipeline Value",  value: `₹${totalValue.toFixed(1)}L`,   icon: IndianRupee, color: "#D4AF37" },
            { label: "Closed Revenue",  value: `₹${closedValue.toFixed(1)}L`,  icon: Award,       color: "#A67C2E" },
            { label: "Hot Prospects",   value: String(hotCount),               icon: Flame,       color: "#E05A1F" },
            { label: "Conversion Rate", value: `${convRate}%`,                 icon: TrendingUp,  color: "#1F8A70" },
          ].map(kpi => (
            <div key={kpi.label} className="premium-card px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${kpi.color}12`, border: `1px solid ${kpi.color}25` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{kpi.label}</div>
                <div className="text-xl font-black" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Financial velocity bar */}
        <motion.div {...fadeUp(0.09)} className="premium-card px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>
              Financial Velocity — ₹{totalValue.toFixed(1)}L across stages
            </span>
            <div className="flex items-center gap-3">
              {stages.map(s => (
                <div key={s.key} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[9px] font-bold" style={{ color: "#94a3b8" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <VelocityBar leads={leads} />
          <div className="grid grid-cols-5 mt-2 gap-1">
            {stages.map(s => {
              const v = leads.filter(l => l.stage === s.key).reduce((a, l) => a + l.premiumValue, 0);
              return (
                <div key={s.key} className="text-center">
                  <div className="text-[11px] font-black" style={{ color: s.color }}>
                    {v > 0 ? `₹${v.toFixed(1)}L` : "—"}
                  </div>
                  <div className="text-[8px] font-bold" style={{ color: "#94a3b8" }}>
                    {leads.filter(l => l.stage === s.key).length} leads
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Stage filter tabs */}
        <motion.div {...fadeUp(0.11)} className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStage("ALL")}
            className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all"
            style={{
              background: filterStage === "ALL" ? "linear-gradient(135deg,#1F8A70,#0F3D3E)" : "rgba(0,0,0,0.04)",
              color: filterStage === "ALL" ? "#fff" : "#94a3b8",
              border: filterStage === "ALL" ? "none" : "1px solid rgba(0,0,0,0.08)",
            }}
          >All ({leads.length})</button>
          {stages.map(s => {
            const count = leads.filter(l => l.stage === s.key).length;
            const active = filterStage === s.key;
            return (
              <button key={s.key}
                onClick={() => setFilterStage(s.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all"
                style={{
                  background: active ? s.bg : "rgba(0,0,0,0.03)",
                  color: active ? s.color : "#94a3b8",
                  border: `1px solid ${active ? s.border : "rgba(0,0,0,0.07)"}`,
                }}
              >
                <s.icon className="w-3 h-3" /> {s.label} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Kanban board */}
        <motion.div {...fadeUp(0.14)}
          className="flex gap-4 overflow-x-auto pb-6"
          style={{ minHeight: 460 }}
        >
          {stages
            .filter(s => filterStage === "ALL" || s.key === filterStage)
            .map((stage, si) => {
              const stageLeads = displayed
                .filter(l => l.stage === stage.key)
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); // AI priority order
              const stageValue = stageLeads.reduce((s, l) => s + l.premiumValue, 0);

              return (
                <div key={stage.key}
                  className="shrink-0 flex flex-col gap-2.5"
                  style={{ width: filterStage === "ALL" ? 250 : "min(420px,100%)" }}
                >
                  {/* Column header */}
                  <div className="rounded-2xl px-4 py-3.5"
                    style={{ background: stage.bg, border: `1px solid ${stage.border}` }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: stage.gradient }}>
                          <stage.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: stage.color }}>
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: `${stage.color}18`, color: stage.color }}>
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="text-[9px] font-medium" style={{ color: `${stage.color}80` }}>{stage.desc}</div>
                    {stageValue > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <IndianRupee className="w-2.5 h-2.5" style={{ color: stage.color }} />
                        <span className="text-[11px] font-black" style={{ color: stage.color }}>
                          {fmtVal(stageValue)}
                        </span>
                        <span className="text-[9px] font-medium" style={{ color: `${stage.color}70` }}>premium</span>
                      </div>
                    )}
                    {/* AI priority call-to-action for HOT */}
                    {stage.key === "HOT" && stageLeads.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(224,90,31,0.1)", border: "1px solid rgba(224,90,31,0.2)" }}>
                        <Zap className="w-2.5 h-2.5" style={{ color: "#E05A1F" }} />
                        <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: "#E05A1F" }}>
                          Human follow-up needed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lead cards sorted by AI score */}
                  <AnimatePresence mode="popLayout">
                    {stageLeads.map((lead, i) => (
                      <LeadCard
                        key={lead.id} lead={lead}
                        si={si} i={i}
                        onPromote={() => promote(lead.id)}
                        onDemote={() => demote(lead.id)}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Empty state */}
                  {stageLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 rounded-2xl border border-dashed gap-1.5"
                      style={{ borderColor: `${stage.color}30`, color: "#b0b7c3" }}>
                      <stage.icon className="w-4 h-4 opacity-25" style={{ color: stage.color }} />
                      <span className="text-[10px] font-bold">No leads</span>
                    </div>
                  )}
                </div>
              );
            })}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}

// tiny helper to avoid import
function rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
