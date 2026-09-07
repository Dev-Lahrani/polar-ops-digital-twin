"use client";

import { Ship, Anchor, Navigation, Calendar, AlertCircle } from "lucide-react";

const vessels = [
  {
    name: "MV Polar Iris (Charter)",
    imo: "IMO 9482711",
    status: "EN ROUTE TO CAPE TOWN",
    cargo: "Fuel (450,000 L) + Science Equipment",
    etaMaitri: "28 Days (Prydz Bay Gateway)",
    etaBharati: "45 Days",
    iceClass: "DNV 1A Icebreaker",
    statusColor: "text-emerald-400 border-emerald-800/60 bg-emerald-950/40",
  },
  {
    name: "RV Bharati Resupply Secondary",
    imo: "IMO 9731208",
    status: "PORT DOCK PREPARATION",
    cargo: "Dry Provisions, Spare Turbines & Medical",
    etaMaitri: "60 Days",
    etaBharati: "72 Days",
    iceClass: "Polar Class 4",
    statusColor: "text-amber-400 border-amber-800/60 bg-amber-950/40",
  },
];

export default function ResupplyPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0c1322] via-[#0f172a] to-[#0c1322] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">
            ANTARCTIC MARITIME LOGISTICS
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
          <Ship className="h-7 w-7 text-cyan-400" />
          Resupply & Maritime Fleet
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Vessel tracking, pack ice routing corridors, and resupply window margin management
        </p>
      </div>

      {/* Convoy status notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-xs text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block mb-0.5">
            Sea Ice Advisory: Prydz Bay Consolidation
          </span>
          Fast-ice thickness currently measuring 1.8m in eastern access channels. Icebreaker escort required for final 45 nautical miles approach.
        </div>
      </div>

      {/* Vessels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vessels.map((v) => (
          <div
            key={v.name}
            className="rounded-2xl border border-[#1e293b] bg-[#090e1a] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-[#1e293b] pb-3">
              <div>
                <h2 className="text-base font-bold text-white uppercase">{v.name}</h2>
                <span className="text-[10px] text-slate-500 font-semibold">{v.imo}</span>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${v.statusColor}`}
              >
                {v.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                <span>Classification: <strong className="text-white">{v.iceClass}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Anchor className="h-3.5 w-3.5 text-cyan-400" />
                <span>Cargo: <strong className="text-white">{v.cargo}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>ETA Maitri: <strong className="text-cyan-300">{v.etaMaitri}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>ETA Bharati: <strong className="text-cyan-300">{v.etaBharati}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
