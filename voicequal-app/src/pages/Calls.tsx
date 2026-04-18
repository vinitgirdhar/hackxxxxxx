import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall, PhoneOff, Clock, Mic, PhoneMissed,
  RefreshCw, MessageSquare, PlayCircle, Loader2, Sparkles,
  FileText, ChevronDown, Send,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { MOCK_CALLS } from "../lib/mockCalls";

// ── API Keys ──────────────────────────────────────────────────────────────────
const ELEVENLABS_API_KEY = "sk_865181f73d2db5ebfebdf24343837a6194959b066258b977";
const GROQ_API_KEY = "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";
const GROQ_MODEL   = "llama-3.1-8b-instant"; // fastest Groq model

// ── Types ─────────────────────────────────────────────────────────────────────
interface BANTScore {
  total: number;          // 0-10
  budget: number;         // 0-10
  authority: number;
  need: number;
  timeline: number;
  label: "HOT" | "WARM" | "COLD";
  summary: string;
}

interface CallRow {
  id: string;
  lead: string;
  duration: string;
  time: string;
  status: string;
  outcome: string;
  score: BANTScore | null;
  scoring: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

function formatDuration(s?: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function formatTime(unix?: number) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function mapStatus(s: string) {
  if (s === "done") return "COMPLETED";
  if (s === "processing") return "PROCESSING";
  if (s === "in_progress" || s === "calling") return "CALLING";
  if (s === "failed" || s === "error") return "FAILED";
  return s.toUpperCase();
}

const STATUS_META: Record<string, { icon: typeof PhoneCall; color: string; bg: string; label: string }> = {
  COMPLETED:  { icon: PhoneCall,   color: "#1F8A70", bg: "rgba(31,138,112,0.08)",  label: "Completed"  },
  CALLING:    { icon: Mic,         color: "#D4AF37", bg: "rgba(212,175,55,0.08)",  label: "Live"       },
  PROCESSING: { icon: RefreshCw,   color: "#3B82F6", bg: "rgba(59,130,246,0.08)",  label: "Processing" },
  FAILED:     { icon: PhoneMissed, color: "#DC2626", bg: "rgba(239,68,68,0.08)",   label: "Failed"     },
};
const OUTCOME_COLOR: Record<string, string> = { HOT: "#1F8A70", WARM: "#D4AF37", COLD: "#94A3B8" };
const SCORE_COLOR = (n: number) =>
  n >= 7 ? "#1F8A70" : n >= 4 ? "#D4AF37" : "#94A3B8";

// ── Groq scorer ───────────────────────────────────────────────────────────────
async function scoreWithGroq(transcript: { role: string; message: string }[]): Promise<BANTScore | null> {
  if (!transcript.length) return null;

  // Trim transcript to last 40 turns to keep tokens manageable while capturing full context
  const turns = transcript.slice(-40);
  const convo = turns.map(t => `${t.role === "agent" ? "Agent" : "Lead"}: ${t.message}`).join("\n");

  const systemPrompt = `You are an expert sales intelligence analyst specializing in BANT lead qualification. Your job is to analyze any conversation transcript — whether it's a sales call, insurance claim, service inquiry, or support call — and score the LEAD (customer/caller) across four BANT dimensions.

BANT scoring is always relative to whether this lead has potential value. Interpret dimensions broadly:
- BUDGET (1-10): Does the lead have financial capacity or involvement? Evidence of spending, payments, accounts, or existing financial commitment = higher score. Brand new, uncommitted, or free inquiries = lower score.
- AUTHORITY (1-10): Is this person empowered to make decisions or take action? They speak confidently, are the account holder, make choices without needing approval = higher score. They need to "ask someone else" or are just gathering info = lower score.
- NEED (1-10): How urgent and real is their need? They have a clear, immediate problem or requirement = higher score. Vague curiosity with no real pain point = lower score.
- TIMELINE (1-10): How time-sensitive is this? They need action NOW, mention deadlines, or are in an active situation = higher score. No urgency, open-ended, or hypothetical = lower score.

IMPORTANT RULES:
- Scores MUST be between 3 and 10. Never give a 1 or 2 unless the transcript has literally zero relevant information.
- If the call is incomplete or short, give moderate scores (4-6) based on partial evidence — do NOT default to minimums.
- A customer filing an insurance claim after an accident is a STRONG lead: high NEED (they need help NOW), high AUTHORITY (it's their accident/claim), moderate-high TIMELINE (accident just happened), moderate BUDGET (they're an existing paying customer).
- Base your scores on actual evidence in the transcript, not assumptions.
- Reply ONLY with raw JSON — no markdown, no explanation, no code fences.`;

  const userPrompt = `Analyze this conversation and return a BANT score JSON object:
{"budget":N,"authority":N,"need":N,"timeline":N,"summary":"<12 words max describing the lead>"}

CONVERSATION:
${convo}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.15,
        max_tokens: 120,
      }),
    });
    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? "").trim();
    // Extract JSON robustly even if model wraps it in backticks or extra text
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON in response");
    const jsonStr = raw.slice(start, end + 1);
    const { budget, authority, need, timeline, summary } = JSON.parse(jsonStr);

    // Clamp scores between 3 and 10 — minimum of 3 for any completed conversation
    const b = Math.max(3, Math.min(10, Math.round(Number(budget)) || 3));
    const a = Math.max(3, Math.min(10, Math.round(Number(authority)) || 3));
    const n = Math.max(3, Math.min(10, Math.round(Number(need)) || 3));
    const t = Math.max(3, Math.min(10, Math.round(Number(timeline)) || 3));

    const total = parseFloat(((b + a + n + t) / 4).toFixed(1));
    const label: BANTScore["label"] = total >= 7 ? "HOT" : total >= 4.5 ? "WARM" : "COLD";
    return { total, budget: b, authority: a, need: n, timeline: t, label, summary: summary ?? "" };
  } catch (err) {
    console.error("[BANT Scoring Error]", err);
    return null;
  }
}

// ── Score Ring (SVG arc) ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 44 }: { score: number | null; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const color = score != null ? SCORE_COLOR(score) : "#e4e4e7";
  const pct = score != null ? score / 10 : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={5} />
        {/* Arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {score == null
          ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#cbd5e1" }} />
          : <span className="text-[11px] font-black tabular-nums" style={{ color }}>{score.toFixed(1)}</span>
        }
      </div>
    </div>
  );
}

// ── BANT Bar ──────────────────────────────────────────────────────────────────
function BANTBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="text-[10px] font-black tabular-nums" style={{ color }}>{value}/10</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ── Mini wave (live call) ─────────────────────────────────────────────────────
function MiniWave({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[40, 80, 55, 100, 65, 75, 45].map((h, i) => (
        <motion.div key={i}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
          className="w-[2px] rounded-full"
          style={{ height: `${h}%`, backgroundColor: color, transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

// ── Expanded panel (summary + transcript + audio + BANT) ─────────────────────
function ExpandedPanel({ callId, bant, leadName }: { callId: string; bant: BANTScore | null; leadName: string }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; message: string }[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [txOpen, setTxOpen] = useState(true);
  
  // Telegram State
  const [telegramSending, setTelegramSending] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  const urlRef = useRef<string | null>(null);

  const handleSendTelegram = async () => {
    if (!bant) return;
    setTelegramSending(true);
    try {
      const text = `🔔 New Follow-Up Required\n\nComplaint ID: ${callId}\nLead: ${leadName}\nStatus: ${bant.label} (Score: ${bant.total})\n\nSummary:\n${bant.summary || summary || "No summary available"}\n\nPlease review this lead in the dashboard.`;
      const res = await fetch("https://api.telegram.org/bot8675669112:AAF0r0ESeMx7mziP2PUqos-HiY2CMIfXWZc/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "5916482731",
          text
        })
      });
      if (res.ok) {
        setTelegramSent(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Telegram API Error:", errorData);
        alert(`Telegram Error: ${errorData.description || 'Bad Request'}`);
      }
    } catch {
      alert("Error reaching Telegram API");
    } finally {
      setTelegramSending(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadConversation = async () => {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${callId}`, {
          headers: { "xi-api-key": ELEVENLABS_API_KEY },
        });
        const d = await res.json();
        if (!active) return;
        if (d.transcript) setTranscript(d.transcript);
        // ElevenLabs returns summary under analysis.transcript_summary or conversation_summary
        const s =
          d.analysis?.transcript_summary ??
          d.analysis?.summary ??
          d.conversation_summary ??
          d.metadata?.summary ??
          null;
        setSummary(s);
      } catch { /* silent */ } finally {
        if (active) setLoading(false);
      }
    };

    const loadAudio = async () => {
      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${callId}/audio`,
          { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
        );
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        if (active) setAudioUrl(url);
      } catch {
        if (active) setAudioError(true);
      } finally {
        if (active) setAudioLoading(false);
      }
    };

    loadConversation();
    loadAudio();

    return () => {
      active = false;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [callId]);

  const bantColor = bant ? SCORE_COLOR(bant.total) : "#94a3b8";

  return (
    <div className="border-b border-zinc-100 px-6 py-5 space-y-4" style={{ background: "rgba(248,250,252,0.8)" }}>

      {/* ── Summary card ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Call Summary
        </h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400 py-1">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Loading summary…
          </div>
        ) : summary ? (
          <p className="text-sm leading-relaxed font-medium" style={{ color: "#374151" }}>{summary}</p>
        ) : (
          <p className="text-sm italic text-zinc-400">No summary available for this call.</p>
        )}
      </div>

      {/* ── Audio player ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-4 py-3 flex items-center gap-3">
        <PlayCircle className="w-4 h-4 shrink-0" style={{ color: "#1F8A70" }} />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-20 shrink-0">Recording</span>
        {audioLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Loading…
          </div>
        ) : audioError || !audioUrl ? (
          <p className="text-sm text-zinc-400 italic">No recording available.</p>
        ) : (
          <audio controls className="flex-1 h-8" src={audioUrl} />
        )}
      </div>

      {/* ── Transcript + BANT row ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Transcript */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setTxOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Transcript
              {transcript.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                  style={{ background: "rgba(31,138,112,0.1)", color: "#1F8A70" }}>
                  {transcript.length} turns
                </span>
              )}
            </h3>
            <motion.div animate={{ rotate: txOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {txOpen && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 max-h-72 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-16">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
                    </div>
                  ) : transcript.length === 0 ? (
                    <p className="text-sm text-zinc-400 italic py-2">No transcript available.</p>
                  ) : (
                    <div className="space-y-3">
                      {transcript.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role !== "agent" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                            msg.role !== "agent"
                              ? "bg-emerald-600 text-white rounded-tr-sm"
                              : "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                          }`}>
                            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                              msg.role !== "agent" ? "text-emerald-200" : "text-zinc-400"
                            }`}>{msg.role === "agent" ? "AI Agent" : "Lead"}</div>
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BANT Score Panel */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 w-full lg:w-64 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> BANT Score
            </h3>
            {bant && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${bantColor}12`, color: bantColor, border: `1px solid ${bantColor}25` }}>
                {bant.label}
              </span>
            )}
          </div>
          {!bant ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Scoring…
            </div>
          ) : (
            <>
              {bant.summary && (
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-3 pb-3 border-b border-zinc-100 italic">
                  "{bant.summary}"
                </p>
              )}
              <div className="space-y-2.5">
                <BANTBar label="Budget"    value={bant.budget}    color={SCORE_COLOR(bant.budget)} />
                <BANTBar label="Authority" value={bant.authority} color={SCORE_COLOR(bant.authority)} />
                <BANTBar label="Need"      value={bant.need}      color={SCORE_COLOR(bant.need)} />
                <BANTBar label="Timeline"  value={bant.timeline}  color={SCORE_COLOR(bant.timeline)} />
              </div>

              {(bant.label === "HOT" || bant.label === "WARM") && (
                <div className="mt-5 pt-4 border-t border-zinc-100">
                  <button
                    onClick={handleSendTelegram}
                    disabled={telegramSending || telegramSent}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                    style={{ 
                      backgroundColor: telegramSent ? "rgba(31,138,112,0.1)" : "rgba(15,61,62,0.9)", 
                      color: telegramSent ? "#1F8A70" : "white",
                      border: telegramSent ? "1px solid rgba(31,138,112,0.2)" : "1px solid transparent"
                    }}
                  >
                    {telegramSending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    ) : telegramSent ? (
                      <><Sparkles className="w-3.5 h-3.5" /> Sent to Telegram</>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> Send Complaint Summary</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Calls() {
  const [calls, setCalls] = useState<CallRow[]>(MOCK_CALLS);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [liveCalls, setLiveCalls] = useState<{ id: string; lead: string; startTime: string }[]>([]);

  // Score cache so we don't re-score when collapsing/expanding
  const scoreCache = useRef<Record<string, BANTScore>>({});
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/convai/conversations?limit=25", {
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      });
      const data = await res.json();
      if (data.conversations) {
        const rows: CallRow[] = data.conversations.map((c: any) => ({
          id: c.conversation_id,
          lead: c.call_summary_title || "Unknown Call",
          duration: formatDuration(c.call_duration_secs),
          time: formatTime(c.start_time_unix_secs),
          status: mapStatus(c.status),
          outcome: c.call_successful === "success" ? "HOT" : c.call_successful === "failure" ? "COLD" : "WARM",
          score: scoreCache.current[c.conversation_id] ?? null,
          scoring: false,
        }));
        // Real data on top, mock data below (mock IDs start with "mock-" so no collision)
        setCalls([...rows, ...MOCK_CALLS]);

        // ── Fast parallel scoring ─────────────────────────────────────────────
        // 1. Fetch all transcripts in parallel
        const unscored = rows.filter(r => r.status === "COMPLETED" && !scoreCache.current[r.id]);
        const transcriptResults = await Promise.allSettled(
          unscored.map(r =>
            fetch(`https://api.elevenlabs.io/v1/convai/conversations/${r.id}`, {
              headers: { "xi-api-key": ELEVENLABS_API_KEY },
            }).then(res => res.json()).then(d => ({ id: r.id, transcript: d.transcript ?? [] }))
          )
        );

        // 2. Score with Groq — 200ms stagger to stay inside rate limit
        const toScore = transcriptResults
          .filter((r): r is PromiseFulfilledResult<{ id: string; transcript: any[] }> => r.status === "fulfilled")
          .map(r => r.value);

        setCalls(prev => prev.map(c =>
          toScore.find(t => t.id === c.id) ? { ...c, scoring: true } : c
        ));

        toScore.forEach(({ id, transcript }, i) => {
          setTimeout(async () => {
            if (scoreCache.current[id]) {
              const bant = scoreCache.current[id];
              setCalls(prev => prev.map(c => c.id === id ? { ...c, score: bant, scoring: false, outcome: bant.label } : c));
              return;
            }
            const bant = await scoreWithGroq(transcript);
            if (bant) {
              scoreCache.current[id] = bant;
              setCalls(prev => prev.map(c => c.id === id ? { ...c, score: bant, scoring: false, outcome: bant.label } : c));
            } else {
              setCalls(prev => prev.map(c => c.id === id ? { ...c, scoring: false } : c));
            }
          }, i * 220); // 220ms between Groq calls — fast but within rate limit
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  // ── Live call polling — check every 8s for in_progress conversations ──────
  useEffect(() => {
    const pollLive = async () => {
      try {
        const res = await fetch(
          "https://api.elevenlabs.io/v1/convai/conversations?limit=50",
          { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
        );
        const data = await res.json();
        if (data.conversations) {
          const active = data.conversations
            .filter((c: any) => c.status === "in_progress")
            .map((c: any) => ({
              id: c.conversation_id,
              lead: c.call_summary_title || "Active Call",
              startTime: formatTime(c.start_time_unix_secs),
            }));
          setLiveCalls(active);
        }
      } catch { /* silent — don't interrupt UI */ }
    };

    pollLive(); // immediate first check
    liveTimerRef.current = setInterval(pollLive, 8000); // then every 8s
    return () => { if (liveTimerRef.current) clearInterval(liveTimerRef.current); };
  }, []);

  const completed = calls.filter(c => c.status === "COMPLETED").length;
  const hot       = calls.filter(c => c.score?.label === "HOT").length;
  const avgScore  = calls.filter(c => c.score).length
    ? (calls.filter(c => c.score).reduce((s, c) => s + (c.score!.total), 0) / calls.filter(c => c.score).length).toFixed(1)
    : "—";

  const stats = [
    { label: "Total Calls",  value: String(calls.length), color: "#0F3D3E", icon: PhoneCall },
    { label: "Connected",    value: String(completed),    color: "#1F8A70", icon: PhoneCall },
    { label: "Live Now",     value: String(liveCalls.length || 0), color: "#D4AF37", icon: Mic },
    { label: "Avg BANT",     value: avgScore,             color: "#0F3D3E", icon: PhoneOff  },
  ];

  const handleRowClick = (callId: string, isExpanded: boolean) => {
    setExpanded(isExpanded ? null : callId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">ElevenLabs + Groq AI</div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.18)" }}>
                Live Data
              </span>
            </div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Conversations
            </h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>
              Each call is automatically BANT-scored by Groq LLaMA 3 after completion.
            </p>
          </div>
          <motion.button
            onClick={() => { setExpanded(null); fetchCalls(); }} disabled={loading}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94a3b8", backgroundColor: "rgba(212,175,55,0.04)" }}>
            <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.7, repeat: loading ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }}
              className="premium-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-black tabular-nums" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
                  {s.value}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Calls Banner — only shown when a call is in progress */}
        <AnimatePresence>
          {liveCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1.5px solid rgba(212,175,55,0.35)", background: "linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))" }}
            >
              {/* Banner Header */}
              <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#A67C2E" }}>
                  {liveCalls.length} Call{liveCalls.length > 1 ? "s" : ""} In Progress
                </span>
                <span className="text-[9px] font-medium ml-1" style={{ color: "#94a3b8" }}>· Polling every 8s</span>
                <div className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  Live
                </div>
              </div>

              {/* Live call rows */}
              {liveCalls.map((lc, i) => (
                <motion.div key={lc.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: i < liveCalls.length - 1 ? "1px solid rgba(212,175,55,0.08)" : "none" }}
                >
                  {/* Animated mic icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <MiniWave color="#D4AF37" />
                  </div>

                  {/* Call info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
                      {lc.lead}
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>
                      {lc.id.slice(0, 22)}… · Started {lc.startTime}
                    </div>
                  </div>

                  {/* Elapsed indicator */}
                  <div className="flex items-center gap-1.5 text-[10px] font-black" style={{ color: "#D4AF37" }}>
                    <Clock className="w-3 h-3" />
                    <span>Ongoing</span>
                  </div>

                  {/* Live badge */}
                  <span className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"
                    style={{ background: "rgba(212,175,55,0.1)", color: "#A67C2E", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                    Live
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calls table */}
        <motion.div {...fadeUp(0.14)} className="premium-card overflow-hidden">
          {/* Header row */}
          <div className="px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.08)", color: "#94a3b8", background: "rgba(212,175,55,0.02)" }}>
            <div className="flex-1">Summary / Lead</div>
            <div className="w-28 hidden md:block">Time</div>
            <div className="w-20 hidden lg:block">Duration</div>
            <div className="w-24">Status</div>
            <div className="w-16 text-center">Score</div>
            <div className="w-16">Outcome</div>
          </div>

          {loading && calls.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading conversations…
            </div>
          )}

          {calls.map((call, i) => {
            const sm = STATUS_META[call.status] ?? STATUS_META.COMPLETED;
            const StatusIcon = sm.icon;
            const isLive = call.status === "CALLING";
            const isExpanded = expanded === call.id;
            const outcomeColor = OUTCOME_COLOR[call.outcome] ?? "#94a3b8";
            const isMock = call.id.startsWith("mock-");
            const isFirstMock = isMock && (i === 0 || !calls[i - 1].id.startsWith("mock-"));

            return (
              <div key={call.id}>
                {/* Divider between real and mock data */}
                {isFirstMock && (
                  <div className="flex items-center gap-3 px-6 py-2" style={{ background: "rgba(212,175,55,0.03)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                    <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: "#A67C2E", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
                      Sample Data — New calls appear above
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleRowClick(call.id, isExpanded)}
                  className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-all group ${
                    isExpanded ? "bg-emerald-50/50" : "hover:bg-zinc-50/80"
                  }`}
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                >
                  {/* Lead */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isLive ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: sm.bg, border: `1px solid ${sm.color}25` }}>
                      {isLive ? <MiniWave color={sm.color} /> : <StatusIcon className="w-4 h-4" style={{ color: sm.color }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>
                        {call.lead}
                      </div>
                      <div className="text-[10px] font-medium truncate" style={{ color: "#94a3b8" }}>
                        {call.id.slice(0, 18)}…
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="w-28 text-sm hidden md:flex items-center gap-1.5 font-medium" style={{ color: "#71717a" }}>
                    <Clock className="w-3 h-3 shrink-0" /> {call.time}
                  </div>

                  {/* Duration */}
                  <div className="w-20 text-sm font-mono font-bold hidden lg:block" style={{ color: "#09090b" }}>
                    {call.duration}
                  </div>

                  {/* Status */}
                  <div className="w-24">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                      style={{ backgroundColor: sm.bg, color: sm.color }}>
                      {isLive ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse" /> {sm.label}
                        </span>
                      ) : sm.label}
                    </span>
                  </div>

                  {/* Score ring */}
                  <div className="w-16 flex justify-center">
                    {call.scoring ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#D4AF37" }} />
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#D4AF37" }}>AI</span>
                      </div>
                    ) : (
                      <ScoreRing score={call.score?.total ?? null} size={40} />
                    )}
                  </div>

                  {/* Outcome */}
                  <div className="w-16">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${outcomeColor}12`, color: outcomeColor, border: `1px solid ${outcomeColor}25` }}>
                      {call.outcome}
                    </span>
                  </div>
                </motion.div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ExpandedPanel callId={call.id} bant={call.score} leadName={call.lead} />
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
