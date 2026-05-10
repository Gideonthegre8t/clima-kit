export function computeFloodRisk(distanceToWater: number, rain: number) {
  let score = 0;

  score += Math.max(0, 100 - distanceToWater * 50);
  score += (rain ?? 0) * 1.2;

  score = Math.min(100, Math.max(0, score));

  if (score > 75) {
    return {
      label: "🔴 HIGH RISK",
      level: "Dangerous conditions",
      message: "Flood risk is very high. Avoid movement.",
      score,
      color: "border-red-500 bg-red-500/10",
    };
  }

  if (score > 45) {
    return {
      label: "🟠 MODERATE RISK",
      level: "Unstable conditions",
      message: "Stay alert and avoid low areas.",
      score,
      color: "border-yellow-500 bg-yellow-500/10",
    };
  }

  return {
    label: "🟢 SAFE",
    level: "Stable conditions",
    message: "No immediate flood risk detected.",
    score,
    color: "border-green-500 bg-green-500/10",
  };
}