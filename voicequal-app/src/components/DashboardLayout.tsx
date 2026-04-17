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
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)" }}>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col"
        style={{
          width: 240,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 px-6 py-5 border-b hover:opacity-80 transition-opacity text-left w-full"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
            style={{ background: "linear-gradient(135deg,#1F8A70,#0F3D3E)" }}>
            V
          </div>
          <span className="text-base font-black text-zinc-950 tracking-tight uppercase">
            Voice<span style={{ color: "#1F8A70" }}>Qual</span>
          </span>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-widest px-3 mb-3" style={{ color: "rgba(0,0,0,0.3)" }}>
            Main Menu
          </div>
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: isActive ? "rgba(31,138,112,0.08)" : "transparent",
                  color: isActive ? "#1F8A70" : "#71717a",
                  border: isActive ? "1px solid rgba(31,138,112,0.15)" : "1px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            );
          })}

          <div className="text-[10px] font-black uppercase tracking-widest px-3 mt-6 mb-3" style={{ color: "rgba(0,0,0,0.3)" }}>
            Support
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50"
            style={{ color: "#71717a", border: "1px solid transparent" }}>
            <HelpCircle className="w-4 h-4 shrink-0" /> Help & Docs
          </button>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 cursor-pointer group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#D4AF37,#A67C2E)" }}>
              VQ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-800 truncate">Admin User</div>
              <div className="text-[10px] text-zinc-400 truncate">admin@voicequal.ai</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
