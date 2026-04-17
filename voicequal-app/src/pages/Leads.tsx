import { motion } from "framer-motion";
import { Search, ArrowUpRight, Flame, Filter, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  score: number | null;
  bucket: string | null;
  status: string;
  date: string;
  isLive?: boolean;
};

const MOCK_LEADS: Lead[] = [
  { id: '1',  name: 'Priya Menon',   company: 'Infosys',       phone: '+91 98765 43210', score: 9.1,  bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-17' },
  { id: '2',  name: 'Arjun Sharma',  company: 'Wipro',         phone: '+91 87654 32109', score: 8.5,  bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-17' },
  { id: '3',  name: 'Neha Kapoor',   company: 'TCS',           phone: '+91 76543 21098', score: 6.2,  bucket: 'WARM', status: 'COMPLETED', date: '2026-04-16' },
  { id: '4',  name: 'Rohit Verma',   company: 'HCL Tech',      phone: '+91 65432 10987', score: 4.8,  bucket: 'WARM', status: 'CALLING',   date: '2026-04-16' },
  { id: '5',  name: 'Anjali Singh',  company: 'Cognizant',     phone: '+91 54321 09876', score: 2.1,  bucket: 'COLD', status: 'COMPLETED', date: '2026-04-15' },
  { id: '6',  name: 'Vikram Nair',   company: 'Tech Mahindra', phone: '+91 43210 98765', score: null, bucket: null,   status: 'PENDING',   date: '2026-04-15' },
  { id: '7',  name: 'Kavya Reddy',   company: 'Mphasis',       phone: '+91 32109 87654', score: 7.3,  bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-15' },
  { id: '8',  name: 'Siddharth Rao', company: 'Zensar',        phone: '+91 21098 76543', score: 5.5,  bucket: 'WARM', status: 'COMPLETED', date: '2026-04-14' },
  { id: '9',  name: 'Meera Iyer',    company: 'L&T Infotech',  phone: '+91 10987 65432', score: 8.9,  bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-14' },
  { id: '10', name: 'Ravi Kumar',    company: 'Persistent',    phone: '+91 99876 54321', score: 1.8,  bucket: 'COLD', status: 'FAILED',    date: '2026-04-13' },
];

function outcomeFromScore(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 7) return 'HOT';
  if (score >= 4) return 'WARM';
  return 'COLD';
}

function mapDbStatus(s: string): string {
  if (s === 'done') return 'COMPLETED';
  if (s === 'initiated' || s === 'in_progress') return 'CALLING';
  if (s === 'failed') return 'FAILED';
  return s.toUpperCase();
}

const bucketColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOT:  { bg: "rgba(31,138,112,0.1)",   text: "#1F8A70", border: "rgba(31,138,112,0.25)", dot: "#1F8A70" },
  WARM: { bg: "rgba(212,175,55,0.1)",   text: "#A67C2E", border: "rgba(212,175,55,0.25)", dot: "#D4AF37" },
  COLD: { bg: "rgba(100,116,139,0.08)", text: "#64748B", border: "rgba(100,116,139,0.2)", dot: "#94A3B8" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(31,138,112,0.08)",  text: "#1F8A70" },
  CALLING:   { bg: "rgba(212,175,55,0.08)",  text: "#A67C2E" },
  FAILED:    { bg: "rgba(239,68,68,0.08)",   text: "#DC2626" },
  PENDING:   { bg: "rgba(100,116,139,0.08)", text: "#64748B" },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 7 ? "#1F8A70" : score >= 4 ? "#D4AF37" : "#94A3B8";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-black tabular-nums" style={{ color }}>{score.toFixed(1)}</span>
      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}15` }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full" style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [, navigate] = useLocation();
  const [allLeads, setAllLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(false);
  const [hasLive, setHasLive] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('call_results')
        .select('call_id, status, score, called_at, lead_name, phone, company, outcome')
        .order('called_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const live: Lead[] = data.map(r => ({
          id: r.call_id,
          name: r.lead_name ?? r.call_id.slice(0, 20),
          company: r.company ?? '—',
          phone: r.phone ?? '—',
          score: r.score ?? null,
          bucket: r.outcome ?? outcomeFromScore(r.score),
          status: mapDbStatus(r.status),
          date: r.called_at ? r.called_at.split('T')[0] : '—',
          isLive: true,
        }));
        setAllLeads([...live, ...MOCK_LEADS]);
        setHasLive(true);
      }
    } catch {
      // keep mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = allLeads.filter((l: Lead) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || l.bucket === filter || (!l.bucket && filter === "PENDING");
    return matchSearch && matchFilter;
  });

  const chips = [
    { label: "All Leads", count: allLeads.length,                                                  color: "#0F3D3E", filter: "ALL"  },
    { label: "Hot",       count: allLeads.filter((l: Lead) => l.bucket === "HOT").length,          color: "#1F8A70", filter: "HOT"  },
    { label: "Warm",      count: allLeads.filter((l: Lead) => l.bucket === "WARM").length,         color: "#D4AF37", filter: "WARM" },
    { label: "Cold",      count: allLeads.filter((l: Lead) => l.bucket === "COLD").length,         color: "#94A3B8", filter: "COLD" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">Lead Management</div>
              {hasLive && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.18)" }}>
                  Live Data
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Leads</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              Manage and track all your qualified leads —{" "}
              <span style={{ color: "#1F8A70", fontWeight: 700 }}>
                {allLeads.filter((l: Lead) => l.bucket === 'HOT').length} hot
              </span>{" "}ready for your team.
            </p>
          </div>
          <motion.button onClick={fetchLeads} disabled={loading}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94a3b8", backgroundColor: "rgba(212,175,55,0.04)" }}>
            <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            Refresh
          </motion.button>
        </motion.div>

        {/* Summary chips */}
        <motion.div {...fadeUp(0.06)} className="flex flex-wrap gap-3">
          {chips.map(chip => (
            <motion.button key={chip.filter} onClick={() => setFilter(chip.filter)}
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
              style={{
                background: filter === chip.filter ? `${chip.color}10` : "rgba(255,255,255,0.8)",
                color: filter === chip.filter ? chip.color : "#71717a",
                border: filter === chip.filter ? `1px solid ${chip.color}30` : "1px solid rgba(0,0,0,0.07)",
                boxShadow: filter === chip.filter ? `0 4px 12px ${chip.color}12` : "0 1px 3px rgba(0,0,0,0.05)",
                fontFamily: "'Outfit', sans-serif",
              }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chip.color }} />
              {chip.label}
              <span className="opacity-60 ml-0.5">({chip.count})</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div {...fadeUp(0.12)} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all font-medium"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(212,175,55,0.15)",
                color: "#09090b",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                backdropFilter: "blur(8px)",
              }}
            />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", color: "#71717a" }}>
            <Filter className="w-3.5 h-3.5" /> Filter
          </motion.button>
        </motion.div>

        {/* Table */}
        <motion.div {...fadeUp(0.18)} className="premium-card overflow-hidden">
          <div className="px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.08)", color: "#94a3b8", background: "rgba(212,175,55,0.02)" }}>
            <div className="flex-1">Lead</div>
            <div className="w-28 hidden md:block">Company</div>
            <div className="w-28 hidden lg:block">Score</div>
            <div className="w-20">Bucket</div>
            <div className="w-24">Status</div>
            <div className="w-8" />
          </div>

          {filtered.map((lead: Lead, i: number) => {
            const bc = bucketColors[lead.bucket ?? ""] ?? bucketColors.COLD;
            const sc = statusColors[lead.status] ?? statusColors.PENDING;
            return (
              <motion.div key={lead.id}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="flex items-center gap-3 px-6 py-4 group cursor-pointer transition-all activity-row hover:bg-emerald-50/30"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: lead.isLive ? "#0F3D3E" : "#1F8A70", border: "1.5px solid rgba(212,175,55,0.3)", boxShadow: "0 2px 8px rgba(31,138,112,0.2)" }}>
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                    {lead.status === 'CALLING' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
                    )}
                    {lead.isLive && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" title="Live from n8n" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{lead.name}</div>
                    <div className="text-[10px] font-mono truncate" style={{ color: "#94a3b8" }}>{lead.phone}</div>
                  </div>
                </div>

                <div className="w-28 text-sm font-medium truncate hidden md:block" style={{ color: "#71717a" }}>{lead.company}</div>

                <div className="w-28 hidden lg:block">
                  {lead.score != null ? <ScoreBar score={lead.score} /> : <span style={{ color: "#cbd5e1" }}>—</span>}
                </div>

                <div className="w-20">
                  {lead.bucket ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                      style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: bc.dot }} />
                      {lead.bucket}
                    </span>
                  ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                </div>

                <div className="w-24">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: sc.bg, color: sc.text }}>
                    {lead.status}
                  </span>
                </div>

                <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Flame className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(212,175,55,0.3)" }} />
              <div className="text-sm font-bold" style={{ color: "#94a3b8" }}>No leads match your filters.</div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
