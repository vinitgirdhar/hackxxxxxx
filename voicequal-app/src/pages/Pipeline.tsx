import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type Stage = "IMPORTED" | "CALLED" | "QUALIFIED" | "HOT" | "CLOSED";

const pipeline: { id: string; name: string; company: string; score: number | null; stage: Stage; value: string }[] = [
  { id: '1',  name: 'Priya Menon',    company: 'Infosys',       score: 9.1, stage: 'HOT',       value: '₹4.2L' },
  { id: '2',  name: 'Meera Iyer',     company: 'L&T Infotech',  score: 8.9, stage: 'HOT',       value: '₹3.8L' },
  { id: '3',  name: 'Arjun Sharma',   company: 'Wipro',         score: 8.5, stage: 'QUALIFIED',  value: '₹2.9L' },
  { id: '4',  name: 'Kavya Reddy',    company: 'Mphasis',       score: 7.3, stage: 'QUALIFIED',  value: '₹1.7L' },
  { id: '5',  name: 'Neha Kapoor',    company: 'TCS',           score: 6.2, stage: 'CALLED',     value: '₹2.1L' },
  { id: '6',  name: 'Siddharth Rao',  company: 'Zensar',        score: 5.5, stage: 'CALLED',     value: '₹0.9L' },
  { id: '7',  name: 'Rohit Verma',    company: 'HCL Tech',      score: 4.8, stage: 'CALLED',     value: '₹1.4L' },
  { id: '8',  name: 'Anjali Singh',   company: 'Cognizant',     score: 2.1, stage: 'QUALIFIED',  value: '₹0.5L' },
  { id: '9',  name: 'Vikram Nair',    company: 'Tech Mahindra', score: null, stage: 'IMPORTED',  value: '—'     },
  { id: '10', name: 'Ravi Kumar',     company: 'Persistent',    score: 1.8, stage: 'CALLED',     value: '₹0.3L' },
];

const stages: { key: Stage; label: string; color: string; bg: string; border: string; accent: string }[] = [
  { key: 'IMPORTED',  label: 'Imported',  color: "#94A3B8", bg: "rgba(148,163,184,0.05)", border: "rgba(148,163,184,0.15)", accent: "rgba(148,163,184,0.4)"  },
  { key: 'CALLED',    label: 'Called',    color: "#D4AF37", bg: "rgba(212,175,55,0.05)",  border: "rgba(212,175,55,0.15)",  accent: "rgba(212,175,55,0.5)"   },
  { key: 'QUALIFIED', label: 'Qualified', color: "#0F3D3E", bg: "rgba(15,61,62,0.05)",    border: "rgba(15,61,62,0.15)",    accent: "rgba(15,61,62,0.4)"     },
  { key: 'HOT',       label: 'Hot',      color: "#1F8A70", bg: "rgba(31,138,112,0.06)",  border: "rgba(31,138,112,0.2)",   accent: "rgba(31,138,112,0.5)"   },
  { key: 'CLOSED',    label: 'Closed',   color: "#A67C2E", bg: "rgba(166,124,46,0.05)",  border: "rgba(166,124,46,0.15)",  accent: "rgba(166,124,46,0.4)"   },
];

const totalValue = "₹15.8L";

export default function Pipeline() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">Pipeline View</div>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Pipeline</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              Kanban view across qualification stages — <span style={{ color: "#D4AF37", fontWeight: 700 }}>{totalValue}</span> total pipeline value.
            </p>
          </div>
          <motion.div {...fadeUp(0.1)} className="hidden lg:flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl machined-panel flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#A67C2E" }}>{totalValue} pipeline</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stage summary bar */}
        <motion.div {...fadeUp(0.08)} className="flex gap-2 overflow-x-auto pb-1">
          {stages.map(s => {
            const count = pipeline.filter(l => l.stage === s.key).length;
            return (
              <div key={s.key} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: s.color }}>{s.label}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{count}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Kanban board */}
        <motion.div {...fadeUp(0.14)} className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
          {stages.map((stage, si) => {
            const stageLeads = pipeline.filter(l => l.stage === stage.key);
            const stageValue = stageLeads
              .filter(l => l.value !== '—')
              .reduce((sum, l) => sum + parseFloat(l.value.replace('₹', '').replace('L', '')), 0);

            return (
              <div key={stage.key} className="shrink-0 w-56 flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-3 rounded-xl"
                  style={{ backgroundColor: stage.bg, border: `1px solid ${stage.border}` }}>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: stage.color }}>{stage.label}</span>
                    {stageValue > 0 && (
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: `${stage.color}80` }}>₹{stageValue.toFixed(1)}L</div>
                    )}
                  </div>
                  <span className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stage.color}18`, color: stage.color }}>{stageLeads.length}</span>
                </div>

                {/* Cards */}
                {stageLeads.map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.06 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="premium-card p-4 cursor-pointer group transition-all"
                    style={{ borderColor: `${stage.color}10` }}
                  >
                    {/* Top accent line */}
                    <div className="absolute top-0 left-4 right-4 h-[1px] rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${stage.color}40, transparent)` }} />

                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: "#1F8A70", border: `1.5px solid rgba(212,175,55,0.35)`, boxShadow: "0 2px 8px rgba(31,138,112,0.2)" }}>
                        {lead.name.slice(0, 2).toUpperCase()}
                      </div>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" style={{ color: stage.color }} />
                    </div>

                    <div className="font-bold text-sm" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{lead.name}</div>
                    <div className="text-[11px] mt-0.5 font-medium" style={{ color: "#71717a" }}>{lead.company}</div>

                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      <span className="text-xs font-black" style={{ color: "#D4AF37" }}>{lead.value}</span>
                      {lead.score != null && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8"}12`,
                              color: lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8"
                            }}>
                            {lead.score.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-xl border border-dashed text-xs"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "#94a3b8" }}>
                    No leads
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
