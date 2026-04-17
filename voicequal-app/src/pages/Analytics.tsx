import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useRef, useCallback } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const weeklyData = [
  { day: "Mon", calls: 142, hot: 38, warm: 55, cold: 49 },
  { day: "Tue", calls: 168, hot: 51, warm: 62, cold: 55 },
  { day: "Wed", calls: 155, hot: 44, warm: 58, cold: 53 },
  { day: "Thu", calls: 190, hot: 67, warm: 71, cold: 52 },
  { day: "Fri", calls: 175, hot: 59, warm: 65, cold: 51 },
  { day: "Sat", calls: 88,  hot: 28, warm: 35, cold: 25 },
  { day: "Sun", calls: 72,  hot: 25, warm: 28, cold: 19 },
];

const maxCalls = Math.max(...weeklyData.map(d => d.calls));

const kpis = [
  { label: "Avg BANT Score",      value: "7.4",   unit: "/10",  change: "+0.8",  up: true,  color: "#1F8A70", bg: "rgba(31,138,112,0.06)"  },
  { label: "Call Answer Rate",    value: "75.1",  unit: "%",    change: "+2.3%", up: true,  color: "#D4AF37", bg: "rgba(212,175,55,0.06)"  },
  { label: "Avg Call Duration",   value: "4m 12s", unit: "",    change: "-18s",  up: false, color: "#0F3D3E", bg: "rgba(15,61,62,0.06)"    },
  { label: "Cost per Qual. Lead", value: "₹412",  unit: "",     change: "-₹38",  up: true,  color: "#A67C2E", bg: "rgba(166,124,46,0.06)"  },
];

function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !innerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    innerRef.current.style.transform = `perspective(900px) rotateX(${((y - rect.height / 2) / (rect.height / 2)) * -5}deg) rotateY(${((x - rect.width / 2) / (rect.width / 2)) * 5}deg) scale3d(1.01,1.01,1.01)`;
    innerRef.current.style.setProperty('--shine-x', `${x}px`);
    innerRef.current.style.setProperty('--shine-y', `${y}px`);
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  }, []);
  return { ref, innerRef, handleMouseMove, handleMouseLeave };
}

function KpiCard({ kpi, delay }: { kpi: typeof kpis[0]; delay: number }) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  return (
    <motion.div {...fadeUp(delay)}>
      <div ref={ref} className="tilt-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div ref={innerRef} className="premium-card px-4 py-3 cursor-default" style={{ transition: 'transform 0.15s ease-out' }}>
          <div className="tilt-shine rounded-[20px]" />
          <div className="tilt-gold-shine rounded-[20px]" />

          <div className="text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10" style={{ color: "#94a3b8" }}>{kpi.label}</div>
          <div className="text-2xl font-black tracking-tight relative z-10" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
            {kpi.value}<span className="text-base font-bold ml-0.5" style={{ color: "#94a3b8" }}>{kpi.unit}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 relative z-10">
            {kpi.up
              ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
              : <TrendingDown className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />}
            <span className="text-[11px] font-black" style={{ color: kpi.up ? "#1F8A70" : "#DC2626" }}>{kpi.change}</span>
            <span className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>vs last week</span>
          </div>
          {/* Bottom gradient bar */}
          <div className="absolute bottom-0 left-4 right-4 h-[1px]"
            style={{ background: `linear-gradient(90deg,transparent,${kpi.color}25,transparent)` }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const totalByDay = weeklyData.reduce((sum, d) => sum + d.hot, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-2 mb-1">
            <div className="crown-badge">Performance Metrics</div>
          </div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Analytics</h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
            Performance metrics and trends — <span style={{ color: "#1F8A70", fontWeight: 700 }}>{totalByDay} hot leads</span> generated this week.
          </p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi} delay={0.05 + i * 0.07} />)}
        </div>

        {/* Bar chart */}
        <motion.div {...fadeUp(0.18)} className="premium-card p-6">
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
              <span className="font-black text-sm uppercase tracking-wide" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
                Weekly Call Volume & Outcomes
              </span>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Hot", color: "#1F8A70" }, { label: "Warm", color: "#D4AF37" }, { label: "Cold", color: "#CBD5E1" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-[11px] font-bold" style={{ color: "#71717a" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-end gap-3 h-52">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col justify-end gap-0.5 cursor-pointer" style={{ height: 176 }}>
                  {/* Hot segment */}
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(d.hot / maxCalls) * 100}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-t-lg relative overflow-hidden group-hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#1F8A70", boxShadow: "0 -2px 8px rgba(31,138,112,0.3)" }}
                    title={`Hot: ${d.hot}`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "linear-gradient(0deg, transparent, rgba(255,255,255,0.15))" }} />
                  </motion.div>
                  {/* Warm segment */}
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(d.warm / maxCalls) * 100}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 + 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full group-hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#D4AF37", opacity: 0.8 }} title={`Warm: ${d.warm}`}
                  />
                  {/* Cold segment */}
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(d.cold / maxCalls) * 100}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-b-sm group-hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#CBD5E1", opacity: 0.65 }} title={`Cold: ${d.cold}`}
                  />
                </div>
                {/* Day label */}
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{d.day}</div>
                {/* Calls count tooltip */}
                <div className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity tabular-nums" style={{ color: "#1F8A70" }}>{d.calls}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily breakdown */}
        <motion.div {...fadeUp(0.28)} className="premium-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
            <span className="font-black text-sm uppercase tracking-wide" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
              Daily Breakdown — Hot Lead Rate
            </span>
          </div>
          <div className="space-y-4">
            {[...weeklyData].sort((a, b) => b.hot - a.hot).map((d, i) => {
              const pct = Math.round((d.hot / d.calls) * 100);
              return (
                <motion.div key={d.day}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 group"
                >
                  {/* Rank badge */}
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{
                      background: i === 0 ? "rgba(212,175,55,0.15)" : "rgba(0,0,0,0.04)",
                      color: i === 0 ? "#D4AF37" : "#94a3b8",
                      border: i === 0 ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(0,0,0,0.06)",
                    }}>
                    {i + 1}
                  </div>
                  <div className="w-10 text-xs font-black" style={{ color: "#71717a" }}>{d.day}</div>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(31,138,112,0.08)" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full" style={{ backgroundColor: "#1F8A70" }}
                    />
                  </div>
                  <div className="w-16 text-xs font-black text-right" style={{ color: "#1F8A70" }}>{pct}% hot</div>
                  <div className="w-16 text-xs text-right font-mono font-medium" style={{ color: "#94a3b8" }}>{d.calls} calls</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
