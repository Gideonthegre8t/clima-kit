export function calculateFloodRisk({
  rainfall,
  drainageDensity,
  elevation,
  roadCondition,
}: {
  rainfall: number;
  drainageDensity: number;
  elevation: number;
  roadCondition: number;
}) {
  let score = 0;

  score += rainfall * 0.4;
  score += drainageDensity * 0.25;
  score += (100 - elevation) * 0.2;
  score += roadCondition * 0.15;

  return Math.min(Math.round(score), 100);
}