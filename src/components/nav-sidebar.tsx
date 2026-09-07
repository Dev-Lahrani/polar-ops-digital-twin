"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { stations } from "@/data/stations";
import {
  LayoutDashboard,
  Building2,
  FlaskConical,
  AlertTriangle,
  BarChart3,
  Ship,
  ChevronLeft,
  ChevronRight,
  Radio,
  BrainCircuit,
  Wrench,
  Package,
  CloudSun,
  Zap,
} from "lucide-react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: boolean;
}

const navItems: NavItem[] = [
  { name: "Mission Control", href: "/", icon: LayoutDashboard },
  { name: "Infrastructure", href: "/station/bharati", icon: Building2, matchPrefix: true },
  { name: "Energy", href: "/resources", icon: Zap },
  { name: "Logistics", href: "/logistics", icon: Ship },
  { name: "Environmental", href: "/environment", icon: CloudSun },
  { name: "Simulator", href: "/simulator", icon: FlaskConical },
  { name: "Failure Cascade", href: "/cascade", icon: AlertTriangle },
  { name: "Predictive Maintenance", href: "/predictive", icon: Wrench },
  { name: "AI Copilot", href: "/copilot", icon: BrainCircuit },
];

function getStationDotColor(risk: string): string {
  switch (risk) {
    case "EMERGENCY": return "bg-red-700";
    case "CRITICAL": return "bg-red-500";
    case "WARNING": return "bg-amber-500";
    case "CAUTION": return "bg-yellow-500";
    case "NOMINAL": return "bg-emerald-500";
    default: return "bg-[#7c8b65]";
  }
}

export default function NavSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    if (item.matchPrefix) return pathname.startsWith("/station");
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col justify-between border-r border-[#2a3a1e] bg-[#101510] text-[#edf2e7] transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex flex-col border-b border-[#2a3a1e]/70">
        <div className="flex h-16 items-center justify-between px-3.5">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7d9154]/20 text-[#7d9154] border border-[#7d9154]/30">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black tracking-widest text-[#edf2e7] uppercase font-mono">
                  POLAR-OPS
                </span>
                <span className="text-[9px] tracking-wider text-[#7d9154]/80 uppercase font-semibold">
                  MISSION CONTROL
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-[#7d9154]/20 text-[#7d9154] border border-[#7d9154]/30">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
          )}

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`flex h-7 w-7 items-center justify-center rounded border border-[#2a3a1e] text-[#7c8b65] hover:bg-[#1a2518] hover:text-[#edf2e7] transition-colors ${
              collapsed ? "mx-auto mt-2 mb-2" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "border-l-2 border-[#7d9154] bg-[#1a2518] text-[#a9b97a] font-semibold"
                  : "border-l-2 border-transparent text-[#7c8b65] hover:bg-[#141b13] hover:text-[#edf2e7]"
              } ${collapsed ? "justify-center px-2" : "gap-3"}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  active ? "text-[#7d9154]" : "text-[#5a6b48] group-hover:text-[#7c8b65]"
                }`}
              />
              {!collapsed && <span className="truncate tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Station Status + System Status */}
      <div className="border-t border-[#2a3a1e]/70 p-3 space-y-2">
        {!collapsed && (
          <div className="space-y-1.5 mb-2">
            {stations.map((st) => (
              <Link
                key={st.id}
                href={`/station/${st.id}`}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[#141b13] transition-colors"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${getStationDotColor(st.riskLevel)}`} />
                <span className="text-[10px] font-mono text-[#7c8b65] truncate">{st.name}</span>
                <span className="text-[9px] font-mono text-[#5a6b48] ml-auto">{st.riskLevel}</span>
              </Link>
            ))}
          </div>
        )}

        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-md bg-[#141b13] border border-[#2a3a1e] px-2.5 py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                SYSTEM ONLINE
              </span>
              <span className="text-[9px] text-[#5a6b48] tracking-tight">
                TELEMETRY ACTIVE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1" title="SYSTEM ONLINE">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
