import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Zap, PhoneCall, BarChart3, Brain, Shield,
  Globe, ChevronDown, ChevronRight, ExternalLink, MessageCircle,
  Play, CheckCircle2, AlertCircle, Info, Sparkles, ArrowRight,
  Mic, Target, Users, Activity,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const CATEGORIES = [
  {
    id: "getting-started", label: "Getting Started", icon: Zap, color: "#1F8A70",
    articles: [
      { title: "What is VoiceQual?", time: "2 min" },
      { title: "Setting up your first AI call campaign", time: "5 min" },
      { title: "Importing leads and triggering calls", time: "3 min" },
      { title: "Understanding your Dashboard", time: "4 min" },
    ],
  },
  {
    id: "calls", label: "Calls & Recordings", icon: PhoneCall, color: "#D4AF37",
    articles: [
      { title: "How call recordings are stored", time: "2 min" },
      { title: "Viewing and downloading transcripts", time: "3 min" },
      { title: "Call status explained (COMPLETED, FAILED, PENDING)", time: "3 min" },
      { title: "Replaying a call and scrubbing the audio", time: "2 min" },
    ],
  },
  {
    id: "bant", label: "BANT Scoring", icon: Target, color: "#A67C2E",
    articles: [
      { title: "What is BANT scoring?", time: "3 min" },
      { title: "How Budget, Authority, Need & Timeline are scored", time: "5 min" },
      { title: "Adjusting the HOT lead threshold", time: "2 min" },
      { title: "Score ring and bar chart explained", time: "2 min" },
    ],
  },
  {
    id: "ai-engine", label: "Sarvam AI Engine", icon: Brain, color: "#0F3D3E",
    articles: [
      { title: "How the voice AI engine works", time: "4 min" },
      { title: "Mic not working — troubleshooting guide", time: "5 min" },
      { title: "Changing the AI language (Hindi, Tamil, Telugu)", time: "3 min" },
      { title: "Understanding agent responses and TTS", time: "3 min" },
    ],
  },
  {
    id: "analytics", label: "Analytics", icon: BarChart3, color: "#1F8A70",
    articles: [
      { title: "Reading the weekly call performance chart", time: "3 min" },
      { title: "KPI cards — what each metric means", time: "4 min" },
      { title: "Daily breakdown table explained", time: "2 min" },
    ],
  },
  {
    id: "integrations", label: "Integrations", icon: Globe, color: "#D4AF37",
    articles: [
      { title: "Connecting ElevenLabs API", time: "3 min" },
      { title: "Setting up Groq for BANT scoring", time: "4 min" },
      { title: "CRM sync — Salesforce & HubSpot", time: "5 min" },
      { title: "Webhook configuration for HOT lead events", time: "5 min" },
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

export default function HelpDocs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
          <motion.div {...fadeUp(0.08)} className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(31,138,112,0.1)" }}>
                <Play className="w-3 h-3" style={{ color: "#1F8A70" }} />
              </div>
              <span className="font-black text-xs uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>Quick Start — 5 Steps</span>
            </div>
            <div className="flex items-start gap-0 overflow-x-auto pb-1">
              {QUICK_STARTS.map((s, i) => (
                <div key={s.step} className="flex items-start gap-0 flex-shrink-0">
                  <div className="flex flex-col items-center w-36">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: "linear-gradient(135deg,rgba(31,138,112,0.12),rgba(31,138,112,0.05))", border: "1px solid rgba(31,138,112,0.15)" }}>
                      <s.icon className="w-4 h-4" style={{ color: "#1F8A70" }} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider mb-0.5 text-center" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{s.title}</div>
                    <div className="text-[10px] text-center leading-tight" style={{ color: "#71717a" }}>{s.desc}</div>
                  </div>
                  {i < QUICK_STARTS.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 mt-2.5 mx-1 flex-shrink-0" style={{ color: "#94a3b8" }} />
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
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
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
                  <motion.button key={ai}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ai * 0.03 }}
                    className="w-full flex items-center justify-between py-2.5 text-left group border-b last:border-0"
                    style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: cat.color, opacity: 0.4 }} />
                      <span className="text-xs font-medium group-hover:font-bold transition-all" style={{ color: "#09090b" }}>{art.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className="text-[10px]" style={{ color: "#94a3b8" }}>{art.time}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cat.color }} />
                    </div>
                  </motion.button>
                ))}
                {!activeCategory && cat.articles.length > 2 && (
                  <button onClick={() => setActiveCategory(cat.id)}
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
