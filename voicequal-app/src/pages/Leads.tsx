import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Flame, Filter, RefreshCw, Upload, X, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    return headers.reduce<CsvRow>((obj, h, i) => {
      obj[h] = (vals[i] ?? "").trim();
      return obj;
    }, {});
  });
}

function csvRowToLead(row: CsvRow, idx: number): Lead {
  const name = row["name"] || row["lead_name"] || row["full_name"] || `Lead ${idx + 1}`;
  const phone = row["phone"] || row["mobile"] || row["contact"] || "—";
  const company = row["company"] || row["organisation"] || row["organization"] || "—";
  const scoreRaw = parseFloat(row["score"] ?? row["bant_score"] ?? "");
  const score = isNaN(scoreRaw) ? null : Math.min(10, Math.max(0, scoreRaw));
  const bucket = row["bucket"] || row["outcome"] || (score !== null ? outcomeFromScore(score) : null);
  return {
    id: `csv-${Date.now()}-${idx}`,
    name,
    phone,
    company,
    score,
    bucket: bucket?.toUpperCase() ?? null,
    status: "PENDING",
    date: new Date().toISOString().split("T")[0],
  };
}

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (leads: Lead[]) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<Lead[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError("");
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length === 0) { setError("No data rows found. Check your CSV format."); return; }
      setParsed(rows.map((r, i) => csvRowToLead(r, i)));
      setFileName(file.name);
      setStep("preview");
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const confirmImport = () => {
    if (!parsed) return;
    onImport(parsed);
    setStep("done");
    setTimeout(onClose, 1400);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg rounded-3xl overflow-hidden pointer-events-auto"
          style={{ background: "#fff", boxShadow: "0 32px 80px rgba(0,0,0,0.18)", border: "1px solid rgba(0,0,0,0.06)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div>
              <div className="crown-badge mb-1">Step 1 of 5</div>
              <h2 className="text-lg font-black text-zinc-950 uppercase tracking-tight" style={{ fontFamily: "'Outfit',sans-serif" }}>
                Import Leads
              </h2>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>
                Upload a CSV — we'll map name, phone, company &amp; score automatically.
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="px-6 py-5">
            {step === "upload" && (
              <>
                {/* Drop zone */}
                <motion.div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  animate={{ borderColor: dragOver ? "#1F8A70" : "rgba(31,138,112,0.25)", background: dragOver ? "rgba(31,138,112,0.05)" : "rgba(31,138,112,0.02)" }}
                  transition={{ duration: 0.18 }}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer py-10 transition-all"
                >
                  <motion.div
                    animate={{ y: dragOver ? -4 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="text-center">
                    <div className="text-sm font-black text-zinc-800">Drop your CSV here</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>or click to browse files</div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: "rgba(31,138,112,0.1)", color: "#1F8A70" }}>
                    .CSV files only
                  </span>
                </motion.div>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />

                {/* Expected columns */}
                <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "#A67C2E" }}>Expected columns (any order)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["name", "phone", "company", "score", "bucket"].map(col => (
                      <span key={col} className="text-[9px] font-black px-2 py-0.5 rounded-md font-mono"
                        style={{ background: "rgba(212,175,55,0.12)", color: "#A67C2E" }}>{col}</span>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#DC2626" }} />
                    <span className="text-[11px] font-bold" style={{ color: "#DC2626" }}>{error}</span>
                  </motion.div>
                )}
              </>
            )}

            {step === "preview" && parsed && (
              <>
                {/* File info */}
                <div className="flex items-center gap-2.5 mb-4 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(31,138,112,0.06)", border: "1px solid rgba(31,138,112,0.15)" }}>
                  <FileText className="w-4 h-4 shrink-0" style={{ color: "#1F8A70" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black truncate" style={{ color: "#1F8A70" }}>{fileName}</div>
                    <div className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>{parsed.length} leads detected</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#1F8A70" }} />
                </div>

                {/* Preview table */}
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                  <div className="grid grid-cols-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(0,0,0,0.03)", color: "#94a3b8", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>Name</div><div>Phone</div><div>Company</div>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {parsed.slice(0, 8).map((lead, i) => (
                      <motion.div key={lead.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid grid-cols-3 px-3 py-2.5 text-[11px] font-medium"
                        style={{ borderBottom: i < Math.min(parsed.length, 8) - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", color: "#09090b" }}>
                        <div className="truncate font-bold">{lead.name}</div>
                        <div className="truncate font-mono text-[10px]" style={{ color: "#71717a" }}>{lead.phone}</div>
                        <div className="truncate" style={{ color: "#71717a" }}>{lead.company}</div>
                      </motion.div>
                    ))}
                  </div>
                  {parsed.length > 8 && (
                    <div className="px-3 py-2 text-center text-[10px] font-bold" style={{ color: "#94a3b8", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      +{parsed.length - 8} more leads
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setParsed(null); setStep("upload"); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border transition-all hover:bg-zinc-50"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "#71717a" }}>
                    Change File
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={confirmImport}
                    className="flex-[2] py-2.5 rounded-xl text-xs font-black uppercase tracking-wide text-white"
                    style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
                    Import {parsed.length} Leads →
                  </motion.button>
                </div>
              </>
            )}

            {step === "done" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-3">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-base font-black text-zinc-900" style={{ fontFamily: "'Outfit',sans-serif" }}>Leads Imported!</div>
                <div className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>All leads are now in your pipeline.</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showImport, setShowImport] = useState(false);

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
    const matchBucket = filter === "ALL" || l.bucket === filter;
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchSearch && matchBucket && matchStatus;
  });

  const chips = [
    { label: "All Leads", count: allLeads.length,                                                  color: "#0F3D3E", filter: "ALL"  },
    { label: "Hot",       count: allLeads.filter((l: Lead) => l.bucket === "HOT").length,          color: "#1F8A70", filter: "HOT"  },
    { label: "Warm",      count: allLeads.filter((l: Lead) => l.bucket === "WARM").length,         color: "#D4AF37", filter: "WARM" },
    { label: "Cold",      count: allLeads.filter((l: Lead) => l.bucket === "COLD").length,         color: "#94A3B8", filter: "COLD" },
  ];

  return (
    <DashboardLayout>
      <AnimatePresence>
        {showImport && (
          <ImportModal
            onClose={() => setShowImport(false)}
            onImport={(imported) => {
              setAllLeads(prev => [...imported, ...prev]);
              setShowImport(false);
            }}
          />
        )}
      </AnimatePresence>
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
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
              <Upload className="w-3.5 h-3.5" /> Import CSV
            </motion.button>
            <motion.button onClick={fetchLeads} disabled={loading}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border"
              style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94a3b8", backgroundColor: "rgba(212,175,55,0.04)" }}>
              <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw className="w-3 h-3" />
              </motion.div>
              Refresh
            </motion.button>
          </div>
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

        {/* Search & Filter */}
        <motion.div {...fadeUp(0.12)} className="flex gap-3 relative">
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
          <div className="relative">
            <motion.button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              style={{ 
                background: isFilterOpen ? "rgba(31,138,112,0.1)" : "rgba(255,255,255,0.8)", 
                border: isFilterOpen ? "1px solid rgba(31,138,112,0.3)" : "1px solid rgba(0,0,0,0.07)", 
                color: isFilterOpen ? "#1F8A70" : "#71717a" 
              }}>
              <Filter className="w-3.5 h-3.5" /> Filter
              {(filter !== "ALL" || statusFilter !== "ALL") && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F8A70] ml-0.5" />
              )}
            </motion.button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl p-4 z-50 shadow-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)" }}>
                  
                  <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-zinc-400">By Outcome</div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {["ALL", "HOT", "WARM", "COLD"].map(o => (
                      <button key={o} onClick={() => setFilter(o)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-left transition-all"
                        style={{ 
                          background: filter === o ? "rgba(31,138,112,0.1)" : "rgba(0,0,0,0.02)",
                          color: filter === o ? "#1F8A70" : "#71717a",
                          border: filter === o ? "1px solid rgba(31,138,112,0.2)" : "1px solid transparent"
                        }}>
                        {o}
                      </button>
                    ))}
                  </div>

                  <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-zinc-400">By Status</div>
                  <div className="space-y-1">
                    {["ALL", "COMPLETED", "CALLING", "FAILED"].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className="w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between"
                        style={{ 
                          background: statusFilter === s ? "rgba(212,175,55,0.1)" : "transparent",
                          color: statusFilter === s ? "#A67C2E" : "#71717a"
                        }}>
                        {s}
                        {statusFilter === s && <div className="w-1 h-1 rounded-full bg-[#A67C2E]" />}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => { setFilter("ALL"); setStatusFilter("ALL"); setIsFilterOpen(false); }}
                    className="w-full mt-4 pt-3 text-[9px] font-black uppercase tracking-widest text-center border-t border-zinc-100 text-zinc-400 hover:text-zinc-600">
                    Reset All Filters
                  </button>
                </motion.div>
              </>
            )}
          </div>
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
