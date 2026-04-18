import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Zap, PhoneCall, BarChart3, Brain,
  Globe, ChevronDown, ChevronRight, MessageCircle,
  CheckCircle2, AlertCircle, Info, Sparkles, ArrowRight,
  Mic, Target, Users, Activity,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

type DocArticle = {
  id: string;
  title: string;
  time: string;
  answer: string;
  points: string[];
};

const CATEGORIES: {
  id: string;
  label: string;
  icon: typeof Zap;
  color: string;
  articles: DocArticle[];
}[] = [
  {
    id: "getting-started", label: "Getting Started", icon: Zap, color: "#1F8A70",
    articles: [
      {
        id: "what-is-voicequal",
        title: "What is VoiceQual?",
        time: "2 min",
        answer:
          "VoiceQual is an AI qualification workspace that calls leads automatically, scores them using BANT logic, and routes the best opportunities into your CRM.",
        points: [
          "It handles first-response outreach without waiting for an SDR.",
          "Every completed call can produce a transcript, summary, and qualification score.",
        ],
      },
      {
        id: "setup-first-campaign",
        title: "Setting up your first AI call campaign",
        time: "5 min",
        answer:
          "Start by connecting your calling provider, choosing a lead source, and defining the qualification prompt the AI should follow during the conversation.",
        points: [
          "Set call windows and retry rules before launching.",
          "Run a short internal test list first so your team can confirm voice quality and scoring behavior.",
        ],
      },
      {
        id: "importing-leads",
        title: "Importing leads and triggering calls",
        time: "3 min",
        answer:
          "Leads can be uploaded by CSV or pulled from connected systems, then VoiceQual queues them and starts outreach based on your campaign rules.",
        points: [
          "Check name, phone number, and source fields before import.",
          "Calls begin only after the campaign is active and the lead passes eligibility checks.",
        ],
      },
      {
        id: "understanding-dashboard",
        title: "Understanding your Dashboard",
        time: "4 min",
        answer:
          "The dashboard shows what the AI is doing now, which leads need attention, and how the current qualification funnel is performing.",
        points: [
          "Use Leads to inspect individual prospects and Calls to review active or completed conversations.",
          "Use Pipeline and Analytics to spot the hottest opportunities and drop-off points.",
        ],
      },
    ],
  },
  {
    id: "calls", label: "Calls & Recordings", icon: PhoneCall, color: "#D4AF37",
    articles: [
      {
        id: "recordings-storage",
        title: "How call recordings are stored",
        time: "2 min",
        answer:
          "Recordings are linked to the originating lead and call session so your team can trace every score or summary back to the original conversation.",
        points: [
          "Storage retention depends on your compliance configuration.",
          "If recording is disabled for a workflow, transcript-only review remains available when supported.",
        ],
      },
      {
        id: "transcripts-download",
        title: "Viewing and downloading transcripts",
        time: "3 min",
        answer:
          "Open a completed call from the Calls page or lead detail page to view the transcript, then export or copy it for sales follow-up and audit needs.",
        points: [
          "Transcript availability depends on the call reaching a completed or processed state.",
          "Summaries are usually shown alongside the transcript for faster review.",
        ],
      },
      {
        id: "call-statuses",
        title: "Call status explained (COMPLETED, FAILED, PENDING)",
        time: "3 min",
        answer:
          "Call status indicates whether the conversation finished, failed to connect, or is still waiting on the provider or processing pipeline.",
        points: [
          "COMPLETED means the audio and result data are available.",
          "PENDING usually resolves after the provider finishes processing the session.",
        ],
      },
      {
        id: "replay-call",
        title: "Replaying a call and scrubbing the audio",
        time: "2 min",
        answer:
          "Use the call detail view to replay the recording and scrub through important moments while comparing the transcript, timing, and score.",
        points: [
          "Jump to objection or pricing moments by scanning the transcript first.",
          "Use replay during QA when you want to verify why a lead was marked HOT or WARM.",
        ],
      },
    ],
  },
  {
    id: "bant", label: "BANT Scoring", icon: Target, color: "#A67C2E",
    articles: [
      {
        id: "what-is-bant",
        title: "What is BANT scoring?",
        time: "3 min",
        answer:
          "BANT scoring helps VoiceQual estimate whether a lead is worth fast follow-up by measuring Budget, Authority, Need, and Timeline from the conversation.",
        points: [
          "Each pillar contributes to the final qualification score.",
          "The score is used to classify leads as HOT, WARM, or COLD depending on your settings.",
        ],
      },
      {
        id: "how-bant-is-scored",
        title: "How Budget, Authority, Need & Timeline are scored",
        time: "5 min",
        answer:
          "The AI reviews the transcript for signals that confirm buying power, decision ownership, urgency, and active demand, then combines those findings into a total score.",
        points: [
          "Strong direct answers usually increase confidence and score quality.",
          "Weak or missing evidence lowers the relevant sub-score even if the conversation sounds positive overall.",
        ],
      },
      {
        id: "hot-threshold",
        title: "Adjusting the HOT lead threshold",
        time: "2 min",
        answer:
          "Your HOT threshold controls how strict VoiceQual should be before routing a lead as immediately actionable.",
        points: [
          "Raise it if sales wants fewer but stronger handoffs.",
          "Lower it if you want the team to review more borderline opportunities.",
        ],
      },
      {
        id: "score-visuals",
        title: "Score ring and bar chart explained",
        time: "2 min",
        answer:
          "The ring gives a fast view of the overall qualification score, while the bars show how each BANT factor contributed to that result.",
        points: [
          "A balanced score usually means the lead answered clearly across multiple criteria.",
          "A high total with one weak bar often indicates a follow-up risk your team should confirm manually.",
        ],
      },
    ],
  },
  {
    id: "ai-engine", label: "Sarvam AI Engine", icon: Brain, color: "#0F3D3E",
    articles: [
      {
        id: "voice-engine",
        title: "How the voice AI engine works",
        time: "4 min",
        answer:
          "The voice engine receives lead context, follows your configured qualification flow, speaks to the prospect, and turns the conversation into structured data for scoring.",
        points: [
          "It combines speech generation, call control, and transcript handling in one workflow.",
          "Prompt design and fallback logic affect how natural and consistent the calls feel.",
        ],
      },
      {
        id: "mic-troubleshooting",
        title: "Mic not working — troubleshooting guide",
        time: "5 min",
        answer:
          "If the mic is not working in interactive voice features, confirm browser permission, supported browser choice, and that no other app is locking the device.",
        points: [
          "Chrome usually offers the most reliable microphone behavior.",
          "Refreshing the page after granting permission often restores the session cleanly.",
        ],
      },
      {
        id: "change-language",
        title: "Changing the AI language (Hindi, Tamil, Telugu)",
        time: "3 min",
        answer:
          "Multi-language voice output can be enabled from settings so the AI speaks in the language selected for your campaign or testing flow.",
        points: [
          "Voice output language can change even if scoring logic remains standardized behind the scenes.",
          "Test pronunciation and pacing before using a new language in production.",
        ],
      },
      {
        id: "tts-responses",
        title: "Understanding agent responses and TTS",
        time: "3 min",
        answer:
          "Text-to-speech converts the AI’s generated response into the live spoken message the lead hears during the call.",
        points: [
          "Response tone depends on your prompt style and selected voice settings.",
          "If audio sounds unnatural, review both the script phrasing and the chosen voice model.",
        ],
      },
    ],
  },
  {
    id: "analytics", label: "Analytics", icon: BarChart3, color: "#1F8A70",
    articles: [
      {
        id: "weekly-chart",
        title: "Reading the weekly call performance chart",
        time: "3 min",
        answer:
          "The weekly chart helps you compare call volume, connection trends, and qualification outcomes over time so you can spot performance changes quickly.",
        points: [
          "Look for sudden dips in completions or spikes in failed calls.",
          "Compare call activity with HOT lead output, not volume alone.",
        ],
      },
      {
        id: "kpi-cards",
        title: "KPI cards — what each metric means",
        time: "4 min",
        answer:
          "The KPI cards summarize the most important top-line numbers such as total calls, qualified leads, sync success, and response speed.",
        points: [
          "Use them for a quick health check before drilling into details.",
          "When one card shifts suddenly, use the tables and pipeline view to find the cause.",
        ],
      },
      {
        id: "daily-breakdown",
        title: "Daily breakdown table explained",
        time: "2 min",
        answer:
          "The daily breakdown table gives row-level performance by day so you can track throughput, failures, and conversions without relying on charts alone.",
        points: [
          "This view is useful for comparing operational changes week to week.",
          "Use it when you want exact counts behind a trend line.",
        ],
      },
    ],
  },
  {
    id: "integrations", label: "Integrations", icon: Globe, color: "#D4AF37",
    articles: [
      {
        id: "connect-elevenlabs",
        title: "Connecting ElevenLabs API",
        time: "3 min",
        answer:
          "Add your ElevenLabs credentials in the integrations area so VoiceQual can initiate calls and read back call-session results from the provider.",
        points: [
          "Use a valid key with the required voice or conversation permissions.",
          "After saving, run a test call before enabling live campaigns.",
        ],
      },
      {
        id: "connect-groq",
        title: "Setting up Groq for BANT scoring",
        time: "4 min",
        answer:
          "Groq powers the transcript analysis layer that turns call text into structured BANT scores and qualification outputs.",
        points: [
          "Store the API key in your integration settings before enabling live scoring.",
          "If scoring is missing, check provider key validity and transcript availability first.",
        ],
      },
      {
        id: "crm-sync",
        title: "CRM sync — Salesforce & HubSpot",
        time: "5 min",
        answer:
          "CRM sync sends qualified leads and their context into connected systems so the sales team can act without manual copy-paste.",
        points: [
          "Confirm field mapping before going live with auto-sync.",
          "It is best to test with a staging record so ownership and status rules are correct.",
        ],
      },
      {
        id: "webhook-hot-leads",
        title: "Webhook configuration for HOT lead events",
        time: "5 min",
        answer:
          "Webhooks let VoiceQual notify other tools whenever a lead crosses your HOT threshold or completes a routing event.",
        points: [
          "Use webhook payloads to trigger Slack alerts, CRM workflows, or internal automations.",
          "Always verify endpoint security and expected response format before enabling production traffic.",
        ],
      },
    ],
  },
];

const FAQS = [
  {
    q: "Why is my mic not capturing audio after the first message?",
    a: "This is a Web Speech API lifecycle issue. The recognition auto-restarts after each AI response. If it stops, ensure your browser has microphone permission and you're on Chrome or Edge (Safari has limited support). Try refreshing the page and re-starting the call.",
  },
  {
    q: "Why do I see a 'public.leads table not found' error?",
    a: "VoiceQual sources lead data directly from ElevenLabs conversations — not a local Supabase 'leads' table. If you see this error, ensure you're on the latest version of the app. The dashboard now reads directly from ElevenLabs API.",
  },
  {
    q: "How is the BANT score calculated?",
    a: "Each call transcript is sent to Groq's LLaMA 3 model with a structured prompt. It scores Budget (0–2.5), Authority (0–2.5), Need (0–2.5), and Timeline (0–2.5) for a maximum total of 10. HOT leads score ≥ your configured threshold (default: 7).",
  },
  {
    q: "Why does my call show PENDING status?",
    a: "PENDING means the call was queued but ElevenLabs hasn't returned a completed status yet. This is normal for calls initiated in the last few minutes. Refresh the Calls page after ~30 seconds.",
  },
  {
    q: "Can I use VoiceQual in Hindi or regional languages?",
    a: "Yes! Enable Multi-Language Mode in Settings → AI & Scoring. The Sarvam AI TTS engine supports Hindi, Tamil, and Telugu. BANT scoring still uses English internally but the voice responses will be in the selected language.",
  },
  {
    q: "How do I export call data to my CRM?",
    a: "Go to Settings → Integrations and connect Salesforce or HubSpot. Once connected, enable 'CRM Auto-Sync' in Settings → Automation — qualified leads will be pushed automatically after every call.",
  },
];

const QUICK_STARTS = [
  { step: 1, icon: Users,     title: "Import Leads",     desc: "Upload your lead list via CSV or connect your CRM"       },
  { step: 2, icon: Zap,       title: "Trigger Campaign",  desc: "Click 'Start Campaign' — the AI calls each lead"        },
  { step: 3, icon: Mic,       title: "AI Qualifies",      desc: "Sarvam AI Engine conducts a BANT qualification call"    },
  { step: 4, icon: Target,    title: "Score & Route",     desc: "Groq scores the transcript and flags HOT leads"         },
  { step: 5, icon: Activity,  title: "Review & Act",      desc: "Review scored leads in Pipeline or push to CRM"         },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left transition-colors hover:bg-zinc-50/50 px-1 rounded-lg">
        <span className="text-sm font-bold pr-4" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <p className="text-sm pb-4 px-1 leading-relaxed" style={{ color: "#52525b" }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArticleItem({
  article,
  color,
  open,
  onToggle,
}: {
  article: DocArticle;
  color: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="group w-full py-2.5 text-left transition-colors hover:bg-zinc-50/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: color, opacity: 0.4 }}
            />
            <span
              className="text-xs font-medium transition-all group-hover:font-bold"
              style={{ color: "#09090b" }}
            >
              {article.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>
              {article.time}
            </span>
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.18 }}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-3 h-3" style={{ color }} />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mb-3 ml-3 mr-1 rounded-2xl px-4 py-3"
              style={{
                background: `${color}0A`,
                border: `1px solid ${color}1A`,
              }}
            >
              <p className="text-xs leading-relaxed font-medium" style={{ color: "#52525b" }}>
                {article.answer}
              </p>
              <div className="mt-3 space-y-2">
                {article.points.map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <div
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <div className="text-[11px] leading-relaxed" style={{ color: "#71717a" }}>
                      {point}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpDocs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    articles: cat.articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase())),
  })).filter(cat => !search || cat.articles.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-2 mb-1">
            <div className="crown-badge">Documentation</div>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit',sans-serif" }}>Help & Docs</h1>
          <p className="text-xs mt-1 font-medium" style={{ color: "#71717a" }}>Everything you need to get the most out of VoiceQual AI.</p>
        </motion.div>

        {/* Search */}
        <motion.div {...fadeUp(0.05)} className="premium-card px-4 py-3 flex items-center gap-3">
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#94a3b8" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documentation…"
            className="flex-1 text-sm outline-none bg-transparent font-medium"
            style={{ color: "#09090b" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs font-bold" style={{ color: "#94a3b8" }}>Clear</button>
          )}
        </motion.div>

        {/* Quick Start */}
        {!search && (
          <motion.div {...fadeUp(0.08)} className="premium-card p-5 overflow-hidden relative">
            {/* Background Accent */}
            <div className="!absolute !top-0 !right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" style={{ position: 'absolute', zIndex: 0 }} />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner" 
                  style={{ background: "linear-gradient(135deg, #1F8A70, #0F3D3E)" }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-tight" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>Get Started in Seconds</div>
                  <div className="text-[9px] font-medium" style={{ color: "#94a3b8" }}>The VoiceQual workflow — 5 simple steps</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
                style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.15)" }}>
                <CheckCircle2 className="w-2 h-2" /> Fast Setup
              </div>
            </div>

            <div className="relative flex justify-between items-start gap-1 pb-2">
              {/* Desktop Connection Line */}
              <div className="absolute top-6 left-8 right-8 h-[1px] hidden md:block" 
                style={{ 
                  background: "linear-gradient(90deg, transparent, rgba(31,138,112,0.15) 15%, rgba(31,138,112,0.15) 85%, transparent)",
                  zIndex: 0 
                }} />
              
              {QUICK_STARTS.map((s, i) => (
                <div key={s.step} className="relative z-10 flex flex-col items-center flex-1">
                  {/* Icon & Step Circle */}
                  <div className="relative mb-3">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-sm"
                      style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                      <s.icon className="w-5 h-5" style={{ color: "#1F8A70" }} />
                    </motion.div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md"
                      style={{ background: "linear-gradient(135deg, #1F8A70, #0F3D3E)", border: "1.5px solid #fff" }}>
                      {s.step}
                    </div>
                  </div>

                  {/* Step Info */}
                  <div className="text-center px-1">
                    <div className="text-[10px] font-black uppercase tracking-wider mb-1" 
                      style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>
                      {s.title}
                    </div>
                    <div className="text-[9px] font-medium leading-tight text-zinc-400 line-clamp-2">
                      {s.desc}
                    </div>
                  </div>

                  {/* Tablet/Mobile Arrow */}
                  {i < QUICK_STARTS.length - 1 && (
                    <div className="md:hidden mt-2">
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Callout banners */}
        {!search && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Info,         color: "#1F8A70", bg: "rgba(31,138,112,0.06)",  title: "Tip",     text: "Use Chrome for best mic performance with the AI Engine." },
              { icon: AlertCircle,  color: "#D4AF37", bg: "rgba(212,175,55,0.06)",  title: "Note",    text: "API keys are stored client-side — never share your session." },
              { icon: CheckCircle2, color: "#0F3D3E", bg: "rgba(15,61,62,0.06)",    title: "Feature", text: "Multi-language TTS now supports Hindi & Tamil responses." },
            ].map((b, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.04)}
                className="premium-card px-4 py-3 flex gap-2.5" style={{ background: b.bg }}>
                <b.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: b.color }} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: b.color }}>{b.title}</div>
                  <div className="text-xs leading-snug" style={{ color: "#52525b" }}>{b.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Categories grid */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((cat, ci) => (
            <motion.div key={cat.id} {...fadeUp(0.1 + ci * 0.04)} className="premium-card overflow-hidden">
              {/* Category header */}
              <button
                type="button"
                onClick={() => {
                  const closing = activeCategory === cat.id;
                  setActiveCategory(closing ? null : cat.id);
                  if (closing && activeArticle?.startsWith(`${cat.id}:`)) {
                    setActiveArticle(null);
                  }
                }}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/50 transition-colors"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}20` }}>
                  <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                </div>
                <span className="font-black text-xs uppercase tracking-wider flex-1 text-left"
                  style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{cat.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1"
                  style={{ background: `${cat.color}12`, color: cat.color }}>{cat.articles.length}</span>
                <motion.div animate={{ rotate: activeCategory === cat.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                </motion.div>
              </button>

              {/* Always show first 2, expand for rest */}
              <div className="px-5 py-2">
                {(activeCategory === cat.id ? cat.articles : cat.articles.slice(0, 2)).map((art, ai) => (
                  <motion.div key={art.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ai * 0.03 }}>
                    <ArticleItem
                      article={art}
                      color={cat.color}
                      open={activeArticle === `${cat.id}:${art.id}`}
                      onToggle={() =>
                        setActiveArticle((current) =>
                          current === `${cat.id}:${art.id}` ? null : `${cat.id}:${art.id}`
                        )
                      }
                    />
                  </motion.div>
                ))}
                {!activeCategory && cat.articles.length > 2 && (
                  <button type="button" onClick={() => setActiveCategory(cat.id)}
                    className="text-[10px] font-bold py-2 w-full text-left transition-colors"
                    style={{ color: cat.color }}>
                    +{cat.articles.length - 2} more articles
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div {...fadeUp(0.3)} className="premium-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4" style={{ color: "#1F8A70" }} />
            <span className="font-black text-xs uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>Frequently Asked Questions</span>
          </div>
          <p className="text-xs mb-4" style={{ color: "#71717a" }}>Common questions from VoiceQual users.</p>
          <div>
            {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div {...fadeUp(0.35)} className="premium-card px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,rgba(15,61,62,0.06),rgba(31,138,112,0.03))", border: "1px solid rgba(31,138,112,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-black text-sm" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>Still need help?</div>
              <div className="text-xs" style={{ color: "#71717a" }}>Reach out to the VoiceQual team at support@voicequal.ai</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)", fontFamily: "'Outfit',sans-serif" }}>
            Contact Support <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}