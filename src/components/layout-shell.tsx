"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSidebar, SidebarProvider } from "@/components/nav-sidebar";
import NavSidebar from "@/components/nav-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { registerServiceWorker } from "@/lib/register-sw";

const PUBLIC_ROUTES = ["/login"];

function ShellContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b100b]">
        <div className="text-[#7d9154] animate-pulse font-mono text-sm">
          Initializing POLAR-OPS...
        </div>
      </div>
    );
  }

  if (!session && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  if (!session) return <>{children}</>;

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
