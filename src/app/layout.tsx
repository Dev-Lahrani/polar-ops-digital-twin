import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POLAR-OPS Digital Twin",
  description: "Digital Twin for Indian Antarctic Research Stations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
