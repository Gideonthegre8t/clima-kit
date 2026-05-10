"use client";

import { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });

type Zone = {
  lat: number;
  lon: number;
  risk: number;
  name: string;
};

type Destination = {
  lat: number;
  lon: number;
  name: string;
};

type Props = {
  center: [number, number];
  zones?: Zone[];
  destination?: Destination | null;
};

function getRiskColor(risk: number) {
  if (risk > 80) return "#ef4444";
  if (risk > 60) return "#f97316";
  if (risk > 40) return "#eab308";
  return "#22c55e";
}

function getRiskLabel(risk: number) {
  if (risk > 80) return "Severe Flood Risk";
  if (risk > 60) return "Rising Flood Risk";
  if (risk > 40) return "Watch Zone";
  return "Low Risk";
}

function getRadius(risk: number) {
  if (risk > 80) return 1800;
  if (risk > 60) return 1350;
  if (risk > 40) return 950;
  return 550;
}

export default function FloodMap({ center, zones = [], destination = null }: Props) {
  const [mounted, setMounted] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

  const safeZones = Array.isArray(zones) ? zones : [];
  const severeZones = safeZones.filter((z) => z.risk > 80).length;
  const elevatedZones = safeZones.filter((z) => z.risk > 60).length;
  const highestRiskZone = [...safeZones].sort((a, b) => b.risk - a.risk)[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full rounded-[2rem] bg-white/10 animate-pulse" />;
  }

  const routeLine: [number, number][] | null = destination
    ? [center, [destination.lat, destination.lon]]
    : null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-cyan-400/30 bg-slate-950 shadow-2xl shadow-cyan-950/60 ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 z-[410] bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.42)_100%)]" />

      {hoveredZone && (
        <div className="pointer-events-none absolute left-1/2 top-5 z-[900] -translate-x-1/2 rounded-2xl border border-cyan-300/20 bg-slate-950/95 px-5 py-3 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
            Hovered Zone
          </p>
          <h3 className="mt-1 text-base font-black">{hoveredZone.name}</h3>
          <p className="text-xs text-white/60">
            {getRiskLabel(hoveredZone.risk)} • Estimated {hoveredZone.risk}/100
          </p>
        </div>
      )}

      <div className="absolute left-14 top-4 z-[500] max-w-[240px] rounded-2xl border border-cyan-400/20 bg-slate-950/90 px-5 py-4 text-white backdrop-blur-xl shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
          Flood Intelligence
        </p>
        <h3 className="mt-1 text-base font-black">Lagos Risk Map</h3>
        <p className="mt-1 text-xs text-white/50">
          {safeZones.length} monitored zones • {elevatedZones} elevated
        </p>

        {highestRiskZone && (
          <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-200/60">
              Highest Alert
            </p>
            <p className="mt-1 text-sm font-bold">{highestRiskZone.name}</p>
            <p className="text-xs text-white/50">
              Risk score {highestRiskZone.risk}/100
            </p>
          </div>
        )}
      </div>

      <div className="absolute right-4 top-4 z-[500] rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white backdrop-blur-xl shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          Signal
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          <span className="text-sm font-bold">Live Monitoring</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white backdrop-blur-xl shadow-2xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
          Risk Scale
        </p>
        <div className="space-y-2 text-xs">
          <Legend color="bg-red-500" label="Severe" />
          <Legend color="bg-orange-500" label="Rising" />
          <Legend color="bg-yellow-400" label="Watch" />
          <Legend color="bg-green-500" label="Low" />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[500] rounded-2xl border border-red-400/20 bg-red-950/70 px-4 py-3 text-white backdrop-blur-xl shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.25em] text-red-200/60">
          Severe Zones
        </p>
        <p className="mt-1 text-2xl font-black">{severeZones}</p>
      </div>

      <MapContainer center={center} zoom={10} scrollWheelZoom className="h-full w-full" zoomControl>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <CircleMarker
  center={center}
  radius={9}
  pathOptions={{
    color: "#ffffff",
    fillColor: "#38bdf8",
    fillOpacity: 1,
    weight: 3,
    opacity: 1,
  }}
>
  <Popup>
    <div className="space-y-1 text-sm">
      <strong>You are here</strong>
      <p>Current detected position</p>
    </div>
  </Popup>
</CircleMarker>

       {destination && (
  <CircleMarker
    center={[destination.lat, destination.lon]}
    radius={9}
    pathOptions={{
      color: "#ffffff",
      fillColor: "#818cf8",
      fillOpacity: 1,
      weight: 3,
      opacity: 1,
    }}
  >
    <Popup>
      <div className="space-y-1 text-sm">
        <strong>{destination.name}</strong>
        <p>Selected destination</p>
      </div>
    </Popup>
  </CircleMarker>
)}

        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#38bdf8",
              weight: 6,
              opacity: 0.95,
            }}
          />
        )}

        {safeZones.map((zone, i) => {
          const color = getRiskColor(zone.risk);
          const key = `${zone.name}-${zone.lat}-${zone.lon}-${i}`;

          return (
            <Fragment key={key}>
              {zone.risk > 60 && (
                <Circle
                  center={[zone.lat, zone.lon]}
                  radius={getRadius(zone.risk) + 500}
                  interactive={false}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.1,
                    weight: 1,
                    opacity: 0.35,
                  }}
                />
              )}

              <Circle
                center={[zone.lat, zone.lon]}
                radius={getRadius(zone.risk)}
                eventHandlers={{
                  mouseover: () => setHoveredZone(zone),
                  mouseout: () => setHoveredZone(null),
                }}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: zone.risk > 70 ? 0.58 : 0.35,
                  weight: zone.risk > 70 ? 5 : 3,
                  opacity: 0.95,
                }}
              >
                <Popup>
                  <div className="space-y-2 text-sm">
                    <strong>{zone.name}</strong>
                    <p>{getRiskLabel(zone.risk)}</p>
                    <p>Risk Score: {zone.risk}/100</p>
                    <p>
                      {zone.risk > 70
                        ? "Avoid this area during rainfall or rising water conditions."
                        : "Monitor this area if rainfall increases."}
                    </p>
                  </div>
                </Popup>
              </Circle>

              <CircleMarker
                center={[zone.lat, zone.lon]}
                radius={12}
                eventHandlers={{
                  mouseover: () => setHoveredZone(zone),
                  mouseout: () => setHoveredZone(null),
                }}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: color,
                  fillOpacity: 1,
                  weight: 2,
                  opacity: 1,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <strong>{zone.name}</strong>
                    <p>{getRiskLabel(zone.risk)}</p>
                    <p>Score: {zone.risk}/100</p>
                  </div>
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-white/70">{label}</span>
    </div>
  );
}