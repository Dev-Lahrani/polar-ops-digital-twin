"use client";

import { useState, useEffect } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Play, RotateCcw, Thermometer, Users, Zap, Microscope, Ship, AlertCircle } from "lucide-react";
import { getStation, stations } from "@/data/stations";
import { SimulationInput, Station } from "@/types";

interface SimulationPanelProps {
  stationId: string;
  onStationChange?: (id: string) => void;
  onSimulate: (input: SimulationInput) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  isDanger: boolean;
  dangerMessage?: string;
  icon: React.ComponentType<{ className?: string }>;
  onChange: (val: number) => void;
}

function SliderRow({
  label,
  value,
  unit,
  min,
  max,
  step,
  isDanger,
  dangerMessage,
  icon: Icon,
  onChange,
}: SliderRowProps) {
  return (
    <div className="space-y-2.5 rounded-xl border border-[#1e293b] bg-[#0c1322] p-4 transition-all hover:border-[#2a3b5c]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md border ${
              isDanger
                ? "bg-red-950/60 border-red-800/60 text-red-400"
                : "bg-cyan-950/40 border-cyan-800/40 text-cyan-400"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-bold font-mono px-2 py-0.5 rounded border ${
              isDanger
                ? "bg-red-950/40 border-red-800/60 text-red-400"
                : "bg-[#162033] border-[#1e293b] text-cyan-300"
            }`}
          >
            {value} {unit}
          </span>
        </div>
      </div>

      {/* Slider */}
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-1 cursor-pointer"
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#161f30]">
          <SliderPrimitive.Range
            className={`absolute h-full transition-all ${
              isDanger ? "bg-gradient-to-r from-amber-500 to-red-500" : "bg-gradient-to-r from-blue-600 to-cyan-400"
            }`}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={`block h-4 w-4 rounded-full border-2 transition-transform hover:scale-125 focus:outline-none ${
            isDanger
              ? "border-red-400 bg-red-100 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              : "border-cyan-400 bg-white shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          }`}
          aria-label={label}
        />
      </SliderPrimitive.Root>

      {/* Danger Zone Indicator */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-500">
          {min} {unit}
        </span>
        {isDanger ? (
          <span className="flex items-center gap-1 text-red-400 font-semibold animate-pulse">
            <AlertCircle className="h-3 w-3" />
            {dangerMessage || "DANGER THRESHOLD EXCEEDED"}
          </span>
        ) : (
          <span className="text-slate-500">NOMINAL RANGE</span>
        )}
        <span className="text-slate-500">
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

export default function SimulationPanel({
  stationId,
  onStationChange,
  onSimulate,
}: SimulationPanelProps) {
  const currentStation: Station = getStation(stationId) || stations[0];

  // Internal state for all 5 sliders
  const [tempC, setTempC] = useState<number>(currentStation.temperature ?? -28);
  const [crew, setCrew] = useState<number>(currentStation.crewCount ?? 35);
  const [generators, setGenerators] = useState<number>(3);
  const [scienceLoad, setScienceLoad] = useState<number>(65);
  const [resupplyDelay, setResupplyDelay] = useState<number>(0);

  // Sync defaults when stationId changes
  useEffect(() => {
    const s = getStation(stationId);
    if (s) {
      setTempC(s.temperature ?? -28);
      setCrew(s.crewCount ?? 35);
      setGenerators(3);
      setScienceLoad(65);
      setResupplyDelay(0);
    }
  }, [stationId]);

  const handleReset = () => {
    const s = getStation(stationId) || stations[0];
    setTempC(s.temperature ?? -28);
    setCrew(s.crewCount ?? 35);
    setGenerators(3);
    setScienceLoad(65);
    setResupplyDelay(0);
  };

  const handleRun = () => {
    onSimulate({
      stationId,
      temperatureC: tempC,
      crewCount: crew,
      generatorsOnline: generators,
      scientificLoadPercent: scienceLoad,
      resupplyDelayDays: resupplyDelay,
    });
  };

  // Danger threshold checks
  const isTempDanger = tempC <= -35;
  const isCrewDanger = crew >= 48;
  const isGenDanger = generators <= 1;
  const isScienceDanger = scienceLoad >= 85;
  const isResupplyDanger = resupplyDelay >= 10;

  return (
    <div className="space-y-6 rounded-2xl border border-[#1e293b] bg-[#090e1a] p-6 shadow-2xl font-mono">
      {/* Station Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Target Station Facility
        </label>
        <div className="grid grid-cols-2 gap-2">
          {stations.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStationChange?.(s.id)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all ${
                s.id === stationId
                  ? "border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "border-[#1e293b] bg-[#111827] text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  s.id === stationId ? "bg-cyan-400 animate-pulse" : "bg-slate-600"
                }`}
              />
              {s.name} Station
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="border-t border-[#1e293b]/80 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white">
              SCENARIO PARAMETERS
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">
            DYNAMIC STRESS INJECTION
          </span>
        </div>

        {/* 5 Sliders */}
        <div className="space-y-3.5">
          {/* 1. External Temperature: +5°C to -40°C */}
          <SliderRow
            label="External Temperature"
            value={tempC}
            unit="°C"
            min={-40}
            max={5}
            step={1}
            isDanger={isTempDanger}
            dangerMessage="EXTREME HYPOTHERMIC LOAD"
            icon={Thermometer}
            onChange={setTempC}
          />

          {/* 2. Crew Count: 15 to 72 */}
          <SliderRow
            label="Crew Count"
            value={crew}
            unit="personnel"
            min={15}
            max={72}
            step={1}
            isDanger={isCrewDanger}
            dangerMessage="LIFE SUPPORT DEMAND OVERLOAD"
            icon={Users}
            onChange={setCrew}
          />

          {/* 3. Generators Online: 1 to 3 */}
          <SliderRow
            label="Generators Online"
            value={generators}
            unit="/ 3 active"
            min={1}
            max={3}
            step={1}
            isDanger={isGenDanger}
            dangerMessage="ZERO HEADROOM REDUNDANCY"
            icon={Zap}
            onChange={setGenerators}
          />

          {/* 4. Scientific Load: 0% to 100% */}
          <SliderRow
            label="Scientific Load"
            value={scienceLoad}
            unit="%"
            min={0}
            max={100}
            step={5}
            isDanger={isScienceDanger}
            dangerMessage="GRID CAPACITY STRESS"
            icon={Microscope}
            onChange={setScienceLoad}
          />

          {/* 5. Resupply Delay: 0 to +30 days */}
          <SliderRow
            label="Resupply Delay"
            value={resupplyDelay}
            unit="days"
            min={0}
            max={30}
            step={1}
            isDanger={isResupplyDanger}
            dangerMessage="DEPLETION HORIZON BREACH"
            icon={Ship}
            onChange={setResupplyDelay}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 border-t border-[#1e293b]/80 pt-4">
        <button
          type="button"
          onClick={handleRun}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider py-3.5 px-4 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-[0.99] cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>RUN SIMULATION</span>
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RESET TO CURRENT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
