import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/");

    const data = await res.json();

    return NextResponse.json({
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      accuracy: "medium",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "IP location failed" },
      { status: 500 }
    );
  }
}