import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
      <body className={`min-h-screen bg-[#0b100b] text-[#edf2e7] antialiased font-sans selection:bg-[#7d9154]/30 selection:text-[#edf2e7] ${inter.variable}`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
