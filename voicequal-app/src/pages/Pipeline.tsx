import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
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

const stages: { key: Stage; label: string; color: string; bg: string }[] = [
  { key: 'IMPORTED',  label: 'Imported',  color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
  { key: 'CALLED',    label: 'Called',    color: "#D4AF37", bg: "rgba(212,175,55,0.08)"  },
  { key: 'QUALIFIED', label: 'Qualified', color: "#0F3D3E", bg: "rgba(15,61,62,0.08)"   },
  { key: 'HOT',       label: 'Hot 🔥',    color: "#1F8A70", bg: "rgba(31,138,112,0.08)"  },
  { key: 'CLOSED',    label: 'Closed',    color: "#A67C2E", bg: "rgba(166,124,46,0.08)"  },
];

export default function Pipeline() {
  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>Kanban view of leads across qualification stages.</p>
      </motion.div>

      {/* Kanban board */}
      <motion.div {...fadeUp(0.1)} className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, si) => {
          const stageLeads = pipeline.filter(l => l.stage === stage.key);
          return (
            <div key={stage.key} className="shrink-0 w-60 flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: stage.bg, border: `1px solid ${stage.color}20` }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: stage.color }}>{stage.label}</span>
                <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stage.color}15`, color: stage.color }}>{stageLeads.length}</span>
              </div>

              {/* Cards */}
              {stageLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.05 + i * 0.04 }}
                  className="premium-card p-4 cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.3)" }}>
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color: stage.color }} />
                  </div>
                  <div className="font-semibold text-sm" style={{ color: "#09090b" }}>{lead.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#71717a" }}>{lead.company}</div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <span className="text-xs font-bold" style={{ color: "#D4AF37" }}>{lead.value}</span>
                    {lead.score != null && (
                      <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8"}12`, color: lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8" }}>
                        {lead.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {stageLeads.length === 0 && (
                <div className="flex items-center justify-center h-20 rounded-xl border border-dashed text-xs"
                  style={{ borderColor: "rgba(0,0,0,0.1)", color: "#94a3b8" }}>
                  No leads
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
