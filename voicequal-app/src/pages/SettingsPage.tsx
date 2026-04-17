import { motion } from "framer-motion";
import { Bell, Shield, Zap, Globe, Sliders, Save, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

function Toggle({ value, onChange, color = "#1F8A70" }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative flex items-center transition-all"
      style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: value ? color : "rgba(0,0,0,0.1)", padding: 2, border: `1px solid ${value ? color : "transparent"}`, boxShadow: value ? `0 0 12px ${color}30` : "none" }}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
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
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      icon: Zap, label: "Automation", color: "#1F8A70",
      items: [
        { key: "autoCall",    label: "Auto-Call New Leads",      desc: "Automatically initiate calls when leads are imported." },
        { key: "bantScoring", label: "Real-time BANT Scoring",   desc: "Score leads instantly during each conversation."       },
        { key: "crmSync",     label: "CRM Auto-Sync",            desc: "Push qualified leads to CRM after every call."        },
      ],
    },
    {
      icon: Bell, label: "Notifications", color: "#D4AF37",
      items: [
        { key: "notifications",  label: "HOT Lead Alerts",      desc: "Get notified when a lead scores above 8.0."           },
        { key: "doNotDisturb",   label: "Do Not Disturb Mode",  desc: "Pause all calls outside business hours."              },
      ],
    },
    {
      icon: Shield, label: "Compliance", color: "#0F3D3E",
      items: [
        { key: "callRecording",  label: "Call Recording",       desc: "Record all calls for compliance and review."          },
      ],
    },
    {
      icon: Globe, label: "Intelligence", color: "#A67C2E",
      items: [
        { key: "sentimentAnalysis", label: "Sentiment Analysis",  desc: "Detect tone and objections during calls."            },
        { key: "multiLanguage",     label: "Multi-Language Mode", desc: "Enable Hindi, Tamil, and Telugu support."           },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">

        {/* Header */}
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-2 mb-1">
            <div className="crown-badge">Configuration</div>
          </div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Settings</h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: "#71717a" }}>Configure your VoiceQual AI platform and automation preferences.</p>
        </motion.div>

        {/* Sections */}
        {sections.map((sec, si) => (
          <motion.div key={sec.label} {...fadeUp(0.06 + si * 0.06)} className="premium-card overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.08)", background: `${sec.color}03` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${sec.color}10`, border: `1px solid ${sec.color}20` }}>
                <sec.icon className="w-4 h-4" style={{ color: sec.color }} />
              </div>
              <span className="font-black text-sm uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{sec.label}</span>
              {/* Gold accent dot */}
              <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.color, opacity: 0.5 }} />
            </div>

            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
              {sec.items.map((item, ii) => (
                <motion.div key={item.key}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + si * 0.06 + ii * 0.04 }}
                  className="flex items-center justify-between px-6 py-4 group hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="text-sm font-bold" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>{item.label}</div>
                    <div className="text-[12px] mt-0.5 font-medium" style={{ color: "#71717a" }}>{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider"
                      style={{ color: settings[item.key as keyof typeof settings] ? sec.color : "#94a3b8" }}>
                      {settings[item.key as keyof typeof settings] ? "ON" : "OFF"}
                    </span>
                    <Toggle
                      value={settings[item.key as keyof typeof settings]}
                      onChange={() => toggle(item.key as keyof typeof settings)}
                      color={sec.color}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Calling window */}
        <motion.div {...fadeUp(0.35)} className="premium-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(31,138,112,0.1)", border: "1px solid rgba(31,138,112,0.2)" }}>
              <Sliders className="w-4 h-4" style={{ color: "#1F8A70" }} />
            </div>
            <span className="font-black text-sm uppercase tracking-wider" style={{ color: "#09090b", fontFamily: "'Outfit', sans-serif" }}>Calling Window</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Start Time", value: "09:00 AM" }, { label: "End Time", value: "06:00 PM" }].map(f => (
              <div key={f.label}>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: "#94a3b8" }}>{f.label}</label>
                <input defaultValue={f.value}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none font-bold transition-all"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(212,175,55,0.15)",
                    color: "#09090b",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(31,138,112,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.15)"}
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: "#94a3b8" }}>HOT Score Threshold</label>
            <input type="range" min="5" max="10" defaultValue="7"
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] mt-1.5 font-bold" style={{ color: "#94a3b8" }}>
              <span>5.0 (Low)</span>
              <span style={{ color: "#1F8A70" }}>7.0 (Current)</span>
              <span>10.0 (Max)</span>
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div {...fadeUp(0.42)}>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-white shadow-lg transition-all uppercase tracking-wider"
            style={{
              background: saved ? "linear-gradient(135deg, #1F8A70, #28B893)" : "linear-gradient(135deg, #1F8A70, #0F3D3E)",
              boxShadow: saved ? "0 8px 24px rgba(31,138,112,0.35)" : "0 4px 16px rgba(31,138,112,0.25)",
              fontFamily: "'Outfit', sans-serif",
            }}>
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
