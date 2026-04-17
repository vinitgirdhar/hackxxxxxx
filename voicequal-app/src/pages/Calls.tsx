import { motion } from "framer-motion";
import { PhoneCall, PhoneOff, Clock, Mic, PhoneMissed } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const calls = [
  { id: '1', lead: 'Priya Menon',  company: 'Infosys',      duration: '4:32', time: '10:12 AM', status: 'COMPLETED', score: 9.1, outcome: 'HOT' },
  { id: '2', lead: 'Arjun Sharma', company: 'Wipro',        duration: '3:47', time: '10:45 AM', status: 'COMPLETED', score: 8.5, outcome: 'HOT' },
  { id: '3', lead: 'Neha Kapoor',  company: 'TCS',          duration: '5:10', time: '11:20 AM', status: 'COMPLETED', score: 6.2, outcome: 'WARM' },
  { id: '4', lead: 'Rohit Verma',  company: 'HCL Tech',     duration: '—',    time: '11:55 AM', status: 'CALLING',   score: null, outcome: null },
  { id: '5', lead: 'Anjali Singh', company: 'Cognizant',    duration: '2:05', time: '12:30 PM', status: 'COMPLETED', score: 2.1, outcome: 'COLD' },
  { id: '6', lead: 'Vikram Nair',  company: 'Tech Mahindra',duration: '—',    time: '1:15 PM',  status: 'FAILED',    score: null, outcome: null },
  { id: '7', lead: 'Kavya Reddy',  company: 'Mphasis',      duration: '6:22', time: '2:00 PM',  status: 'COMPLETED', score: 7.3, outcome: 'HOT' },
  { id: '8', lead: 'Meera Iyer',   company: 'L&T Infotech', duration: '4:58', time: '2:45 PM',  status: 'COMPLETED', score: 8.9, outcome: 'HOT' },
];

const statusMap: Record<string, { icon: typeof PhoneCall; color: string; bg: string; label: string }> = {
  COMPLETED: { icon: PhoneCall,   color: "#1F8A70", bg: "rgba(31,138,112,0.08)",  label: "Completed" },
  CALLING:   { icon: Mic,         color: "#D4AF37", bg: "rgba(212,175,55,0.08)",  label: "Live"      },
  FAILED:    { icon: PhoneMissed, color: "#DC2626", bg: "rgba(239,68,68,0.08)",   label: "Failed"    },
};

const outcomeColors: Record<string, string> = { HOT: "#1F8A70", WARM: "#D4AF37", COLD: "#94A3B8" };

export default function Calls() {
  const stats = [
    { label: "Total Calls",      value: "990",  color: "#0F3D3E", icon: PhoneCall   },
    { label: "Connected",        value: "743",  color: "#1F8A70", icon: PhoneCall   },
    { label: "Avg Duration",     value: "4m 12s", color: "#D4AF37", icon: Clock     },
    { label: "Failed / No-ans",  value: "247",  color: "#DC2626", icon: PhoneOff    },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>Calls</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>All outbound AI calls and their outcomes.</p>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="premium-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: "#09090b" }}>{s.value}</div>
              <div className="text-[11px] font-medium" style={{ color: "#71717a" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Calls list */}
      <motion.div {...fadeUp(0.15)} className="premium-card overflow-hidden">
        <div className="px-6 py-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", color: "#94a3b8", background: "rgba(0,0,0,0.01)" }}>
          <div className="flex-1">Lead</div>
          <div className="w-28 hidden md:block">Time</div>
          <div className="w-20 hidden lg:block">Duration</div>
          <div className="w-24">Status</div>
          <div className="w-20">Outcome</div>
        </div>
        {calls.map((call, i) => {
          const sm = statusMap[call.status] ?? statusMap.COMPLETED;
          const StatusIcon = sm.icon;
          return (
            <motion.div key={call.id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-6 py-4 hover:bg-emerald-50/30 cursor-pointer transition-colors"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: sm.bg, border: `1px solid ${sm.color}20` }}>
                  <StatusIcon className="w-4 h-4" style={{ color: sm.color }} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: "#09090b" }}>{call.lead}</div>
                  <div className="text-[11px] truncate" style={{ color: "#71717a" }}>{call.company}</div>
                </div>
              </div>
              <div className="w-28 text-sm hidden md:flex items-center gap-1.5" style={{ color: "#71717a" }}>
                <Clock className="w-3 h-3" /> {call.time}
              </div>
              <div className="w-20 text-sm font-mono hidden lg:block" style={{ color: "#09090b" }}>{call.duration}</div>
              <div className="w-24">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: sm.bg, color: sm.color }}>
                  {sm.label}
                </span>
              </div>
              <div className="w-20">
                {call.outcome ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${outcomeColors[call.outcome]}12`, color: outcomeColors[call.outcome], border: `1px solid ${outcomeColors[call.outcome]}25` }}>
                    {call.outcome}
                  </span>
                ) : <span style={{ color: "#cbd5e1" }}>—</span>}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
