"use client";

import { useSidebar, SidebarProvider } from "@/components/nav-sidebar";
import NavSidebar from "@/components/nav-sidebar";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-200">
      <NavSidebar />
      <main
        className={`flex-1 transition-all duration-300 min-h-screen p-6 md:p-8 overflow-y-auto ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellContent>{children}</ShellContent>
    </SidebarProvider>
  );
}
