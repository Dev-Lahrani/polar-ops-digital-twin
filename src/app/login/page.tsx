"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Radio, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(true);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b100b]">
      <div className="w-full max-w-md rounded-lg border border-[#2a3a1e] bg-[#101510] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#7d9154]/20 border border-[#7d9154]/30 mb-4">
            <Radio className="h-7 w-7 text-[#7d9154] animate-pulse" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-[#edf2e7] uppercase font-mono">
            POLAR-OPS
          </h1>
          <p className="text-xs text-[#7d9154]/80 tracking-wider mt-1 uppercase">
            Digital Twin Mission Control
          </p>
          <p className="text-[10px] text-[#5a6b48] mt-2">
            Ministry of Earth Sciences &bull; NCPOR
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded border border-red-800/50 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Invalid credentials. Try again.
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-[#7c8b65] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              className="w-full rounded border border-[#2a3a1e] bg-[#0b100b] px-3 py-2.5 text-sm text-[#edf2e7] placeholder-[#3a4a2e] focus:border-[#7d9154] focus:outline-none focus:ring-1 focus:ring-[#7d9154]/30 transition-colors"
              placeholder="commander@maitri.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#7c8b65] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full rounded border border-[#2a3a1e] bg-[#0b100b] px-3 py-2.5 text-sm text-[#edf2e7] placeholder-[#3a4a2e] focus:border-[#7d9154] focus:outline-none focus:ring-1 focus:ring-[#7d9154]/30 transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#7d9154] px-4 py-2.5 text-xs font-bold tracking-widest uppercase text-[#0b100b] hover:bg-[#8da364] transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <div className="mt-6 rounded border border-[#2a3a1e] bg-[#0b100b] p-3">
          <p className="text-[9px] font-mono text-[#5a6b48] uppercase tracking-wider mb-2">Demo Credentials</p>
          <div className="space-y-1.5 text-[10px] text-[#7c8b65] font-mono">
            <div className="flex justify-between">
              <span>Admin</span>
              <span className="text-[#7d9154]">commander@maitri.gov.in / maitri2026</span>
            </div>
            <div className="flex justify-between">
              <span>Engineer</span>
              <span className="text-[#7d9154]">ops@bharati.gov.in / bharati2026</span>
            </div>
            <div className="flex justify-between">
              <span>Viewer</span>
              <span className="text-[#7d9154]">viewer@ncpor.gov.in / viewer2026</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-[#3a4a2e] mt-4">
          Secure access &bull; Antarctic Operations Network
        </p>
      </div>
    </div>
  );
}
