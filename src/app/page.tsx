import Link from "next/link";
import { stations } from "@/data/stations";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1
        className="text-4xl font-bold tracking-wider mb-2"
        style={{ color: "#58a6ff" }}
      >
        POLAR-OPS
      </h1>
      <p className="text-[#8b949e] mb-10 text-center max-w-md">
        Digital Twin for Indian Antarctic Research Stations
      </p>
      <div className="flex gap-6 mb-8">
        {stations.map((station) => (
          <Link
            key={station.id}
            href={`/station/${station.id}`}
            className="block rounded-lg border p-6 transition-colors hover:border-[#58a6ff]"
            style={{
              borderColor: "#30363d",
              background: "#161b22",
              minWidth: 260,
            }}
          >
            <h2 className="text-xl font-bold text-[#e6edf3] mb-1">
              {station.name}
            </h2>
            <p className="text-xs text-[#8b949e] mb-3">
              {station.location}
            </p>
            <div className="flex gap-4 text-xs">
              <span className="text-[#3fb950]">
                ● {station.subsystems.filter((s) => s.status === "nominal").length} nominal
              </span>
              <span className="text-[#d29922]">
                ● {station.subsystems.filter((s) => s.status === "warning").length} warning
              </span>
              <span className="text-[#f85149]">
                ● {station.subsystems.filter((s) => s.status === "critical").length} critical
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex gap-4">
        <Link
          href="/cascade"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-bold uppercase tracking-wider transition-colors hover:border-[#f85149] hover:text-[#f85149]"
          style={{
            borderColor: "#30363d",
            background: "#161b22",
            color: "#8b949e",
          }}
        >
          <span>⚠️</span>
          Failure Cascade Simulator
        </Link>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-bold uppercase tracking-wider transition-colors hover:border-[#58a6ff] hover:text-[#58a6ff]"
          style={{
            borderColor: "#30363d",
            background: "#161b22",
            color: "#8b949e",
          }}
        >
          <span>📊</span>
          Resource Intelligence
        </Link>
        <Link
          href="/resupply"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-bold uppercase tracking-wider transition-colors hover:border-[#3fb950] hover:text-[#3fb950]"
          style={{
            borderColor: "#30363d",
            background: "#161b22",
            color: "#8b949e",
          }}
        >
          <span>🚢</span>
          Resupply Priority
        </Link>
      </div>
    </div>
  );
}
