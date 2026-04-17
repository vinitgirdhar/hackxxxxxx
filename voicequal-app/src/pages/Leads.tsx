import { motion } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const allLeads = [
  { id: '1',  name: 'Priya Menon',    company: 'Infosys',      phone: '+91 98765 43210', email: 'priya@infosys.com',    score: 9.1, bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-17' },
  { id: '2',  name: 'Arjun Sharma',   company: 'Wipro',        phone: '+91 87654 32109', email: 'arjun@wipro.com',      score: 8.5, bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-17' },
  { id: '3',  name: 'Neha Kapoor',    company: 'TCS',          phone: '+91 76543 21098', email: 'neha@tcs.com',         score: 6.2, bucket: 'WARM', status: 'COMPLETED', date: '2026-04-16' },
  { id: '4',  name: 'Rohit Verma',    company: 'HCL Tech',     phone: '+91 65432 10987', email: 'rohit@hcl.com',        score: 4.8, bucket: 'WARM', status: 'CALLING',   date: '2026-04-16' },
  { id: '5',  name: 'Anjali Singh',   company: 'Cognizant',    phone: '+91 54321 09876', email: 'anjali@cognizant.com', score: 2.1, bucket: 'COLD', status: 'COMPLETED', date: '2026-04-15' },
  { id: '6',  name: 'Vikram Nair',    company: 'Tech Mahindra',phone: '+91 43210 98765', email: 'vikram@techmahindra.com', score: null, bucket: null, status: 'PENDING', date: '2026-04-15' },
  { id: '7',  name: 'Kavya Reddy',    company: 'Mphasis',      phone: '+91 32109 87654', email: 'kavya@mphasis.com',    score: 7.3, bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-15' },
  { id: '8',  name: 'Siddharth Rao',  company: 'Zensar',       phone: '+91 21098 76543', email: 'sid@zensar.com',       score: 5.5, bucket: 'WARM', status: 'COMPLETED', date: '2026-04-14' },
  { id: '9',  name: 'Meera Iyer',     company: 'L&T Infotech', phone: '+91 10987 65432', email: 'meera@lnt.com',        score: 8.9, bucket: 'HOT',  status: 'COMPLETED', date: '2026-04-14' },
  { id: '10', name: 'Ravi Kumar',     company: 'Persistent',   phone: '+91 99876 54321', email: 'ravi@persistent.com',  score: 1.8, bucket: 'COLD', status: 'FAILED',    date: '2026-04-13' },
];

const bucketColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOT:  { bg: "rgba(31,138,112,0.1)",   text: "#1F8A70", border: "rgba(31,138,112,0.25)",  dot: "#1F8A70" },
  WARM: { bg: "rgba(212,175,55,0.1)",   text: "#A67C2E", border: "rgba(212,175,55,0.25)",  dot: "#D4AF37" },
  COLD: { bg: "rgba(100,116,139,0.08)", text: "#64748B", border: "rgba(100,116,139,0.2)",  dot: "#94A3B8" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(31,138,112,0.08)",  text: "#1F8A70" },
  CALLING:   { bg: "rgba(212,175,55,0.08)",  text: "#A67C2E" },
  FAILED:    { bg: "rgba(239,68,68,0.08)",   text: "#DC2626" },
  PENDING:   { bg: "rgba(100,116,139,0.08)", text: "#64748B" },
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filtered = allLeads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || l.bucket === filter || (!l.bucket && filter === "PENDING");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>Leads</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>Manage and track all your qualified leads.</p>
      </motion.div>

      {/* Summary chips */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-3">
        {[
          { label: "All Leads", count: allLeads.length, color: "#0F3D3E", filter: "ALL" },
          { label: "Hot",       count: allLeads.filter(l => l.bucket === "HOT").length,  color: "#1F8A70", filter: "HOT"  },
          { label: "Warm",      count: allLeads.filter(l => l.bucket === "WARM").length, color: "#D4AF37", filter: "WARM" },
          { label: "Cold",      count: allLeads.filter(l => l.bucket === "COLD").length, color: "#94A3B8", filter: "COLD" },
        ].map(chip => (
          <button key={chip.filter} onClick={() => setFilter(chip.filter)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filter === chip.filter ? `${chip.color}12` : "white",
              color: filter === chip.filter ? chip.color : "#71717a",
              border: filter === chip.filter ? `1px solid ${chip.color}25` : "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chip.color }} />
            {chip.label} <span className="opacity-60">({chip.count})</span>
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div {...fadeUp(0.1)} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", color: "#09090b" }}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div {...fadeUp(0.15)} className="premium-card overflow-hidden">
        <div className="px-6 py-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", color: "#94a3b8", background: "rgba(0,0,0,0.01)" }}>
          <div className="flex-1">Lead</div>
          <div className="w-28 hidden md:block">Company</div>
          <div className="w-20 hidden lg:block">Score</div>
          <div className="w-20">Bucket</div>
          <div className="w-24">Status</div>
          <div className="w-8" />
        </div>
        {filtered.map((lead, i) => {
          const bc = bucketColors[lead.bucket ?? ""] ?? bucketColors.COLD;
          const sc = statusColors[lead.status] ?? statusColors.PENDING;
          return (
            <motion.div key={lead.id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-6 py-4 group hover:bg-emerald-50/30 cursor-pointer transition-colors"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.3)" }}>
                  {lead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: "#09090b" }}>{lead.name}</div>
                  <div className="text-[11px] font-mono truncate" style={{ color: "#71717a" }}>{lead.phone}</div>
                </div>
              </div>
              <div className="w-28 text-sm font-medium truncate hidden md:block" style={{ color: "#71717a" }}>{lead.company}</div>
              <div className="w-20 hidden lg:block">
                {lead.score != null ? (
                  <span className="text-sm font-bold tabular-nums" style={{ color: lead.score >= 7 ? "#1F8A70" : lead.score >= 4 ? "#D4AF37" : "#94A3B8" }}>
                    {lead.score.toFixed(1)}/10
                  </span>
                ) : <span className="text-sm" style={{ color: "#cbd5e1" }}>—</span>}
              </div>
              <div className="w-20">
                {lead.bucket ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                    style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: bc.dot }} />
                    {lead.bucket}
                  </span>
                ) : <span className="text-sm" style={{ color: "#cbd5e1" }}>—</span>}
              </div>
              <div className="w-24">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: sc.bg, color: sc.text }}>
                  {lead.status}
                </span>
              </div>
              <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center text-sm" style={{ color: "#94a3b8" }}>No leads match your filters.</div>
        )}
      </motion.div>
    </div>
  );
}
