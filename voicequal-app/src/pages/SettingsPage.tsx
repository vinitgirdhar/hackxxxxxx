import { motion } from "framer-motion";
import { Bell, Shield, Zap, Globe, Sliders, Save } from "lucide-react";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-10 h-5.5 rounded-full transition-all relative flex items-center"
      style={{
        width: 40, height: 22,
        backgroundColor: value ? "#1F8A70" : "rgba(0,0,0,0.12)",
        padding: 2,
      }}>
      <motion.div animate={{ x: value ? 18 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoCall: true,
    bantScoring: true,
    crmSync: true,
    notifications: true,
    doNotDisturb: false,
    callRecording: true,
    sentimentAnalysis: true,
    multiLanguage: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const sections = [
    {
      icon: Zap, label: "Automation", color: "#1F8A70",
      items: [
        { key: "autoCall",  label: "Auto-Call New Leads",      desc: "Automatically initiate calls when leads are imported." },
        { key: "bantScoring", label: "Real-time BANT Scoring", desc: "Score leads instantly during each conversation."        },
        { key: "crmSync",   label: "CRM Auto-Sync",            desc: "Push qualified leads to CRM after every call."         },
      ],
    },
    {
      icon: Bell, label: "Notifications", color: "#D4AF37",
      items: [
        { key: "notifications",  label: "HOT Lead Alerts",     desc: "Get notified when a lead scores above 8.0."           },
        { key: "doNotDisturb",   label: "Do Not Disturb Mode", desc: "Pause all calls outside business hours."              },
      ],
    },
    {
      icon: Shield, label: "Compliance", color: "#0F3D3E",
      items: [
        { key: "callRecording",  label: "Call Recording",      desc: "Record all calls for compliance and review."           },
      ],
    },
    {
      icon: Globe, label: "Intelligence", color: "#A67C2E",
      items: [
        { key: "sentimentAnalysis", label: "Sentiment Analysis", desc: "Detect tone and objections during calls."            },
        { key: "multiLanguage",     label: "Multi-Language Mode", desc: "Enable Hindi, Tamil, and Telugu support."          },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#09090b" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>Configure your VoiceQual platform.</p>
      </motion.div>

      {sections.map((sec, si) => (
        <motion.div key={sec.label} {...fadeUp(0.05 + si * 0.05)} className="premium-card overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${sec.color}10`, border: `1px solid ${sec.color}20` }}>
              <sec.icon className="w-4 h-4" style={{ color: sec.color }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: "#09090b" }}>{sec.label}</span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
            {sec.items.map(item => (
              <div key={item.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#09090b" }}>{item.label}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "#71717a" }}>{item.desc}</div>
                </div>
                <Toggle value={settings[item.key as keyof typeof settings]} onChange={() => toggle(item.key as keyof typeof settings)} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Calling window */}
      <motion.div {...fadeUp(0.3)} className="premium-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(31,138,112,0.1)", border: "1px solid rgba(31,138,112,0.2)" }}>
            <Sliders className="w-4 h-4" style={{ color: "#1F8A70" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: "#09090b" }}>Calling Window</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[{ label: "Start Time", value: "09:00 AM" }, { label: "End Time", value: "06:00 PM" }].map(f => (
            <div key={f.label}>
              <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#94a3b8" }}>{f.label}</label>
              <input defaultValue={f.value} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", color: "#09090b" }} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#94a3b8" }}>HOT Score Threshold</label>
          <input type="range" min="5" max="10" defaultValue="7" className="w-full accent-emerald-500" />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "#94a3b8" }}>
            <span>5.0</span><span>7.0 (current)</span><span>10.0</span>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.35)}>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90"
          style={{ backgroundColor: "#1F8A70" }}>
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </motion.div>
    </div>
  );
}
