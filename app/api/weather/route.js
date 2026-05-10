import { NextResponse } from "next/server";
import { cleanZone } from "@/app/lib/zoneEngine";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat") || "6.5244";
    const lon = searchParams.get("lon") || "3.3792";

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m&hourly=precipitation,precipitation_probability&past_days=1&forecast_days=1&timezone=auto`,
      { cache: "no-store" }
    );

    if (!weatherRes.ok) throw new Error("Weather API failed");

    const weatherData = await weatherRes.json();

    const current = weatherData?.current || {};
    const temp = current.temperature_2m ?? 0;
    const currentRain = current.precipitation ?? 0;
    const wind = current.wind_speed_10m ?? 0;

    const times = weatherData?.hourly?.time || [];
    const rainValues = weatherData?.hourly?.precipitation || [];

    const now = new Date();

    const recentRain = times.reduce((sum, time, index) => {
      const hourTime = new Date(time);
      const diffHours = (now.getTime() - hourTime.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 0 && diffHours <= 6) {
        return sum + (Number(rainValues[index]) || 0);
      }

      return sum;
    }, 0);

    let location = "Your Location";

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "climakit-app/1.0",
          },
          cache: "no-store",
        }
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const address = geoData?.address || {};

        location =
          address.suburb ||
          address.neighbourhood ||
          address.quarter ||
          address.city_district ||
          address.village ||
          address.road ||
          address.town ||
          address.city ||
          geoData?.display_name?.split(",")[0] ||
          "Your Location";
      }
    } catch {
      console.log("Geo failed");
    }

    const cleanedZone = cleanZone(location);

    return NextResponse.json({
      temp,
      rain: currentRain,
      recentRain: Number(recentRain.toFixed(1)),
      wind,
      location: cleanedZone.name,
      zoneScore: cleanedZone.score,
      zoneLevel: cleanedZone.level,
      rawLocation: location,
      source: "Open-Meteo",
    });
  } catch (err) {
    console.error("Weather route error:", err);

    return NextResponse.json(
      { error: "Weather fetch failed" },
      { status: 500 }
    );
  }
}