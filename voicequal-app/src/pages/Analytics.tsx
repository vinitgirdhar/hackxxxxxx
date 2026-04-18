import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useRef, useCallback, useState } from "react";

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
          <div className="absolute bottom-0 left-4 right-4 h-[1px]"
            style={{ background: `linear-gradient(90deg,transparent,${kpi.color}25,transparent)` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── SVG Line / Area chart ─────────────────────────────────────────────────
function LineAreaChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Use a tall viewport so x-axis labels sit inside the SVG
  const W = 800, H = 280, PAD_L = 44, PAD_R = 24, PAD_T = 20, PAD_B = 44;
  const cW = W - PAD_L - PAD_R;
  const cH = H - PAD_T - PAD_B;
  const n  = weeklyData.length;
  const maxVal = Math.max(...weeklyData.map(d => d.calls)) * 1.15;

  const xPos = (i: number) => PAD_L + (i / (n - 1)) * cW;
  const yPos = (v: number) => PAD_T + cH - (v / maxVal) * cH;

  function cubicPath(values: number[]) {
    const pts = values.map((v, i) => [xPos(i), yPos(v)] as [number, number]);
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
      d += ` C ${cpx},${pts[i][1]} ${cpx},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  }

  function areaPath(values: number[]) {
    const line = cubicPath(values);
    return `${line} L ${xPos(n - 1)},${PAD_T + cH} L ${xPos(0)},${PAD_T + cH} Z`;
  }

  const series = [
    { key: "calls" as const, color: "#818cf8", label: "Total Calls", sw: 2.5 },
    { key: "hot"   as const, color: "#1F8A70", label: "Hot",         sw: 2.2 },
    { key: "warm"  as const, color: "#D4AF37", label: "Warm",        sw: 2.2 },
    { key: "cold"  as const, color: "#94a3b8", label: "Cold",        sw: 1.8 },
  ];

  const yLabels = [0, 50, 100, 150, 200];

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 280, display: "block" }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`ag-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity="0.22" />
              <stop offset="85%" stopColor={s.color} stopOpacity="0.03" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="lineglow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Horizontal grid + Y labels */}
        {yLabels.map(v => (
          <g key={v}>
            <line
              x1={PAD_L} y1={yPos(v)} x2={W - PAD_R} y2={yPos(v)}
              stroke={v === 0 ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)"}
              strokeWidth="1"
              strokeDasharray={v === 0 ? "none" : "5 6"}
            />
            <text x={PAD_L - 8} y={yPos(v) + 4} textAnchor="end"
              fontSize="10" fill="#b0b7c3" fontFamily="monospace" fontWeight="600">{v}</text>
          </g>
        ))}

        {/* Bottom axis line */}
        <line x1={PAD_L} y1={PAD_T + cH} x2={W - PAD_R} y2={PAD_T + cH}
          stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />

        {/* Vertical column separators (light) */}
        {weeklyData.map((_, i) => i > 0 && (
          <line key={i} x1={xPos(i)} y1={PAD_T} x2={xPos(i)} y2={PAD_T + cH}
            stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
        ))}

        {/* Area fills (bottom-most to top-most for correct z-order) */}
        {[...series].reverse().map(s => (
          <motion.path key={`a-${s.key}`}
            d={areaPath(weeklyData.map(d => d[s.key]))}
            fill={`url(#ag-${s.key})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.2 }}
          />
        ))}

        {/* Lines */}
        {series.map(s => (
          <motion.path key={`l-${s.key}`}
            d={cubicPath(weeklyData.map(d => d[s.key]))}
            fill="none" stroke={s.color} strokeWidth={s.sw}
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            filter={s.key === "calls" ? "url(#lineglow)" : undefined}
          />
        ))}

        {/* Hover zones + X-axis day labels (inside SVG so they scale correctly) */}
        {weeklyData.map((d, i) => (
          <g key={d.day}>
            <rect
              x={xPos(i) - cW / (n * 2)} y={PAD_T}
              width={cW / n} height={cH + PAD_B * 0.6}
              fill="transparent" style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoverIdx(i)}
            />
            {/* Tick mark */}
            <line x1={xPos(i)} y1={PAD_T + cH} x2={xPos(i)} y2={PAD_T + cH + 5}
              stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
            {/* Day label */}
            <text
              x={xPos(i)} y={PAD_T + cH + 20}
              textAnchor="middle" fontSize="11" fill={hoverIdx === i ? "#0F3D3E" : "#94a3b8"}
              fontWeight="800"
              style={{ textTransform: "uppercase", letterSpacing: "0.08em", transition: "fill 0.15s" }}
            >
              {d.day}
            </text>
          </g>
        ))}

        {/* Crosshair + dots on hover */}
        {hoverIdx !== null && (() => {
          const d = weeklyData[hoverIdx];
          const x = xPos(hoverIdx);
          return (
            <g>
              <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + cH}
                stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeDasharray="5 4" />
              {series.map(s => (
                <g key={s.key}>
                  <circle cx={x} cy={yPos(d[s.key])} r="6"
                    fill={s.color} opacity="0.15" />
                  <circle cx={x} cy={yPos(d[s.key])} r="4"
                    fill="white" stroke={s.color} strokeWidth="2.5"
                    style={{ filter: `drop-shadow(0 0 4px ${s.color}80)` }} />
                </g>
              ))}
            </g>
          );
        })()}
      </svg>

      {/* Floating Tooltip — positioned relative to the container div */}
      {hoverIdx !== null && (() => {
        const d = weeklyData[hoverIdx];
        // clamp so tooltip never bleeds off the right edge
        const rawLeft = (xPos(hoverIdx) / W) * 100;
        const clampedLeft = Math.min(Math.max(rawLeft, 12), 85);
        return (
          <div
            className="absolute pointer-events-none z-50"
            style={{ bottom: "52px", left: `${clampedLeft}%`, transform: "translateX(-50%)" }}
          >
            <div
              className="rounded-xl shadow-2xl overflow-hidden"
              style={{
                width: 148,
                background: "rgba(10,12,18,0.96)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Tooltip header */}
              <div className="px-3.5 py-2.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#6b7280" }}>
                  {d.day}
                </span>
                <span className="text-[13px] font-black tabular-nums" style={{ color: "#818cf8" }}>
                  {d.calls} <span className="text-[10px] font-bold" style={{ color: "#4b5563" }}>calls</span>
                </span>
              </div>

              {/* Rows */}
              <div className="px-3.5 py-3 space-y-2.5">
                {series.slice(1).map(s => (
                  <div key={s.key} className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: "#9ca3af" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span className="text-[12px] font-black tabular-nums text-white">{d[s.key]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* tail */}
            <div className="mx-auto mt-[-1px] w-3 h-3 rotate-45"
              style={{
                background: "rgba(10,12,18,0.96)",
                border: "0 solid transparent",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}

export default function Analytics() {
  const totalByDay = weeklyData.reduce((sum, d) => sum + d.hot, 0);

  const legendSeries = [
    { label: "Total Calls", color: "#818cf8" },
    { label: "Hot",         color: "#1F8A70" },
    { label: "Warm",        color: "#D4AF37" },
    { label: "Cold",        color: "#94a3b8" },
  ];

  const generatePDF = () => {
    const totalCalls = weeklyData.reduce((s, d) => s + d.calls, 0);
    const totalHot   = weeklyData.reduce((s, d) => s + d.hot,   0);
    const totalWarm  = weeklyData.reduce((s, d) => s + d.warm,  0);
    const totalCold  = weeklyData.reduce((s, d) => s + d.cold,  0);
    const now = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

    const rowsHTML = [...weeklyData]
      .sort((a, b) => b.hot - a.hot)
      .map((d, i) => {
        const pct = Math.round((d.hot / d.calls) * 100);
        return `<tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
          <td style="padding:10px 14px;font-weight:800;color:#374151">${i + 1}</td>
          <td style="padding:10px 14px;font-weight:700;color:#374151">${d.day}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:700">${d.calls}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:800;color:#1F8A70">${d.hot}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:700;color:#D4AF37">${d.warm}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:700;color:#94a3b8">${d.cold}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:800;color:#0F3D3E">${pct}%</td>
        </tr>`;
      }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>VoiceQual Analytics Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Outfit',sans-serif; background:#fff; color:#111; padding:40px 48px; }
        .logo { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
        .logo-mark { width:36px; height:36px; border-radius:10px;
          background:linear-gradient(135deg,#1F8A70,#0F3D3E);
          display:flex; align-items:center; justify-content:center;
          color:white; font-weight:900; font-size:16px; }
        .logo-name { font-size:20px; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase; }
        .logo-name span { color:#1F8A70; }
        .report-meta { font-size:12px; color:#9ca3af; margin-left:auto; }
        h1 { font-size:26px; font-weight:900; text-transform:uppercase; letter-spacing:-0.5px; color:#09090b; }
        .subtitle { font-size:13px; color:#71717a; margin-top:6px; margin-bottom:28px; }
        .divider { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
        .kpi-card { border:1px solid #e5e7eb; border-radius:12px; padding:16px 18px; background:#fafafa; }
        .kpi-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:#9ca3af; margin-bottom:6px; }
        .kpi-value { font-size:24px; font-weight:900; color:#09090b; }
        .kpi-unit { font-size:14px; font-weight:600; color:#9ca3af; }
        .kpi-change { font-size:11px; font-weight:700; margin-top:4px; }
        .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:28px; }
        .summary-cell { padding:14px 18px; border-right:1px solid #e5e7eb; }
        .summary-cell:last-child { border-right:none; }
        .summary-cell .label { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.14em; color:#9ca3af; }
        .summary-cell .val { font-size:22px; font-weight:900; margin-top:2px; }
        h2 { font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; color:#09090b; margin-bottom:14px; }
        table { width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; font-size:13px; }
        thead tr { background:linear-gradient(135deg,#1F8A70,#0F3D3E); color:#fff; }
        thead th { padding:11px 14px; text-align:left; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; }
        thead th:not(:first-child) { text-align:right; }
        .footer { margin-top:32px; text-align:center; font-size:11px; color:#9ca3af; }
        @media print { body { padding:20px 28px; } }
      </style>
    </head><body>
      <div class="logo">
        <div class="logo-mark">V</div>
        <div class="logo-name">Voice<span>Qual</span> <span style="color:#D4AF37;font-size:11px;font-weight:700;">AI PLATFORM</span></div>
        <div class="report-meta">Analytics Report &nbsp;·&nbsp; ${now}</div>
      </div>

      <h1>Analytics Report</h1>
      <p class="subtitle">Weekly call performance &amp; lead qualification metrics — <strong style="color:#1F8A70">${totalHot} hot leads</strong> generated this week.</p>

      <hr class="divider" />

      <div class="kpi-grid">
        ${kpis.map(k => `<div class="kpi-card">
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value">${k.value}<span class="kpi-unit">${k.unit}</span></div>
          <div class="kpi-change" style="color:${k.up ? '#1F8A70' : '#DC2626'}">${k.change} vs last week</div>
        </div>`).join("")}
      </div>

      <h2>Weekly Summary</h2>
      <div class="summary-grid">
        <div class="summary-cell"><div class="label">Total Calls</div><div class="val" style="color:#818cf8">${totalCalls.toLocaleString()}</div></div>
        <div class="summary-cell"><div class="label">Hot Leads</div><div class="val" style="color:#1F8A70">${totalHot.toLocaleString()}</div></div>
        <div class="summary-cell"><div class="label">Warm Leads</div><div class="val" style="color:#D4AF37">${totalWarm.toLocaleString()}</div></div>
        <div class="summary-cell"><div class="label">Cold Leads</div><div class="val" style="color:#94a3b8">${totalCold.toLocaleString()}</div></div>
      </div>

      <h2>Daily Breakdown — Hot Lead Rate</h2>
      <table>
        <thead><tr>
          <th>#</th><th>Day</th><th>Total Calls</th><th>HOT</th><th>Warm</th><th>Cold</th><th>Hot Rate</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>

      <div class="footer">VoiceQual AI Platform &nbsp;·&nbsp; Generated ${now} &nbsp;·&nbsp; Confidential</div>

      <script>window.onload = () => { window.print(); }<\/script>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.open(); win.document.write(html); win.document.close(); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between flex-wrap gap-4 print-hide">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">Performance Metrics</div>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Analytics</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              Performance metrics and trends — <span style={{ color: "#1F8A70", fontWeight: 700 }}>{totalByDay} hot leads</span> generated this week.
            </p>
          </div>
          
          {/* Download PDF button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={generatePDF}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[13px] font-black text-white uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg,#1F8A70,#0F3D3E)",
              boxShadow: "0 8px 24px rgba(31,138,112,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            <Download className="w-4 h-4" /> Download PDF
          </motion.button>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi} delay={0.05 + i * 0.07} />)}
        </div>

        {/* Line / Area chart */}
        <motion.div {...fadeUp(0.18)} className="premium-card overflow-hidden">

          {/* Card header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
                <span className="font-black text-sm uppercase tracking-wide" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
                  Weekly Call Volume & Outcomes
                </span>
              </div>
              <p className="text-[11px] font-medium pl-3" style={{ color: "#94a3b8" }}>Mon – Sun · this week · hover a day for details</p>
            </div>
            <div className="flex items-center gap-5 pt-0.5">
              {legendSeries.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-7 h-[2.5px] rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] font-bold" style={{ color: "#71717a" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat summary strip */}
          <div className="grid grid-cols-4 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            {[
              { label: "Total Calls", value: weeklyData.reduce((s, d) => s + d.calls, 0), color: "#818cf8" },
              { label: "Hot Leads",   value: weeklyData.reduce((s, d) => s + d.hot,   0), color: "#1F8A70" },
              { label: "Warm Leads",  value: weeklyData.reduce((s, d) => s + d.warm,  0), color: "#D4AF37" },
              { label: "Cold Leads",  value: weeklyData.reduce((s, d) => s + d.cold,  0), color: "#94a3b8" },
            ].map(st => (
              <div key={st.label} className="px-5 py-3 flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{st.label}</span>
                <span className="text-xl font-black tabular-nums" style={{ color: st.color }}>{st.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Chart — full bleed, no horizontal padding */}
          <div className="pt-2 pb-0 px-3">
            <LineAreaChart />
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
                  className="flex items-center gap-4 group">
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
