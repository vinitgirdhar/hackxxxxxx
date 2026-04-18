import { motion } from "framer-motion";
import {
  Bell, Shield, Zap, Globe, Sliders, Save, CheckCircle2,
  User, Key, Phone, Brain, ChevronRight, Sparkles,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

function Toggle({ value, onChange, color = "#1F8A70" }: { value: boolean; onChange: () => void; color?: string }) {
  return (
    <button onClick={onChange}
      className="relative flex items-center transition-all flex-shrink-0"
      style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: value ? color : "rgba(0,0,0,0.1)", padding: 2, border: `1px solid ${value ? color : "rgba(0,0,0,0.08)"}`, boxShadow: value ? `0 0 10px ${color}30` : "none" }}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

const TABS = [
  { id: "profile",      label: "Profile",       icon: User     },
  { id: "automation",   label: "Automation",    icon: Zap      },
  { id: "notifications",label: "Notifications", icon: Bell     },
  { id: "calling",      label: "Calling",       icon: Phone    },
  { id: "ai",           label: "AI & Scoring",  icon: Brain    },
  { id: "security",     label: "Security",      icon: Shield   },
  { id: "integrations", label: "Integrations",  icon: Globe    },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    autoCall: true, bantScoring: true, crmSync: true,
    notifications: true, doNotDisturb: false, emailDigest: true,
    callRecording: true, sentimentAnalysis: true, multiLanguage: false,
    autoTranscript: true, bantThreshold: 7,
    twoFactor: false, sessionTimeout: true,
    elevenLabsSync: true, groqScoring: true, webhooks: false,
  });

  const toggle = (k: keyof typeof settings) => setSettings(s => ({ ...s, [k]: !s[k] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ToggleRow = ({ label, desc, k, color = "#1F8A70" }: { label: string; desc: string; k: keyof typeof settings; color?: string }) => (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
      <div className="flex-1 pr-6">
        <div className="text-sm font-bold" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>{desc}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider w-6 text-right"
          style={{ color: settings[k] ? color : "#94a3b8" }}>
          {settings[k] ? "ON" : "OFF"}
        </span>
        <Toggle value={!!settings[k]} onChange={() => toggle(k)} color={color} />
      </div>
    </div>
  );

  const SectionCard = ({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) => (
    <motion.div {...fadeUp(0.08)} className="premium-card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: `${color}04` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="font-black text-xs uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{title}</span>
      </div>
      <div className="px-5">{children}</div>
    </motion.div>
  );

  const InputField = ({ label, defaultValue, type = "text", placeholder }: { label: string; defaultValue?: string; type?: string; placeholder?: string }) => (
    <div className="mb-4">
      <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color: "#94a3b8" }}>{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(212,175,55,0.15)", color: "#09090b" }}
        onFocus={e => e.target.style.borderColor = "rgba(31,138,112,0.4)"}
        onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.15)"}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return (
        <div className="space-y-4">
          <SectionCard title="Personal Info" icon={User} color="#1F8A70">
            <div className="py-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)", fontFamily: "'Outfit',sans-serif" }}>A</div>
                <div>
                  <div className="font-black text-sm" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>Admin User</div>
                  <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>admin@voicequal.ai</div>
                  <button className="text-[11px] font-bold mt-1 underline" style={{ color: "#1F8A70" }}>Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="First Name" defaultValue="Admin" />
                <InputField label="Last Name" defaultValue="User" />
              </div>
              <InputField label="Email" defaultValue="admin@voicequal.ai" type="email" />
              <InputField label="Phone" defaultValue="+91 98765 43210" />
              <InputField label="Company" defaultValue="VoiceQual Inc." />
            </div>
          </SectionCard>
          <SectionCard title="API Keys" icon={Key} color="#D4AF37">
            <div className="py-4 space-y-3">
              {[
                { label: "ElevenLabs API Key", val: "f86cd3c5...b94f103" },
                { label: "Groq API Key",       val: "gsk_••••••••••••••" },
                { label: "Sarvam AI Key",      val: "••••••••••••••••••" },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#94a3b8" }}>{label}</div>
                  <div className="flex gap-2">
                    <input readOnly defaultValue={val}
                      className="flex-1 px-3.5 py-2.5 rounded-xl text-sm font-mono outline-none"
                      style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(212,175,55,0.15)", color: "#09090b" }} />
                    <button className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      style={{ background: "rgba(31,138,112,0.08)", color: "#1F8A70", border: "1px solid rgba(31,138,112,0.15)" }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      );

      case "automation": return (
        <div className="space-y-4">
          <SectionCard title="Call Automation" icon={Zap} color="#1F8A70">
            <ToggleRow label="Auto-Call New Leads" desc="Initiate calls automatically when leads are imported." k="autoCall" />
            <ToggleRow label="Real-time BANT Scoring" desc="Score leads instantly during each live conversation." k="bantScoring" />
            <ToggleRow label="Auto Transcript Generation" desc="Generate transcripts for every completed call." k="autoTranscript" />
          </SectionCard>
          <SectionCard title="CRM & Sync" icon={Globe} color="#A67C2E">
            <ToggleRow label="CRM Auto-Sync" desc="Push qualified leads to your CRM after every call." k="crmSync" color="#A67C2E" />
            <ToggleRow label="Webhook Triggers" desc="Fire webhooks on HOT lead qualification events." k="webhooks" color="#A67C2E" />
          </SectionCard>
        </div>
      );

      case "notifications": return (
        <SectionCard title="Notification Preferences" icon={Bell} color="#D4AF37">
          <ToggleRow label="HOT Lead Alerts" desc="Get notified instantly when a lead scores above threshold." k="notifications" color="#D4AF37" />
          <ToggleRow label="Daily Email Digest" desc="Receive a morning summary of yesterday's call performance." k="emailDigest" color="#D4AF37" />
          <ToggleRow label="Do Not Disturb" desc="Pause all notifications outside business hours." k="doNotDisturb" color="#D4AF37" />
        </SectionCard>
      );

      case "calling": return (
        <div className="space-y-4">
          <SectionCard title="Calling Window" icon={Phone} color="#0F3D3E">
            <div className="py-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InputField label="Start Time" defaultValue="09:00 AM" />
                <InputField label="End Time" defaultValue="06:00 PM" />
              </div>
              <InputField label="Max Concurrent Calls" defaultValue="5" type="number" />
              <InputField label="Retry Attempts (no-answer)" defaultValue="3" type="number" />
            </div>
          </SectionCard>
          <SectionCard title="Recording" icon={Shield} color="#1F8A70">
            <ToggleRow label="Call Recording" desc="Record all calls for compliance review and scoring." k="callRecording" />
          </SectionCard>
        </div>
      );

      case "ai": return (
        <div className="space-y-4">
          <SectionCard title="AI Engine" icon={Brain} color="#1F8A70">
            <ToggleRow label="Sentiment Analysis" desc="Detect tone and objections during live calls." k="sentimentAnalysis" />
            <ToggleRow label="Multi-Language Mode" desc="Enable Hindi, Tamil, and Telugu support." k="multiLanguage" />
            <ToggleRow label="Groq LLM Scoring" desc="Use Groq LLaMA 3 for deep BANT analysis." k="groqScoring" />
          </SectionCard>
          <SectionCard title="Scoring Thresholds" icon={Sliders} color="#D4AF37">
            <div className="py-4">
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: "#94a3b8" }}>
                HOT Lead Score Threshold — <span style={{ color: "#1F8A70" }}>{settings.bantThreshold}.0 / 10</span>
              </label>
              <input type="range" min={5} max={10} value={settings.bantThreshold}
                onChange={e => setSettings(s => ({ ...s, bantThreshold: +e.target.value }))}
                className="w-full accent-emerald-600 cursor-pointer" />
              <div className="flex justify-between text-[10px] font-bold mt-1" style={{ color: "#94a3b8" }}>
                <span>5 — Low</span><span>7 — Default</span><span>10 — Max</span>
              </div>
            </div>
          </SectionCard>
        </div>
      );

      case "security": return (
        <SectionCard title="Security & Access" icon={Shield} color="#0F3D3E">
          <ToggleRow label="Two-Factor Authentication" desc="Require OTP on every login for added security." k="twoFactor" color="#0F3D3E" />
          <ToggleRow label="Auto Session Timeout" desc="Log out inactive sessions after 30 minutes." k="sessionTimeout" color="#0F3D3E" />
          <div className="py-3.5">
            <InputField label="Current Password" type="password" placeholder="••••••••" />
            <InputField label="New Password" type="password" placeholder="••••••••" />
          </div>
        </SectionCard>
      );

      case "integrations": return (
        <div className="space-y-3">
          {[
            { name: "ElevenLabs",  desc: "Conversational AI voice calls",  color: "#1F8A70", connected: true  },
            { name: "Groq",        desc: "LLaMA 3 BANT scoring engine",    color: "#D4AF37", connected: true  },
            { name: "Sarvam AI",   desc: "Hindi/regional TTS responses",   color: "#0F3D3E", connected: true  },
            { name: "Salesforce",  desc: "CRM lead sync & pipeline",       color: "#A67C2E", connected: false },
            { name: "HubSpot",     desc: "Marketing & contact management", color: "#A67C2E", connected: false },
            { name: "Slack",       desc: "HOT lead instant notifications",  color: "#D4AF37", connected: false },
          ].map((int, i) => (
            <motion.div key={int.name} {...fadeUp(0.04 + i * 0.04)}
              className="premium-card px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${int.color},${int.color}aa)`, fontFamily: "'Outfit',sans-serif" }}>
                  {int.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#09090b", fontFamily: "'Outfit',sans-serif" }}>{int.name}</div>
                  <div className="text-xs" style={{ color: "#71717a" }}>{int.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {int.connected
                  ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "rgba(31,138,112,0.1)", color: "#1F8A70" }}>Connected</span>
                  : <button className="text-[10px] font-black px-2.5 py-1 rounded-full transition-colors"
                      style={{ background: "rgba(212,175,55,0.1)", color: "#A67C2E", border: "1px solid rgba(212,175,55,0.2)" }}>
                      Connect
                    </button>}
                <ChevronRight className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
              </div>
            </motion.div>
          ))}
        </div>
      );

      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="crown-badge">Configuration</div>
            </div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit',sans-serif" }}>Settings</h1>
            <p className="text-xs mt-1 font-medium" style={{ color: "#71717a" }}>Manage your VoiceQual AI platform preferences.</p>
          </div>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-wider"
            style={{
              background: saved ? "linear-gradient(135deg,#1F8A70,#28B893)" : "linear-gradient(135deg,#1F8A70,#0F3D3E)",
              boxShadow: saved ? "0 6px 20px rgba(31,138,112,0.35)" : "0 4px 14px rgba(31,138,112,0.25)",
              fontFamily: "'Outfit',sans-serif",
            }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}
          </motion.button>
        </motion.div>

        <div className="flex gap-5">
          {/* Sidebar tabs */}
          <motion.div {...fadeUp(0.05)} className="premium-card p-2 flex flex-col gap-0.5 w-48 flex-shrink-0 self-start">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all w-full"
                  style={{
                    background: active ? "linear-gradient(135deg,rgba(31,138,112,0.1),rgba(31,138,112,0.05))" : "transparent",
                    border: active ? "1px solid rgba(31,138,112,0.15)" : "1px solid transparent",
                  }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? "#1F8A70" : "#94a3b8" }} />
                  <span className="text-xs font-bold" style={{ color: active ? "#1F8A70" : "#64748b", fontFamily: "'Outfit',sans-serif" }}>{label}</span>
                  {active && <Sparkles className="w-2.5 h-2.5 ml-auto" style={{ color: "#D4AF37" }} />}
                </button>
              );
            })}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
