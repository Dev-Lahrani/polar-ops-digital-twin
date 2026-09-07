"use client";

import { useEffect } from "react";
import { useSidebar, SidebarProvider } from "@/components/nav-sidebar";
import NavSidebar from "@/components/nav-sidebar";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { registerServiceWorker } from "@/lib/register-sw";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#0b100b] text-[#edf2e7]">
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
    <AuthProvider>
      <SidebarProvider>
        <ShellContent>{children}</ShellContent>
      </SidebarProvider>
    </AuthProvider>
  );
}
