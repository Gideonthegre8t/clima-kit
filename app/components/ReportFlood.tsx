"use client";

import { useState } from "react";

type Props = {
  coords: { lat: number; lon: number };
  onClose: () => void;
  onSubmitted: () => void;
};

export default function ReportFlood({
  coords,
  onClose,
  onSubmitted,
}: Props) {
  const [area, setArea] = useState("");
  const [severity, setSeverity] = useState<"LOW" | "MODERATE" | "HIGH">("HIGH");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

 async function submitReport() {
  if (!area.trim()) {
    alert("Please enter the flooded area name.");
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      area,
      severity,
      note,
      lat: coords.lat,
      lon: coords.lon,
    };

    console.log("Submitting flood report:", payload);

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { error: text };
    }

    console.log("Report response:", result);

    if (!res.ok) {
      alert(result.error || "Failed to submit flood report.");
      return;
    }

    alert("Flood report submitted successfully.");

   onSubmitted();
onClose();
  } catch (err: any) {
    console.error("Submit report failed:", err);
    alert(err.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              Community Report
            </p>
            <h3 className="mt-2 text-2xl font-black">Report Flood</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Area name e.g. Ajah, Lekki Phase 1"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm outline-none placeholder:text-white/30"
          />

          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value as "LOW" | "MODERATE" | "HIGH")
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm outline-none"
          >
            <option value="HIGH">High flooding</option>
            <option value="MODERATE">Moderate flooding</option>
            <option value="LOW">Low flooding</option>
          </select>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is happening there?"
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm outline-none placeholder:text-white/30"
          />

          <button
            onClick={submitReport}
            disabled={submitting}
            className="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-bold transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Flood Report"}
          </button>
        </div>
      </div>
    </div>
  );
}