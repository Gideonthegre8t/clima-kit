import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Missing Supabase environment variables" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("flood_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET reports error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Missing Supabase environment variables" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const body = await req.json();

  console.log("Incoming report body:", body);

  const { data, error } = await supabase
    .from("flood_reports")
    .insert({
      area: body.area,
      note: body.note || "",
      severity: body.severity,
      lat: Number(body.lat),
      lon: Number(body.lon),
    })
    .select()
    .single();

  if (error) {
    console.error("POST report error:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}