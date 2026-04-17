import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, PhoneOff, Clock, Mic, PhoneMissed, RefreshCw, MessageSquare, PlayCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const ELEVENLABS_API_KEY = "f86cd3c5c5c32a9b951409b35041b6bb83e73a5b7e711db8f783babbeb94f103";

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTime(unix_secs?: number): string {
  if (!unix_secs) return '—';
  return new Date(unix_secs * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function mapStatus(s: string): string {
  if (s === 'done') return 'COMPLETED';
  if (s === 'processing') return 'PROCESSING';
  if (s === 'in_progress' || s === 'calling') return 'CALLING';
  if (s === 'failed' || s === 'error') return 'FAILED';
  return s.toUpperCase();
}

const statusMap: Record<string, { icon: typeof PhoneCall; color: string; bg: string; label: string }> = {
  COMPLETED:  { icon: PhoneCall,   color: "#1F8A70", bg: "rgba(31,138,112,0.08)",  label: "Completed" },
  CALLING:    { icon: Mic,         color: "#D4AF37", bg: "rgba(212,175,55,0.08)",  label: "Live"      },
  PROCESSING: { icon: RefreshCw,   color: "#3B82F6", bg: "rgba(59,130,246,0.08)",  label: "Processing" },
  FAILED:     { icon: PhoneMissed, color: "#DC2626", bg: "rgba(239,68,68,0.08)",   label: "Failed"    },
};

const outcomeColors: Record<string, string> = { HOT: "#1F8A70", WARM: "#D4AF37", COLD: "#94A3B8" };

function MiniWave({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[40, 80, 55, 100, 65, 75, 45].map((h, i) => (
        <motion.div key={i}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
          className="w-[2px] rounded-full"
          style={{ height: `${h}%`, backgroundColor: color, transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  );
}

function TranscriptRow({ callId }: { callId: string }) {
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const fetchTranscript = async () => {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${callId}`, {
          headers: { "xi-api-key": ELEVENLABS_API_KEY }
        });
        const data = await res.json();
        if (active && data.transcript) {
          setTranscript(data.transcript);
        }
      } catch (err) {
        console.error("Failed to load transcript", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchTranscript();
    return () => { active = false; };
  }, [callId]);

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-5">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Transcript Section */}
        <div className="flex-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Transcript
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-20 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : transcript.length === 0 ? (
            <p className="text-sm text-zinc-400">No transcript available.</p>
          ) : (
            <div className="space-y-4">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
                  }`}>
                    <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                      msg.role === 'user' ? 'text-emerald-200' : 'text-zinc-500'
                    }`}>
                      {msg.role}
                    </div>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audio Recording Section */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col justify-center gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> Recording
          </h3>
          <div className="w-full">
            <audio 
              controls 
              className="w-full h-10"
              src={`https://api.elevenlabs.io/v1/convai/conversations/${callId}/audio`}
              controlsList="nodownload" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Calls() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/convai/conversations?limit=25", {
        headers: { "xi-api-key": ELEVENLABS_API_KEY }
      });
      const data = await res.json();
      if (data.conversations) {
        const mapped = data.conversations.map((c: any) => ({
          id: c.conversation_id,
          lead: c.call_summary_title || "Unknown Call",
          company: "ElevenLabs AI",
          duration: formatDuration(c.call_duration_secs),
          time: formatTime(c.start_time_unix_secs),
          status: mapStatus(c.status),
          score: null, 
          outcome: c.call_successful === 'success' ? 'HOT' : (c.call_successful === 'failure' ? 'COLD' : 'WARM')
        }));
        setCalls(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  const completed = calls.filter(c => c.status === 'COMPLETED').length;
  const failed = calls.filter(c => c.status === 'FAILED').length;
  
  const stats = [
    { label: "Total Calls",     value: String(calls.length), color: "#0F3D3E", icon: PhoneCall },
    { label: "Connected",       value: String(completed),    color: "#1F8A70", icon: PhoneCall },
    { label: "Failed / No-ans", value: String(failed),       color: "#DC2626", icon: PhoneOff  },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">ElevenLabs Integration</div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.18)" }}>
                Live Data
              </span>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Conversations</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              All outbound AI calls and their outcomes pulled directly from ElevenLabs.
            </p>
          </div>
          <motion.button onClick={() => { setExpanded(null); fetchCalls(); }} disabled={loading}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94a3b8", backgroundColor: "rgba(212,175,55,0.04)" }}>
            <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fadeUp(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }} className="premium-card p-5 flex items-center gap-4 cursor-default">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-black tabular-nums" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Calls list */}
        <motion.div {...fadeUp(0.16)} className="premium-card overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.08)", color: "#94a3b8", background: "rgba(212,175,55,0.02)" }}>
            <div className="flex-1">Summary / Lead</div>
            <div className="w-28 hidden md:block">Time</div>
            <div className="w-20 hidden lg:block">Duration</div>
            <div className="w-24">Status</div>
            <div className="w-20">Outcome</div>
          </div>

          {calls.map((call, i) => {
            const sm = statusMap[call.status] ?? statusMap.COMPLETED;
            const StatusIcon = sm.icon;
            const isLive = call.status === 'CALLING';
            const isExpanded = expanded === call.id;

            return (
              <div key={call.id} className="flex flex-col">
                <motion.div
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setExpanded(isExpanded ? null : call.id)}
                  className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-all activity-row group ${isExpanded ? 'bg-emerald-50/40' : 'hover:bg-emerald-50/20'}`}
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                >
                  {/* Lead icon + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isLive ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: sm.bg, border: `1px solid ${sm.color}25` }}>
                      {isLive ? <MiniWave color={sm.color} /> : <StatusIcon className="w-4 h-4" style={{ color: sm.color }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{call.lead}</div>
                      <div className="text-[11px] truncate font-medium" style={{ color: "#94a3b8" }}>{call.id.slice(0, 16)}...</div>
                    </div>
                  </div>

                  <div className="w-28 text-sm hidden md:flex items-center gap-1.5 font-medium" style={{ color: "#71717a" }}>
                    <Clock className="w-3 h-3 shrink-0" /> {call.time}
                  </div>

                  <div className="w-20 text-sm font-mono font-bold hidden lg:block" style={{ color: "#09090b" }}>
                    {call.duration}
                  </div>

                  <div className="w-24">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                      style={{ backgroundColor: sm.bg, color: sm.color }}>
                      {isLive ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                          {sm.label}
                        </span>
                      ) : sm.label}
                    </span>
                  </div>

                  <div className="w-20">
                    {call.outcome ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${outcomeColors[call.outcome]}12`, color: outcomeColors[call.outcome], border: `1px solid ${outcomeColors[call.outcome]}25` }}>
                        {call.outcome}
                      </span>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>—</span>
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden bg-zinc-50"
                    >
                      <TranscriptRow callId={call.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
