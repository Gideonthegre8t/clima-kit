"use client";

import { useEffect } from "react";

type FloodZone = {
  name: string;
  distance: number;
  risk: number;
  riskLevel: string;
  lat: number;
  lon: number;
};

type Props = {
  rain?: number;
  onData?: (zones: FloodZone[]) => void;
};

const LAGOS_ZONES: FloodZone[] = [
  {
    name: "Lekki",
    distance: 2,
    risk: 82,
    riskLevel: "HIGH",
    lat: 6.4698,
    lon: 3.5852,
  },
  {
    name: "Ajah",
    distance: 4,
    risk: 78,
    riskLevel: "HIGH",
    lat: 6.4654,
    lon: 3.6015,
  },
  {
    name: "Victoria Island",
    distance: 3,
    risk: 65,
    riskLevel: "MODERATE",
    lat: 6.4281,
    lon: 3.4219,
  },
  {
    name: "Ikoyi",
    distance: 5,
    risk: 48,
    riskLevel: "MODERATE",
    lat: 6.4549,
    lon: 3.4246,
  },
  {
    name: "Yaba",
    distance: 6,
    risk: 40,
    riskLevel: "LOW",
    lat: 6.5095,
    lon: 3.3711,
  },
  {
    name: "Maryland",
    distance: 8,
    risk: 58,
    riskLevel: "MODERATE",
    lat: 6.5733,
    lon: 3.3755,
  },
];

export default function FloodInsights({
  rain = 0,
  onData,
}: Props) {
  useEffect(() => {
    const adjusted = LAGOS_ZONES.map((zone) => {
      let risk = zone.risk;

      // dynamic rainfall adjustment
      if (rain > 10) risk += 10;
      if (rain > 20) risk += 15;
      if (rain > 40) risk += 20;

      risk = Math.min(risk, 100);

      return {
        ...zone,
        risk,
        riskLevel:
          risk > 70
            ? "HIGH"
            : risk > 40
            ? "MODERATE"
            : "LOW",
      };
    });

    onData?.(adjusted);
  }, [rain, onData]);

  return null;
}