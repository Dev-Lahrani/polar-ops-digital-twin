"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { name: "Station Twin", href: "/station/bharati", icon: Building2, matchPrefix: true },
  { name: "Simulator", href: "/simulator", icon: FlaskConical },
  { name: "Failure Cascade", href: "/cascade", icon: AlertTriangle },
  { name: "Resources", href: "/resources", icon: BarChart3 },
  { name: "Resupply", href: "/resupply", icon: Ship },
];

export default function NavSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    if (item.matchPrefix) {
      return pathname.startsWith("/station");
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col justify-between border-r border-[#1e293b] bg-[#0f1729] text-slate-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Top Section: Logo & Brand */}
      <div className="flex flex-col border-b border-[#1e293b]/70">
        <div className="flex h-16 items-center justify-between px-3.5">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  POLAR-OPS
                </span>
                <span className="text-[9px] tracking-wider text-cyan-400/80 uppercase font-semibold">
                  ANTARCTIC MISSION CONTROL
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
          )}

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`flex h-7 w-7 items-center justify-center rounded border border-[#1e293b] text-slate-400 hover:bg-[#1e293b] hover:text-white transition-colors ${
              collapsed ? "mx-auto mt-2 mb-2" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-2 py-4">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "border-l-2 border-cyan-400 bg-[#162238] text-cyan-300 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  : "border-l-2 border-transparent text-slate-400 hover:bg-[#162033] hover:text-slate-200"
              } ${collapsed ? "justify-center px-2" : "gap-3"}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  active ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              {!collapsed && <span className="truncate tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Operational Status */}
      <div className="border-t border-[#1e293b]/70 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-md bg-[#090e1a] border border-emerald-500/20 px-2.5 py-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                SYSTEM OPERATIONAL
              </span>
              <span className="text-[9px] text-slate-500 tracking-tight">
                TELEMETRY ACTIVE
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center py-1"
            title="SYSTEM OPERATIONAL"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
