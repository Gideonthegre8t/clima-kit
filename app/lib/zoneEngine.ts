export function cleanZone(zone: any) {
  if (typeof zone === "string") {
    return {
      name: zone || "Your Location",
      score: 50,
      level: "LOW",
    };
  }

  return {
    name: zone?.name ?? "Your Location",
    score: zone?.score ?? 50,
    level: zone?.score > 70 ? "HIGH" : zone?.score > 40 ? "MODERATE" : "LOW",
  };
}