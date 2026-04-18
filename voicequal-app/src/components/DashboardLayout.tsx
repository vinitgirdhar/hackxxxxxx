import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, UserCheck, PhoneCall, BarChart3,
  Activity, Settings, HelpCircle, LogOut, ChevronRight,
  Gem, Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: UserCheck, label: "Leads", href: "/leads" },
  { icon: PhoneCall, label: "Calls", href: "/calls" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Activity, label: "Pipeline", href: "/pipeline" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Docs", href: "/help" },
];

// Floating particles for sidebar decoration
function SidebarParticles() {
  const types = ['gold', 'emerald', 'diamond'];
  const particles = Array.from({ length: 10 }).map((_, i) => ({
    type: types[i % 3],
    size: 2 + Math.random() * 3,
    left: `${10 + Math.random() * 80}%`,
    top: `${5 + Math.random() * 90}%`,
    duration: 8 + Math.random() * 6,
    delay: Math.random() * 5,
    anim: i % 2 === 0 ? 'float-particle' : 'float-particle-reverse',
  }));
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div key={i} className={`particle particle--${p.type}`} style={{
          width: p.size, height: p.size, left: p.left, top: p.top,
          animation: `${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          opacity: 0.4,
        }} />
      ))}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Tilt cards on dashboard pages
  useEffect(() => {
    const handleCards = () => {
      document.querySelectorAll<HTMLElement>('.machined-panel, .premium-card').forEach(card => {
        card.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
      });
    };
    // Small delay so cards are mounted first
    const t = setTimeout(handleCards, 300);
    return () => clearTimeout(t);
  }, [location]);

  const currentLabel = navItems.find(n => location === n.href || location.startsWith(n.href))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen dashboard-app-bg">

      {/* ── Ambient background orbs — very subtle, pushed to edges ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb ambient-orb--gold" style={{ width: 600, height: 600, top: '-20%', left: '-15%', opacity: 0.06, animationDelay: '0s' }} />
        <div className="ambient-orb ambient-orb--emerald" style={{ width: 700, height: 700, top: '50%', right: '-20%', opacity: 0.05, animationDelay: '3s' }} />
        <div className="ambient-orb ambient-orb--moss" style={{ width: 500, height: 500, bottom: '-15%', left: '20%', opacity: 0.04, animationDelay: '6s' }} />
      </div>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 h-full z-40 flex flex-col"
        style={{
          width: 248,
          background: "linear-gradient(180deg, hsl(180,65%,4%) 0%, hsl(180,60%,6%) 50%, hsl(175,55%,5%) 100%)",
          borderRight: "1px solid rgba(212,175,55,0.12)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.45), inset -1px 0 0 rgba(212,175,55,0.06)",
        }}
      >
        <SidebarParticles />

        {/* Gold shimmer top line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] gold-shimmer opacity-60 z-10" />

        {/* Logo */}
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-5 py-5 text-left w-full relative z-10"
          style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}
        >
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 gold-border"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
            <span className="text-white text-sm font-black">V</span>
            <div className="absolute inset-0 rounded-xl animate-ping" style={{ backgroundColor: "#1F8A70", opacity: 0.06, animationDuration: "3s" }} />
          </div>
          <div>
            <div className="text-base font-black text-white tracking-tight uppercase leading-none">
              Voice<span style={{ color: "#28B893" }}>Qual</span>
            </div>
            <div className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: "rgba(212,175,55,0.5)" }}>
              AI Platform
            </div>
          </div>
        </motion.button>

        {/* Live pulse banner */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2.5 relative z-10"
          style={{ background: "rgba(31,138,112,0.08)", border: "1px solid rgba(31,138,112,0.15)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#28B893" }} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#28B893" }}>AI Engine Live</span>
          <Zap className="w-2.5 h-2.5 ml-auto" style={{ color: "#D4AF37" }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto relative z-10">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-2.5 mt-1" style={{ color: "rgba(212,175,55,0.35)" }}>
            Main Menu
          </div>
          <div className="relative space-y-0.5">
            {navItems.map(({ icon: Icon, label, href }, idx) => {
              const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
              return (
                <div key={href} className="relative">
                  {/* Sliding background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, rgba(31,138,112,0.22), rgba(31,138,112,0.09))",
                        border: "1px solid rgba(31,138,112,0.28)",
                        boxShadow: "0 2px 12px rgba(31,138,112,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  {/* Sliding left accent bar */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full pointer-events-none"
                      style={{ backgroundColor: "#28B893" }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <motion.button
                    onClick={() => navigate(href)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: isActive ? 0 : 2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold relative group"
                    style={{
                      color: isActive ? "#28B893" : "rgba(255,255,255,0.45)",
                      border: "1px solid transparent",
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(31,138,112,0.22)" : "rgba(255,255,255,0.04)",
                        border: isActive ? "1px solid rgba(31,138,112,0.32)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#28B893" : "rgba(255,255,255,0.35)" }} />
                    </div>
                    <span className="flex-1 text-left font-bold text-[13px]">{label}</span>
                    {isActive && (
                      <motion.div layoutId="nav-chevron" transition={{ type: "spring", stiffness: 380, damping: 34 }}>
                        <ChevronRight className="w-3 h-3 opacity-50" style={{ color: "#28B893" }} />
                      </motion.div>
                    )}
                    {/* Hover glow */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{ background: "rgba(255,255,255,0.03)" }} />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Stat footer */}
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl relative z-10"
          style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.5)" }}>Today's Calls</div>
              <div className="text-base font-black text-white mt-0.5">990 <span className="text-[9px] font-medium" style={{ color: "rgba(31,138,112,0.8)" }}>↑ 12%</span></div>
            </div>
            <Gem className="w-4 h-4" style={{ color: "rgba(212,175,55,0.4)" }} />
          </div>
        </div>

        {/* User */}
        <div className="px-3 py-3 relative z-10" style={{ borderTop: "1px solid rgba(212,175,55,0.08)" }}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 gold-border"
              style={{ background: "linear-gradient(135deg,#D4AF37,#A67C2E)" }}>
              VQ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Admin User</div>
              <div className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>admin@voicequal.ai</div>
            </div>
            <LogOut className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#94a3b8" }} />
          </motion.div>
        </div>
      </motion.aside>

      {/* ── Page Area ── */}
      <div className="flex-1 flex flex-col relative z-10" style={{ marginLeft: 248 }}>

        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-30 flex items-center justify-between px-8 h-14"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 1px 0 rgba(212,175,55,0.12), 0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-2.5">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "rgba(31,138,112,0.08)", border: "1px solid rgba(31,138,112,0.15)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>VoiceQual</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "#cbd5e1" }} />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-black tracking-tight"
                style={{ color: "#09090b" }}
              >
                {currentLabel}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Right: status badges */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(31,138,112,0.06)", border: "1px solid rgba(31,138,112,0.15)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#1F8A70" }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#1F8A70" }}>Live</span>
            </div>

            {/* Hot leads pulse */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#A67C2E" }}>312 Hot</span>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black gold-border cursor-pointer hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
              A
            </div>
          </div>
        </motion.header>

        {/* Gold shimmer under topbar */}
        <div className="h-[1px] gold-shimmer opacity-40 sticky top-14 z-30" />

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="px-8 py-8 min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
