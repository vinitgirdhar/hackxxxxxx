import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
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
  { label: "Avg BANT Score",      value: "7.4",   unit: "/10",  change: "+0.8", up: true,  color: "#1F8A70" },
  { label: "Call Answer Rate",    value: "75.1",  unit: "%",    change: "+2.3%", up: true,  color: "#D4AF37" },
  { label: "Avg Call Duration",   value: "4m 12s", unit: "",    change: "-18s",  up: false, color: "#0F3D3E" },
  { label: "Cost per Qual. Lead", value: "₹412",  unit: "",     change: "-₹38",  up: true,  color: "#A67C2E" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>Performance metrics and trends for this week.</p>
      </motion.div>

      {/* KPI cards */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="premium-card p-5">
            <div className="text-[12px] font-medium mb-3" style={{ color: "#71717a" }}>{kpi.label}</div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>
              {kpi.value}<span className="text-base font-medium ml-0.5" style={{ color: "#94a3b8" }}>{kpi.unit}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {kpi.up
                ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
                : <TrendingDown className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />}
              <span className="text-[11px] font-bold" style={{ color: kpi.up ? "#1F8A70" : "#DC2626" }}>{kpi.change}</span>
              <span className="text-[10px]" style={{ color: "#94a3b8" }}>vs last week</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bar chart */}
      <motion.div {...fadeUp(0.15)} className="premium-card p-6">
        <div className="font-semibold text-sm mb-6 flex items-center gap-2" style={{ color: "#09090b" }}>
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
          Weekly Call Volume & Outcomes
        </div>
        <div className="flex items-end gap-3 h-48">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: 160 }}>
                {/* Hot */}
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.hot / maxCalls) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className="w-full rounded-t-md"
                  style={{ backgroundColor: "#1F8A70", opacity: 0.85 }}
                  title={`Hot: ${d.hot}`} />
                {/* Warm */}
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.warm / maxCalls) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 + 0.05 }}
                  className="w-full"
                  style={{ backgroundColor: "#D4AF37", opacity: 0.75 }}
                  title={`Warm: ${d.warm}`} />
                {/* Cold */}
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.cold / maxCalls) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 + 0.1 }}
                  className="w-full rounded-b-sm"
                  style={{ backgroundColor: "#CBD5E1", opacity: 0.7 }}
                  title={`Cold: ${d.cold}`} />
              </div>
              <div className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>{d.day}</div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          {[{ label: "Hot", color: "#1F8A70" }, { label: "Warm", color: "#D4AF37" }, { label: "Cold", color: "#CBD5E1" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] font-medium" style={{ color: "#71717a" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top performing days */}
      <motion.div {...fadeUp(0.25)} className="premium-card p-6">
        <div className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "#09090b" }}>
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
          Daily Breakdown
        </div>
        <div className="space-y-3">
          {[...weeklyData].sort((a, b) => b.hot - a.hot).map((d, i) => {
            const pct = Math.round((d.hot / d.calls) * 100);
            return (
              <div key={d.day} className="flex items-center gap-4">
                <div className="w-8 text-xs font-bold" style={{ color: "#71717a" }}>{d.day}</div>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(31,138,112,0.08)" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.06 }}
                    className="h-full rounded-full" style={{ backgroundColor: "#1F8A70" }} />
                </div>
                <div className="w-16 text-xs font-bold text-right" style={{ color: "#1F8A70" }}>{pct}% hot</div>
                <div className="w-16 text-xs text-right font-mono" style={{ color: "#94a3b8" }}>{d.calls} calls</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
