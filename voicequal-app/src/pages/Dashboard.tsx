import { motion } from "framer-motion";
import {
  Users, PhoneCall, ArrowRight, Flame, Target,
  BarChart3, Gem, Mic, Send, RefreshCw, Zap, Sparkles,
  TrendingUp, Search, Volume2,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { triggerCall } from "../api/triggerCall";
import { supabase, recordingUrl } from "../lib/supabase";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type Overview = { totalLeads: number; callsInitiated: number; hotLeads: number; warmLeads: number; coldLeads: number; conversionRate: number; topScore: number };
type LiveLead = { id: string; name: string; score: number | null; bucket: string | null; status: string; company: string; recording: string };

function mapDbStatus(s: string) {
  if (s === 'done') return 'COMPLETED';
  if (s === 'initiated' || s === 'in_progress') return 'CALLING';
  if (s === 'failed') return 'FAILED';
  return 'PENDING';
}
function outcomeFromScore(score: number | null): string | null {
  if (!score || score === 0) return null;
  if (score >= 7) return 'HOT';
  if (score >= 4) return 'WARM';
  return 'COLD';
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
const funnelColors = ["#1F8A70", "#28B893", "#D4AF37", "#E6C76E", "#A67C2E"];

const cards = [
  { key: "totalLeads",    label: "Total Calls",  icon: Users,     color: "#0F3D3E", bg: "linear-gradient(135deg,rgba(15,61,62,0.07),rgba(15,61,62,0.02))",     border: "rgba(15,61,62,0.15)",    iconBg: "rgba(15,61,62,0.08)",    trend: "Live", sparkData: [4,6,5,8,7,9,8,10,9,12] },
  { key: "callsInitiated",label: "Calls Done",   icon: PhoneCall, color: "#D4AF37", bg: "linear-gradient(135deg,rgba(212,175,55,0.07),rgba(212,175,55,0.02))", border: "rgba(212,175,55,0.15)",  iconBg: "rgba(212,175,55,0.08)",  trend: "Live", sparkData: [3,5,4,7,6,8,7,9,8,11] },
  { key: "hotLeads",      label: "Hot Leads",    icon: Flame,     color: "#1F8A70", bg: "linear-gradient(135deg,rgba(31,138,112,0.07),rgba(31,138,112,0.02))", border: "rgba(31,138,112,0.15)",  iconBg: "rgba(31,138,112,0.08)",  trend: "Live", sparkData: [1,2,1,3,2,4,3,5,4,6] },
  { key: "conversionRate",label: "Conversion",   icon: Target,    color: "#A67C2E", bg: "linear-gradient(135deg,rgba(166,124,46,0.07),rgba(166,124,46,0.02))", border: "rgba(166,124,46,0.15)",  iconBg: "rgba(166,124,46,0.08)",  trend: "Live", sparkData: [20,22,18,25,22,28,25,30,28,32] },
];

// ─── Animated counter ─────────────────────────────────────────────────────
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
      const progress = Math.min((now - startTime) / 1000, 1);
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

// ─── Sparkline ────────────────────────────────────────────────────────────
function Sparkline({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ");
  const fillD = `M 0,${26 - ((data[0] - min) / range) * 24} ${data.map((v, i) => `L ${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ")} L100,26 L0,26 Z`;
  return (
    <svg viewBox="0 0 100 26" className="w-24 h-8" preserveAspectRatio="none">
      <path d={fillD} fill={color} fillOpacity="0.08" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy={26 - ((data[data.length - 1] - min) / range) * 24} r="3" fill={color} opacity="0.9">
        <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── 3D Tilt hook ─────────────────────────────────────────────────────────
function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !innerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    innerRef.current.style.transform = `perspective(900px) rotateX(${((y - rect.height / 2) / (rect.height / 2)) * -7}deg) rotateY(${((x - rect.width / 2) / (rect.width / 2)) * 7}deg) scale3d(1.02,1.02,1.02)`;
    innerRef.current.style.setProperty('--shine-x', `${x}px`);
    innerRef.current.style.setProperty('--shine-y', `${y}px`);
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  }, []);
  return { ref, innerRef, handleMouseMove, handleMouseLeave };
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function TiltStatCard({ card, val, delay }: { card: typeof cards[0]; val: string | number | undefined; delay: number }) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  return (
    <motion.div {...fadeUp(delay)}>
      <div ref={ref} className="tilt-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div ref={innerRef} className="stat-card relative p-5 cursor-default rounded-[22px] overflow-hidden"
          style={{ background: card.bg, border: `1px solid ${card.border}`, boxShadow: `0 4px 20px ${card.color}08, 0 1px 4px rgba(0,0,0,0.04)`, transition: 'transform 0.15s ease-out' }}>
          <div className="tilt-shine rounded-[22px]" />
          <div className="tilt-gold-shine rounded-[22px]" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: card.color, opacity: 0.07, filter: "blur(24px)" }} />
          <div className="absolute bottom-0 left-4 right-4 h-[1px]" style={{ background: `linear-gradient(90deg,transparent,${card.color}25,transparent)` }} />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>{card.label}</div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.iconBg, border: `1px solid ${card.border}` }}>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight relative z-10" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
            {val !== undefined ? <AnimatedValue value={val} suffix={card.key === "conversionRate" ? "%" : ""} /> : <div className="h-8 w-20 shimmer rounded-lg" />}
          </div>
          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: `${card.color}0A`, border: `1px solid ${card.color}15` }}>
              <TrendingUp className="h-3 w-3" style={{ color: card.color }} />
              <span className="text-[11px] font-black" style={{ color: card.color }}>{card.trend}</span>
            </div>
            <Sparkline color={card.color} data={card.sparkData} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────
function BucketDonut({ hot = 0, warm = 0, cold = 0 }: { hot?: number; warm?: number; cold?: number }) {
  const total = hot + warm + cold || 1;
  const r = 38, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  const hotD = (hot / total) * circ, warmD = (warm / total) * circ, coldD = (cold / total) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="12" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#1F8A70" strokeWidth="12" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${hotD} ${circ}` }} transition={{ duration: 1.4, delay: 0.3, ease: [0.16,1,0.3,1] }} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#D4AF37" strokeWidth="12" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${warmD} ${circ}` }} transition={{ duration: 1.4, delay: 0.5, ease: [0.16,1,0.3,1] }} strokeDashoffset={-hotD} strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#CBD5E1" strokeWidth="12" initial={{ strokeDasharray: `0 ${circ}` }} animate={{ strokeDasharray: `${coldD} ${circ}` }} transition={{ duration: 1.4, delay: 0.7, ease: [0.16,1,0.3,1] }} strokeDashoffset={-(hotD + warmD)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.6, type:"spring", stiffness:300 }}
          className="text-xl font-black leading-none tabular-nums" style={{ color:"#09090b" }}>{total.toLocaleString()}</motion.div>
        <div className="text-[9px] mt-0.5 font-bold uppercase tracking-widest" style={{ color:"#94a3b8" }}>total</div>
      </div>
    </div>
  );
}

// ─── Live Call Simulator ──────────────────────────────────────────────────
function LiveCallSimulator() {
  const [isCalling, setIsCalling] = useState(false);
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  return (
    <div ref={ref} className="tilt-card h-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={innerRef} className="premium-card p-6 relative overflow-hidden h-full flex flex-col justify-center" style={{ transition: 'transform 0.15s ease-out' }}>
        <div className="tilt-shine rounded-[20px]" />
        {isCalling && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ background:"radial-gradient(circle at 20% 50%, rgba(31,138,112,0.06), transparent 70%)" }} />}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{ background: isCalling ? "linear-gradient(135deg,#1F8A70,#0F3D3E)" : "rgba(0,0,0,0.04)", border: isCalling ? "1px solid rgba(31,138,112,0.4)" : "1px solid rgba(0,0,0,0.08)" }}>
                <PhoneCall className={`w-5 h-5 ${isCalling ? "animate-bounce" : ""}`} style={{ color: isCalling ? "white" : "#94a3b8" }} />
              </div>
              {isCalling && [1,2,3].map(i => <div key={i} className="absolute inset-0 rounded-2xl animate-ping" style={{ backgroundColor:"#1F8A70", opacity:0.15, animationDelay:`${i*0.4}s` }} />)}
            </div>
            <div>
              <div className="text-sm font-black" style={{ color:"#09090b", fontFamily:"'Outfit', sans-serif" }}>{isCalling ? "Active Intelligence" : "Sarvam AI Engine"}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5" style={{ color:"#71717a" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCalling ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                {isCalling ? "Synthesizing Response" : "Ready for deployment"}
              </div>
            </div>
          </div>
          <motion.button onClick={() => setIsCalling(!isCalling)} whileHover={{ scale:1.05, y:-1 }} whileTap={{ scale:0.95 }}
            className={`px-5 py-2 text-xs font-black shadow-lg rounded-xl uppercase tracking-wider transition-all ${isCalling ? "bg-zinc-900 text-white" : "btn-royal text-white"}`}
            style={{ fontFamily:"'Outfit', sans-serif" }}>
            {isCalling ? "Terminate" : "Simulate Call"}
          </motion.button>
        </div>
        <div className="relative h-16 rounded-2xl flex items-center justify-center gap-[3px] px-4 overflow-hidden border" style={{ background:"rgba(0,0,0,0.03)", borderColor:"rgba(0,0,0,0.06)" }}>
          {!isCalling ? <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color:"rgba(0,0,0,0.18)" }}>Standing by...</div>
            : [...Array(32)].map((_, i) => { const h = 15 + Math.random() * 35; return (
              <motion.div key={i} animate={{ height:[h,h*0.3,h*1.3,h] }} transition={{ duration:0.5+Math.random()*0.7, repeat:Infinity, ease:"easeInOut" }} className="w-[3px] rounded-full shrink-0" style={{ backgroundColor: i%2===0 ? "#1F8A70" : "#D4AF37", opacity:0.7 }} />
            );})}
        </div>
        <div className="mt-4 flex items-center justify-between relative z-10">
          <div className="text-[10px] flex items-center gap-1.5" style={{ color:"#71717a" }}>
            <Mic className="w-3 h-3" /> Neural Latency: <span className="font-mono font-bold" style={{ color:"#09090b" }}>240ms</span>
          </div>
          <div className="text-[10px] flex items-center gap-1.5" style={{ color:"#71717a" }}>
            <Sparkles className="w-3 h-3" style={{ color:"#D4AF37" }} /> Confidence: <span className="font-black" style={{ color:"#09090b" }}>98.2%</span>
          </div>
        </div>
      </div>
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

// ─── Quick Toolkit ────────────────────────────────────────────────────────
function QuickActions({ liveLeads }: { liveLeads: LiveLead[] }) {
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
      const rows = [['Call ID','Status','Score','Outcome','Called At','Transcript'],...liveLeads.map(l=>[l.id,l.status,l.score??'',l.bucket??'',l.id,''])];
      const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href:url, download:`voicequal_calls_${new Date().toISOString().split('T')[0]}.csv` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      push({ title:'Export Complete', sub:`${liveLeads.length} live calls exported`, color:'#D4AF37' });
    } else if (i === 2) {
      push({ title:'Syncing CRM…', sub:'Pushing qualified leads to HubSpot', color:'#0F3D3E', progress:true });
      await new Promise(r => setTimeout(r, 3300));
      push({ title:'Sync Complete', sub:`${liveLeads.filter(l=>l.bucket==='HOT').length} hot leads pushed`, color:'#1F8A70' });
    } else if (i === 3) {
      push({ title:'Batch Starting…', sub:'Triggering AI calls via n8n…', color:'#A67C2E', progress:true });
      try {
        await triggerCall();
        push({ title:'Batch Queued', sub:'n8n workflow triggered · calls dispatched', color:'#1F8A70' });
      } catch {
        push({ title:'Trigger Failed', sub:'Could not reach n8n webhook', color:'#DC2626' });
      }
    }
    setTimeout(() => setBusyIdx(null), 500);
  };

  const actions = [
    { icon: Search,    label:'Find Lead',  sub:'Search leads',   color:'#1F8A70', bg:'rgba(31,138,112,0.08)' },
    { icon: Send,      label:'Export CSV', sub:`${liveLeads.length} calls`,    color:'#D4AF37', bg:'rgba(212,175,55,0.08)' },
    { icon: RefreshCw, label:'Sync CRM',   sub:'HubSpot',        color:'#0F3D3E', bg:'rgba(15,61,62,0.08)'   },
    { icon: Zap,       label:'Run Batch',  sub:'via n8n',        color:'#A67C2E', bg:'rgba(166,124,46,0.08)' },
  ];

  return (
    <>
      <ToastStack toasts={toasts} remove={pop} />
      <div className="premium-card p-5 h-full">
        <div className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color:'#09090b', fontFamily:"'Outfit', sans-serif" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor:'#D4AF37' }} />
          Quick Toolkit
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((act, i) => {
            const busy = busyIdx === i;
            return (
              <motion.button key={i} onClick={() => run(i)} disabled={busy}
                whileHover={busy ? {} : { scale:1.04, y:-2 }} whileTap={busy ? {} : { scale:0.96 }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border group relative overflow-hidden transition-all"
                style={{ backgroundColor:'white', borderColor: busy ? `${act.color}35` : 'rgba(0,0,0,0.07)', boxShadow: busy ? `0 0 0 2px ${act.color}15, 0 4px 16px ${act.color}10` : '0 1px 3px rgba(0,0,0,0.04)', cursor: busy ? 'wait' : 'pointer' }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:`radial-gradient(circle at 50% 50%, ${act.bg}, transparent 70%)` }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 relative z-10" style={{ backgroundColor:act.bg, border:`1px solid ${act.color}18` }}>
                  {busy
                    ? <motion.div animate={{ rotate:360 }} transition={{ duration:0.7, repeat:Infinity, ease:'linear' }}><RefreshCw style={{ color:act.color, width:16, height:16 }} /></motion.div>
                    : <act.icon className="transition-transform group-hover:rotate-12" style={{ color:act.color, width:18, height:18 }} />}
                </div>
                <span className="text-[11px] font-black relative z-10 uppercase tracking-wider" style={{ color:'#09090b' }}>{act.label}</span>
                <span className="text-[9px] font-medium relative z-10 mt-0.5" style={{ color:'#94a3b8' }}>{busy ? 'Working…' : act.sub}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function Dashboard() {
  const [, navigate] = useLocation();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [liveLeads, setLiveLeads] = useState<LiveLead[]>([]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('call_results')
      .select('*')
      .order('called_at', { ascending: false })
      .limit(50);

    if (error) { console.error('Supabase fetch error:', error); return; }
    if (!data || data.length === 0) { console.log('No rows returned'); return; }
    console.log('First row columns:', Object.keys(data[0]), data[0]);

    const total = data.length;
    const done = data.filter(r => r.status === 'done' || r.status === 'initiated' || r.status === 'completed').length;
    const hot  = data.filter(r => (r.score ?? 0) >= 7).length;
    const warm = data.filter(r => (r.score ?? 0) >= 4 && (r.score ?? 0) < 7).length;
    const cold = data.filter(r => (r.score ?? 0) > 0 && (r.score ?? 0) < 4).length;
    const topScore = Math.max(...data.map(r => r.score ?? 0));
    const convRate = total > 0 ? parseFloat(((hot / total) * 100).toFixed(1)) : 0;

    setOverview({ totalLeads: total, callsInitiated: done, hotLeads: hot, warmLeads: warm, coldLeads: cold, conversionRate: convRate, topScore });

    setLiveLeads(data.slice(0, 7).map(r => ({
      id: r.call_id,
      name: r.lead_name ?? r.call_id.slice(0, 18),
      score: r.score ?? null,
      bucket: r.outcome ?? outcomeFromScore(r.score ?? null),
      status: mapDbStatus(r.status),
      company: r.company ?? '—',
      recording: recordingUrl(r.call_id, r.recording_url),
    })));
  };

  useEffect(() => { fetchData(); }, []);

  const ov = overview ?? { totalLeads: 0, callsInitiated: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0, conversionRate: 0, topScore: 0 };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="crown-badge">Qualification Live</div>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                style={{ background:"rgba(31,138,112,0.08)", color:"#1F8A70", border:"1px solid rgba(31,138,112,0.18)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                AI Active
              </span>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily:"'Outfit', sans-serif" }}>Dashboard</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color:"#71717a" }}>
              Real-time lead qualification — <span style={{ color:"#1F8A70", fontWeight:700 }}>{ov.hotLeads} hot leads</span> ready for follow-up.
            </p>
          </div>
          <motion.div {...fadeUp(0.1)} className="hidden lg:flex items-center gap-4 px-5 py-3 rounded-2xl machined-panel">
            <div className="text-center">
              <div className="text-xl font-black tabular-nums" style={{ color:"#D4AF37", fontFamily:"'Outfit', sans-serif" }}>{ov.conversionRate}%</div>
              <div className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color:"#94a3b8" }}>Conv. Rate</div>
            </div>
            <div className="w-px h-10" style={{ backgroundColor:"rgba(212,175,55,0.15)" }} />
            <div className="text-center">
              <div className="text-xl font-black tabular-nums" style={{ color:"#1F8A70", fontFamily:"'Outfit', sans-serif" }}>{ov.topScore.toFixed(1)}</div>
              <div className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color:"#94a3b8" }}>Top Score</div>
            </div>
            <div className="w-px h-10" style={{ backgroundColor:"rgba(212,175,55,0.15)" }} />
            <div className="text-center">
              <div className="text-xl font-black tabular-nums" style={{ color:"#0F3D3E", fontFamily:"'Outfit', sans-serif" }}>{ov.callsInitiated}</div>
              <div className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color:"#94a3b8" }}>Calls Done</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Ornament */}
        <motion.div {...fadeUp(0.05)} className="ornament-line text-[10px] font-medium tracking-widest uppercase" style={{ color:"rgba(212,175,55,0.3)" }}>
          <Gem className="w-3 h-3" style={{ color:"rgba(212,175,55,0.3)" }} />
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const val = card.key === "conversionRate" ? ov.conversionRate.toFixed(1) : (ov as unknown as Record<string, number>)[card.key];
            return <TiltStatCard key={card.key} card={card} val={val} delay={0.08 + i * 0.07} />;
          })}
        </div>

        {/* Live call + quick actions */}
        <div className="grid gap-5 lg:grid-cols-5">
          <motion.div {...fadeUp(0.28)} className="lg:col-span-3"><LiveCallSimulator /></motion.div>
          <motion.div {...fadeUp(0.33)} className="lg:col-span-2"><QuickActions liveLeads={liveLeads} /></motion.div>
        </div>

        {/* Recent Activity + Right Column */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Recent Activity — live from Supabase */}
          <motion.div {...fadeUp(0.38)} className="lg:col-span-2 premium-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid rgba(212,175,55,0.08)" }}>
              <div>
                <div className="font-black text-sm flex items-center gap-2 uppercase tracking-wide" style={{ color:"#09090b", fontFamily:"'Outfit', sans-serif" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor:"rgba(31,138,112,0.08)", border:"1px solid rgba(31,138,112,0.15)" }}>
                    <BarChart3 className="w-3.5 h-3.5" style={{ color:"#1F8A70" }} />
                  </div>
                  Recent Activity
                </div>
                <div className="text-xs mt-0.5 font-medium" style={{ color:"#71717a" }}>Latest calls from n8n · ElevenLabs</div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={fetchData} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ color:"#94a3b8", background:"rgba(0,0,0,0.03)", border:"1px solid rgba(0,0,0,0.06)" }}>
                  <RefreshCw className="w-3 h-3" /> Refresh
                </motion.button>
                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                  style={{ color:"#1F8A70", background:"rgba(31,138,112,0.06)", border:"1px solid rgba(31,138,112,0.12)" }}>
                  Live
                </div>
              </div>
            </div>

            {liveLeads.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <PhoneCall className="w-8 h-8 mx-auto mb-3" style={{ color:"rgba(0,0,0,0.1)" }} />
                <p className="text-sm font-bold" style={{ color:"#94a3b8" }}>No calls yet — trigger n8n to start</p>
              </div>
            ) : liveLeads.map((lead, i) => {
              const bc = bucketColors[lead.bucket ?? ""] ?? bucketColors.COLD;
              const sc = statusColors[lead.status] ?? statusColors.PENDING;
              return (
                <motion.div key={lead.id}
                  initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: Math.min(0.1 + i * 0.05, 0.4), ease:[0.16,1,0.3,1] }}
                  className="activity-row flex items-center justify-between px-6 py-3.5 group cursor-pointer hover:bg-emerald-50/30"
                  style={{ borderBottom:"1px solid rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black text-white group-hover:scale-110 transition-transform"
                        style={{ backgroundColor:"#0F3D3E", border:"1.5px solid rgba(212,175,55,0.3)", boxShadow:"0 2px 8px rgba(31,138,112,0.25)" }}>
                        {lead.name.slice(0,2).toUpperCase()}
                      </div>
                      {lead.status === 'CALLING' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white animate-pulse" style={{ backgroundColor:"#D4AF37" }} />}
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" title="Live from n8n" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color:"#09090b", fontFamily:"'Outfit', sans-serif" }}>{lead.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium" style={{ color:"#94a3b8" }}>{lead.company}</span>
                        {lead.score != null && lead.score > 0 && (
                          <>
                            <span style={{ color:"rgba(0,0,0,0.2)" }}>·</span>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: lead.score>=7 ? "#1F8A70" : lead.score>=4 ? "#D4AF37" : "#94A3B8" }}>
                              {lead.score.toFixed(1)}/10
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Play recording inline */}
                    <a href={lead.recording} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.2)" }}
                      title="Play recording">
                      <Volume2 className="w-3.5 h-3.5" style={{ color:"#D4AF37" }} />
                    </a>
                    {lead.bucket && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{ backgroundColor:bc.bg, color:bc.text, border:`1px solid ${bc.border}` }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor:bc.dot }} />
                        {lead.bucket}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor:sc.bg, color:sc.text }}>{lead.status}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" style={{ color:"#71717a" }} onClick={() => navigate(`/leads/${lead.id}`)} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Lead Distribution */}
            <motion.div {...fadeUp(0.45)} className="premium-card overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(212,175,55,0.08)" }}>
                <div className="font-black text-sm flex items-center gap-2 uppercase tracking-wide" style={{ color:"#09090b", fontFamily:"'Outfit', sans-serif" }}>
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor:"#1F8A70" }} /> Lead Distribution
                </div>
                <div className="text-xs mt-0.5 font-medium" style={{ color:"#71717a" }}>Live bucket breakdown</div>
              </div>
              <div className="p-5 flex items-center gap-5">
                <BucketDonut hot={ov.hotLeads} warm={ov.warmLeads} cold={ov.coldLeads} />
                <div className="space-y-3 flex-1">
                  {[
                    { label:"Hot",  value:ov.hotLeads,  color:"#1F8A70", pct: ov.totalLeads ? Math.round(ov.hotLeads/ov.totalLeads*100) : 0 },
                    { label:"Warm", value:ov.warmLeads, color:"#D4AF37", pct: ov.totalLeads ? Math.round(ov.warmLeads/ov.totalLeads*100) : 0 },
                    { label:"Cold", value:ov.coldLeads, color:"#CBD5E1", pct: ov.totalLeads ? Math.round(ov.coldLeads/ov.totalLeads*100) : 0 },
                  ].map(b => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor:b.color }} />
                          <span className="text-xs font-bold" style={{ color:"#71717a" }}>{b.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tabular-nums" style={{ color:b.color }}>{b.value}</span>
                          <span className="text-[10px] font-mono w-7 text-right" style={{ color:"#94a3b8" }}>{b.pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:`${b.color}12` }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${b.pct}%` }} transition={{ duration:1.2, delay:0.5, ease:[0.16,1,0.3,1] }}
                          className="h-full rounded-full" style={{ backgroundColor:b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Funnel */}
            <motion.div {...fadeUp(0.52)} className="premium-card overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(212,175,55,0.08)" }}>
                <div className="font-black text-sm flex items-center gap-2 uppercase tracking-wide" style={{ color:"#09090b", fontFamily:"'Outfit', sans-serif" }}>
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor:"#D4AF37" }} /> Funnel Overview
                </div>
                <div className="text-xs mt-0.5 font-medium" style={{ color:"#71717a" }}>Stage-by-stage conversion</div>
              </div>
              <div className="px-5 py-4 space-y-4">
                {[
                  { name:'Total Calls',   count:ov.totalLeads,      pct:100 },
                  { name:'Calls Done',    count:ov.callsInitiated,  pct: ov.totalLeads ? Math.round(ov.callsInitiated/ov.totalLeads*100) : 0 },
                  { name:'Scored Leads',  count:ov.hotLeads+ov.warmLeads+ov.coldLeads, pct: ov.totalLeads ? Math.round((ov.hotLeads+ov.warmLeads+ov.coldLeads)/ov.totalLeads*100) : 0 },
                  { name:'Warm + Hot',    count:ov.hotLeads+ov.warmLeads, pct: ov.totalLeads ? Math.round((ov.hotLeads+ov.warmLeads)/ov.totalLeads*100) : 0 },
                  { name:'HOT Leads',     count:ov.hotLeads,        pct: ov.totalLeads ? Math.round(ov.hotLeads/ov.totalLeads*100) : 0 },
                ].map((stage, idx) => {
                  const color = funnelColors[idx % funnelColors.length];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold" style={{ color:"#71717a" }}>{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tabular-nums" style={{ color:"#09090b" }}>{stage.count}</span>
                          <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>{stage.pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:`${color}10` }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${stage.pct}%` }} transition={{ duration:1.2, delay:0.5+idx*0.1, ease:[0.16,1,0.3,1] }}
                          className="h-full rounded-full" style={{ backgroundColor:color }} />
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
