"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import FloodMap from "./floodMap";
import ReportFlood from "./components/ReportFlood";

type WeatherData = {
  temp: number;
  rain: number;
  recentRain: number;
  wind: number;
  location?: string;
  zoneScore?: number;
  zoneLevel?: string;
};

type FloodZone = {
  name: string;
  distance: number;
  risk: number;
  riskLevel: string;
  lat?: number;
  lon?: number;
};

type RiskResult = {
  label: string;
  level: string;
  message: string;
  score: number;
  color: string;
  glow: string;
};

type MapZone = {
  lat: number;
  lon: number;
  risk: number;
  name: string;
};

const FloodInsights = dynamic(
  () => import("@/app/components/FloodInsights"),
  { ssr: false }
) as React.ComponentType<{
  onData?: (zones: FloodZone[]) => void;
  rain?: number;
}>;


export default function Dashboard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [mapZones, setMapZones] = useState<MapZone[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
type FloodReport = {
  id: string;
  area: string;
  note?: string;
  severity: "LOW" | "MODERATE" | "HIGH";
  lat: number;
  lon: number;
  created_at: string;
};

const [reports, setReports] = useState<FloodReport[]>([]);
  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 6.5244, lon: 3.3792 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const freshCoords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        setCoords(freshCoords);
        localStorage.setItem("user_coords", JSON.stringify(freshCoords));
      },
      () => {
        const saved = localStorage.getItem("user_coords");

        if (saved) {
          setCoords(JSON.parse(saved));
          return;
        }

        setCoords({ lat: 6.5244, lon: 3.3792 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

    if (!res.ok) {
      throw new Error("Failed to fetch weather");
    }

    const json = await res.json();
    setData(json);
  } catch (err: any) {
    setError(err.message);
  }
}

async function fetchReports() {
  try {
    const res = await fetch("/api/activeReports", {
      cache: "no-store",
    });

    const json = await res.json();

    if (Array.isArray(json)) {
      setReports(json);
    }
  } catch (err) {
    console.log("Failed to fetch reports");
  }
}

const activeReports = reports.filter((report) => {
  const ageMs = Date.now() - new Date(report.created_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  return ageHours <= 72;
});

const displayedReports: FloodReport[] =
  activeReports.length > 0
    ? activeReports
    : [
        {
          id: "watch-ajah",
          area: "Ajah",
          note: "Known flood-prone area under monitoring.",
          severity: "HIGH",
          lat: 6.4698,
          lon: 3.5852,
          created_at: new Date().toISOString(),
        },
        {
          id: "watch-lekki",
          area: "Lekki Phase 1",
          note: "Historical flood-risk zone. Monitor during rainfall.",
          severity: "MODERATE",
          lat: 6.4474,
          lon: 3.4753,
          created_at: new Date().toISOString(),
        },
      ];

  useEffect(() => {
    if (!coords) return;

    fetchWeather(coords.lat, coords.lon);

    const interval = setInterval(() => {
      fetchWeather(coords.lat, coords.lon);
    }, 120000);

    return () => clearInterval(interval);
  }, [coords]);
 useEffect(() => {
  fetchReports();
}, []);

useEffect(() => {
  const reportZones: MapZone[] = reports.map((report) => ({
    lat: report.lat,
    lon: report.lon,
    name: `Report: ${report.area}`,
    risk:
      report.severity === "HIGH"
        ? 95
        : report.severity === "MODERATE"
        ? 75
        : 55,
  }));

  
const displayedReports =
  activeReports.length > 0
    ? activeReports
    : [
        {
          id: "watch-ajah",
          area: "Ajah",
          note: "Known flood-prone area under monitoring.",
          severity: "HIGH" as const,
          lat: 6.4698,
          lon: 3.5852,
          created_at: new Date().toISOString(),
        },
        {
          id: "watch-lekki",
          area: "Lekki Phase 1",
          note: "Historical flood-risk zone. Monitor during rainfall.",
          severity: "MODERATE" as const,
          lat: 6.4474,
          lon: 3.4753,
          created_at: new Date().toISOString(),
        },
      ];
  const zones: MapZone[] = floodZones
    .filter((z) => z.lat && z.lon)
    .map((z) => ({
      lat: z.lat!,
      lon: z.lon!,
      risk: z.risk,
      name: z.name,
    }));

  setMapZones([...zones, ...reportZones]);
}, [floodZones, reports]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-300">
        ⚠️ {error}
      </div>
    );
  }

  if (!data || !coords) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-white/60">Loading climate intelligence...</p>
        </div>
        
      </div>
    );
  }

const nearbyHighReports = reports.filter(
  (r) => r.severity === "HIGH"
).length;

const nearbyModerateReports = reports.filter(
  (r) => r.severity === "MODERATE"
).length;

const rainfallFactor = Math.min(data.recentRain * 4, 40);

const currentRainFactor = data.rain > 0 ? 15 : 0;

const reportFactor =
  nearbyHighReports * 18 +
  nearbyModerateReports * 8;

const windFactor =
  data.wind > 18 ? 10 : data.wind > 10 ? 5 : 0;

const historicalFactor =
  floodZones.length > 0
    ? Math.max(...floodZones.map((z) => z.risk)) * 0.15
    : 0;

const calculatedRisk = Math.min(
  Math.round(
    rainfallFactor +
      currentRainFactor +
      reportFactor +
      windFactor +
      historicalFactor
  ),
  100
);

const risk = calculateRisk(data, calculatedRisk);
  const advice = generateAdvice(data, risk, floodZones);
  const highRiskZones = floodZones.filter((z) => z.risk > 70).length;

const lastUpdated = new Date().toLocaleTimeString();

const lastRainfallScan = data
  ? new Date().toLocaleTimeString()
  : "Pending";

const lastCommunityReport =
  reports.length > 0
    ? new Date(reports[0].created_at).toLocaleString()
    : "No recent reports";

  function speak(actions: string[]) {
    if (!("speechSynthesis" in window)) return;

    const msg = new SpeechSynthesisUtterance(actions.filter(Boolean).join(". "));
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
  }



  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
    
    {/* LIVE RAIN ALERT */}
    {data.rain > 0 && (
      <div className="sticky top-0 z-[999] border-b border-blue-400/20 bg-blue-500/10 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-bold text-blue-100">
              🌧 Rain detected in your area
            </p>

            <p className="text-xs text-blue-200/70">
              Roads may become slippery or waterlogged.
            </p>
          </div>

          <div className="rounded-full bg-blue-400/20 px-3 py-1 text-xs font-semibold text-blue-100">
            LIVE
          </div>
        </div>
      </div>
    )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              Climate Resilience System
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              CLIMAKIT
            </h1>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
            <p className="text-xs text-white/40">Current Area</p>
            <p className="font-semibold">{data.location || "Your Location"}</p>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-slate-950 p-8 shadow-2xl shadow-emerald-950/30">

  {/* GLOW */}
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
  <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

  {/* TOP */}
  <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

    {/* LEFT */}
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/70">
        Flood Risk Intelligence
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-4xl">
          🛡
        </div>

        <div>
          <h1 className="text-5xl font-black tracking-tight">
            {risk.label}
          </h1>

          <p className="mt-1 text-lg text-emerald-100">
            {risk.level}
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
       {risk.message}
      </p>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-cyan-100/60">
  Risk scores combine rainfall, wind conditions, historical flood-prone zones,
  and community-submitted flood reports.
</p>

      {/* LIVE SIGNALS */}
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100">
          🌧 Rainfall Stable
        </div>

        <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100">
          📡 Live Monitoring Active
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80">
          🧠 AI Risk Model Online
        </div>
      </div>
    </div>

    {/* RIGHT SCORE PANEL */}
    <div className="relative flex flex-col items-center">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-emerald-400/20 bg-black/20 backdrop-blur-xl">

        {/* INNER GLOW */}
        <div className="absolute inset-4 rounded-full border border-emerald-400/10" />

        <div className="text-center">
          <p className="text-6xl font-black text-white">
           {risk.score}
          </p>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
            Risk Score
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-center backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Status
        </p>

        <p className="mt-1 text-lg font-bold text-emerald-300">
          Low Flood Threat
        </p>
      </div>
    </div>
  </div>
</section>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat
            label="Temperature"
            description={describeTemp(data.temp)}
            value={`${data.temp}°C`}
          />
          <Stat
            label="Recent Rainfall"
            description={describeRain(data.recentRain)}
            value={`${data.recentRain?.toFixed(1) ?? 0} mm / last 6 hrs`}
          />
          <Stat
            label="Wind"
            description={describeWind(data.wind)}
            value={`${data.wind} km/h`}
          />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
  <TrustStamp label="Last Updated" value={lastUpdated} />
  <TrustStamp label="Last Rainfall Scan" value={lastRainfallScan} />
  <TrustStamp label="Last Community Report" value={lastCommunityReport} />
</section>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <SafetyGuide advice={advice} />
          <RouteSafetyCard floodZones={floodZones} />
        </section>

        <FloodInsights rain={data.recentRain} onData={setFloodZones} />

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
          <div className="h-[470px]">
            <FloodMap center={[coords.lat, coords.lon]} zones={mapZones} />
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
        Community Flood Reports
      </p>

      <h3 className="mt-2 text-2xl font-black">
        Live Community Reports
      </h3>

      <p className="mt-2 text-sm text-white/50">
        Citizens can help verify flooded roads and dangerous areas.
      </p>
    </div>

 <button
  onClick={() => setReportOpen(true)}
  className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold transition hover:bg-cyan-400"
>
  + Report Flood
</button>
  </div>

 <div className="mt-6 grid gap-4 md:grid-cols-3">
{displayedReports.slice(0, 6).map((report: FloodReport) => (
    <div
      key={report.id}
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{report.area}</p>
          <p className="text-xs text-white/50">
            {activeReports.length > 0
  ? "Community submitted report"
  : "Model watchlist area"}
          </p>
        </div>

        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200">
          {report.severity}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/70">
        {report.note || "Flood activity reported."}
      </p>

      <p className="mt-4 text-xs text-white/40">
        {new Date(report.created_at).toLocaleString()}
      </p>
    </div>
  ))}

  {reports.length === 0 && (
    <p className="text-sm text-white/50">
      No community reports yet.
    </p>
  )}
</div>
</section>

        <button
          onClick={() => speak(advice)}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-4 font-semibold shadow-xl shadow-blue-950/40 transition hover:scale-[1.01]"
        >
          🔊 Play Safety Audio Alert
        </button>
      </div>
{reportOpen && coords && (
  <ReportFlood
    coords={coords}
    onClose={() => setReportOpen(false)}
    onSubmitted={fetchReports}
  />
)}

<footer className="relative mx-auto max-w-7xl px-4 pb-8 pt-6 text-center text-xs text-white/40 md:px-8">
  Flood predictions are experimental and should not replace official emergency
  guidance. Always follow instructions from emergency services and local
  authorities.
</footer>
    </main>
  );
}

function SafetyGuide({ advice }: { advice: string[] }) {
  function getIcon(text: string) {
    const lower = text.toLowerCase();

    if (lower.includes("umbrella") || lower.includes("rain")) {
      return "🌧";
    }

    if (
      lower.includes("water") ||
      lower.includes("hydrated")
    ) {
      return "💧";
    }

    if (
      lower.includes("light clothing") ||
      lower.includes("outfit")
    ) {
      return "🧢";
    }

    if (
      lower.includes("jacket") ||
      lower.includes("cool")
    ) {
      return "🧥";
    }

    if (
      lower.includes("wind")
    ) {
      return "🌬";
    }

    if (
      lower.includes("avoid")
    ) {
      return "🚧";
    }

    return "📍";
  }

  function getStyle(text: string) {
    const lower = text.toLowerCase();

    if (lower.includes("avoid")) {
      return "border-red-400/20 bg-red-500/10";
    }

    if (
      lower.includes("rain") ||
      lower.includes("umbrella")
    ) {
      return "border-blue-400/20 bg-blue-500/10";
    }

    if (
      lower.includes("cool") ||
      lower.includes("outfit") ||
      lower.includes("clothing")
    ) {
      return "border-cyan-400/20 bg-cyan-500/10";
    }

    return "border-white/10 bg-black/20";
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
        Safety Guidance
      </p>

      <h3 className="mt-2 text-xl font-bold">
        Safety Guidance
      </h3>

      <div className="mt-5 space-y-3">
        {advice.map((a, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm text-white/85 ${getStyle(
              a
            )}`}
          >
            <div className="text-xl">
              {getIcon(a)}
            </div>

            <p className="leading-relaxed">
              {a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteSafetyCard({ floodZones }: { floodZones: FloodZone[] }) {
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState<{
    status: string;
    message: string;
    color: string;
  } | null>(null);

  function analyzeRoute() {
    if (!destination.trim()) return;

    const match = floodZones.find((z) =>
      z.name.toLowerCase().includes(destination.toLowerCase())
    );

    if (!match) {
      setResult({
        status: "🟢 ROUTE SAFE",
        message: "No major flood interference detected near this route.",
        color: "border-green-400/40 bg-green-500/10",
      });
      return;
    }

    if (match.risk > 70) {
      setResult({
        status: "🔴 AVOID ROUTE",
        message: `${match.name} currently shows elevated flood risk.`,
        color: "border-red-400/40 bg-red-500/10",
      });
      return;
    }

    if (match.risk > 40) {
      setResult({
        status: "🟠 WATCH ROUTE",
        message: `${match.name} may become risky if rainfall increases.`,
        color: "border-orange-400/40 bg-orange-500/10",
      });
      return;
    }

    setResult({
      status: "🟢 ROUTE SAFE",
      message: `${match.name} currently appears safe.`,
      color: "border-green-400/40 bg-green-500/10",
    });
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
        Safe Mobility
      </p>
      <h3 className="mt-2 text-xl font-bold">Route Safety Engine</h3>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination e.g. Lekki, Ajah..."
          className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400/50"
        />

        <button
          onClick={analyzeRoute}
          className="rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold transition hover:bg-blue-400"
        >
          Analyze
        </button>
      </div>

      {result && (
        <div className={`mt-5 rounded-2xl border p-4 ${result.color}`}>
          <h4 className="font-bold">{result.status}</h4>
          <p className="mt-1 text-sm text-white/75">{result.message}</p>
        </div>
      )}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function Stat({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-950/20">

      {/* GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_35%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex min-h-[150px] flex-col items-center justify-center text-center">

        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">
          {label}
        </p>

        <h3 className="mt-4 text-3xl font-black tracking-tight">
          {description}
        </h3>

        <p className="mt-3 text-sm font-medium text-white/50">
          {value}
        </p>
      </div>
    </div>
  );
}

function TrustStamp({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white/70">
        {value}
      </p>
    </div>
  );
}
function calculateRisk(
  data: WeatherData,
  calculatedScore: number
): RiskResult {

  const score = calculatedScore;

  if (score > 75) {
    return {
      label: "HIGH RISK",
      level: "Dangerous",
      message:
        "Flood activity detected from rainfall, live reports, and historical flood patterns.",
      score,
      color: "border-red-400/40 bg-red-500/10",
      glow: "shadow-red-950/40",
    };
  }

  if (score > 45) {
    return {
      label: "MODERATE",
      level: "Be careful",
      message:
        "Conditions may become unsafe in flood-prone locations.",
      score,
      color: "border-yellow-400/40 bg-yellow-500/10",
      glow: "shadow-yellow-950/40",
    };
  }

  return {
    label: "SAFE",
    level: "Good conditions",
    message:
      "No strong flood activity detected from current rainfall or community reports.",
    score,
    color: "border-emerald-400/40 bg-emerald-500/10",
    glow: "shadow-emerald-950/40",
  };
}

function generateAdvice(
  data: WeatherData,
  risk: RiskResult,
  floods: FloodZone[]
): string[] {
  const advice: string[] = [];

  if (data.rain >= 1.5) {
    advice.push(
      "Rain is currently detected in your area. Carry an umbrella and avoid waterlogged roads."
    );
  }

  if (data.recentRain >= 6 && data.rain < 1.5) {
    advice.push(
      "Recent rainfall was detected. Some low-lying roads may still be wet or waterlogged."
    );
  }

  if (data.temp >= 34) {
    advice.push("Hot conditions detected. Wear light clothing and carry water.");
  } else if (data.temp >= 28) {
    advice.push("Warm weather. Light clothing is recommended.");
  } else if (data.temp >= 22) {
    advice.push("Cool conditions. A light outfit should be comfortable.");
  } else {
    advice.push("Cool weather. Consider wearing a light jacket.");
  }

  if (data.wind >= 30) {
    advice.push(
      "Strong wind detected. Be careful around exposed roads and loose objects."
    );
  }

  const danger = floods.find((f) => f.risk > 70);

  if (danger && (data.rain >= 1.5 || data.recentRain >= 6)) {
    advice.push(
      `${danger.name} is a flood-prone zone and rainfall has been detected. Consider avoiding that route.`
    );
  }

  if (advice.length === 0) {
    advice.push("No major weather safety concern detected right now.");
  }

  return advice;
}

function describeTemp(temp: number) {
  if (temp >= 38) return "🔥 Extremely Hot";
  if (temp >= 33) return "☀️ Very Hot";
  if (temp >= 28) return "🌤 Warm";
  if (temp >= 22) return "🌥 Cool";
  return "❄️ Cold";
}
function describeRain(rain: number) {
  if (rain >= 25) return "🌧 Very Heavy Recent Rain";
  if (rain >= 10) return "🌧 Heavy Recent Rain";
  if (rain >= 2) return "🌦 Light Recent Rain";
  return "☁️ No Recent Rain";
}

function describeWind(wind: number) {
  if (wind > 60) return "🌪 Strong Wind";
  if (wind > 30) return "💨 Windy";
  return "🍃 Calm";
}

