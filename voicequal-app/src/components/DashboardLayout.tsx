import { useLocation } from "wouter";
import {
  LayoutDashboard, UserCheck, PhoneCall, BarChart3,
  Activity, Settings, HelpCircle, LogOut, ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: UserCheck,        label: "Leads",     href: "/leads"     },
  { icon: PhoneCall,        label: "Calls",     href: "/calls"     },
  { icon: BarChart3,        label: "Analytics", href: "/analytics" },
  { icon: Activity,         label: "Pipeline",  href: "/pipeline"  },
  { icon: Settings,         label: "Settings",  href: "/settings"  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  return (
    <div className="flex min-h-screen admin-bg">

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col transition-all"
        style={{
          width: 240,
          background: "hsl(180, 65%, 5%)", // Deep midnight teal
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 px-6 py-5 border-b hover:opacity-80 transition-opacity text-left w-full"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black gold-border"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
            V
          </div>
          <span className="text-base font-black text-white tracking-tight uppercase">
            Voice<span className="text-emerald-400">Qual</span>
          </span>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-widest px-3 mb-3 text-zinc-500">
            Main Menu
          </div>
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60 text-emerald-400" />}
              </button>
            );
          })}

          <div className="text-[10px] font-black uppercase tracking-widest px-3 mt-6 mb-3 text-zinc-500">
            Support
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent">
            <HelpCircle className="w-4 h-4 shrink-0 text-zinc-500" /> Help & Docs
          </button>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 gold-border"
              style={{ background: "linear-gradient(135deg,#D4AF37,#A67C2E)" }}>
              VQ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Admin User</div>
              <div className="text-[10px] text-zinc-400 truncate">admin@voicequal.ai</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </aside>

      {/* Page area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: 240 }}>
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-8 h-14"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="text-sm" style={{ color: "#71717a" }}>
            <span className="font-bold" style={{ color: "#09090b" }}>
              {navItems.find(n => location === n.href || location.startsWith(n.href))?.label ?? "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-white border depth-shadow-sm"
            style={{ color: "#71717a", borderColor: "rgba(0,0,0,0.07)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#1F8A70" }} />
            Live
          </div>
        </header>

        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
