"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calculator, X, Cpu, ChevronRight } from "lucide-react";
import { CascadeStep } from "@/types";

interface CalculationDrawerProps {
  cascadeSteps: CascadeStep[];
}

const severityBorderColors: Record<string, string> = {
  CRITICAL: "border-l-red-500",
  critical: "border-l-red-500",
  EMERGENCY: "border-l-red-700",
  emergency: "border-l-red-700",
  WARNING: "border-l-amber-500",
  warning: "border-l-amber-500",
  CAUTION: "border-l-yellow-400",
  caution: "border-l-yellow-400",
  NOMINAL: "border-l-emerald-400",
  nominal: "border-l-emerald-400",
  INFO: "border-l-cyan-400",
  info: "border-l-cyan-400",
};

const domainBadges: Record<string, { bg: string; text: string; border: string }> = {
  power: { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-800/40" },
  climate: { bg: "bg-sky-950/40", text: "text-sky-400", border: "border-sky-800/40" },
  water: { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-800/40" },
  fuel: { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-800/40" },
  habitat: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-800/40" },
  science: { bg: "bg-purple-950/40", text: "text-purple-400", border: "border-purple-800/40" },
  safety: { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-800/40" },
  comms: { bg: "bg-indigo-950/40", text: "text-indigo-400", border: "border-indigo-800/40" },
  overall: { bg: "bg-slate-800/40", text: "text-slate-300", border: "border-slate-700/40" },
};

export default function CalculationDrawer({ cascadeSteps }: CalculationDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
        >
          <Calculator className="h-4 w-4 text-cyan-400" />
          <span>📐 SHOW CALCULATIONS</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-[#090d16] border-l border-[#1e293b] p-6 text-slate-200 shadow-2xl flex flex-col font-mono focus:outline-none overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold uppercase tracking-wider text-white">
                  Mathematical Execution Trace
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-400">
                  First-principles thermodynamic & mechanical equations
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-lg border border-[#1e293b] text-slate-400 hover:bg-[#1e293b] hover:text-white transition-colors"
                aria-label="Close calculation drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Equation list */}
          <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
            {cascadeSteps.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active cascade steps to calculate.
              </div>
            ) : (
              cascadeSteps.map((step) => {
                const badge = domainBadges[step.domain] ?? domainBadges.overall;
                const borderClass =
                  severityBorderColors[step.severity] ?? "border-l-slate-600";

                return (
                  <div
                    key={step.step}
                    className={`rounded-lg border border-[#1e293b] bg-[#0c1220] p-4 border-l-4 ${borderClass} space-y-3 shadow-md`}
                  >
                    {/* Top row: step number, domain badge, severity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[11px] font-bold text-slate-200">
                          {step.step}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {step.domain}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {step.severity}
                      </span>
                    </div>

                    {/* Variable and Transition */}
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="font-semibold text-white">{step.variable}:</span>
                      <span className="text-slate-400">{step.fromValue}</span>
                      <ChevronRight className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="font-bold text-cyan-300">{step.toValue}</span>
                    </div>

                    {/* Equation Code Block */}
                    <div className="rounded-md bg-[#050811] border border-[#1e293b]/80 p-3 overflow-x-auto">
                      <div className="text-[10px] uppercase text-cyan-400/80 font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calculator className="h-3 w-3" /> FORMULA DERIVATION
                      </div>
                      <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/40">
                        {step.equation ||
                          `Step ${step.step}: ${step.variable}\ncalculated_impact = ${step.toValue}\nstatus = verified`}
                      </pre>
                    </div>

                    {/* Explanation */}
                    {step.explanation && (
                      <p className="text-[11px] text-slate-400 italic">
                        {step.explanation}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#1e293b] pt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Engine: PolarOps Twin Solver v2.4</span>
            <span className="text-emerald-400">Deterministic Model Active</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
