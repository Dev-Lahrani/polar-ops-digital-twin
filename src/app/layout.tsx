import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

export const metadata: Metadata = {
  title: "POLAR-OPS — Antarctic Mission Control",
  description: "Digital Twin & Real-time Operations Platform for Indian Antarctic Research Stations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-slate-200 antialiased font-mono selection:bg-cyan-500/30 selection:text-cyan-200">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
