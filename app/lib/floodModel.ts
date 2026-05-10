export type LagosZone = {
  name: string;
  lat: number;
  lon: number;
  baseRisk: number; // historical estimated risk
};

export const LAGOS_FLOOD_ZONES: LagosZone[] = [
  { name: "Lekki Phase 1", lat: 6.4474, lon: 3.4753, baseRisk: 88 },
  { name: "Ajah", lat: 6.4698, lon: 3.5852, baseRisk: 90 },
  { name: "Chevron Drive", lat: 6.4392, lon: 3.5353, baseRisk: 84 },
  { name: "Victoria Island", lat: 6.4281, lon: 3.4219, baseRisk: 78 },
  { name: "Ikoyi", lat: 6.4523, lon: 3.4356, baseRisk: 72 },

  { name: "Agungi", lat: 6.4453, lon: 3.5308, baseRisk: 86 },
  { name: "Ikate Elegushi", lat: 6.4287, lon: 3.5028, baseRisk: 82 },
  { name: "Ikota", lat: 6.4567, lon: 3.5445, baseRisk: 80 },
  { name: "Ado Badore", lat: 6.4911, lon: 3.6069, baseRisk: 84 },

  { name: "Banana Island", lat: 6.4632, lon: 3.4558, baseRisk: 74 },
  { name: "Parkview Estate", lat: 6.4609, lon: 3.4381, baseRisk: 70 },
  { name: "Osborne Foreshore", lat: 6.4663, lon: 3.4167, baseRisk: 69 },

  { name: "Yaba", lat: 6.5095, lon: 3.3711, baseRisk: 66 },
  { name: "Surulere", lat: 6.5000, lon: 3.3500, baseRisk: 63 },
  { name: "Ikeja", lat: 6.6018, lon: 3.3515, baseRisk: 58 },

  { name: "Oworonshoki", lat: 6.5472, lon: 3.3997, baseRisk: 80 },
  { name: "Bariga", lat: 6.5350, lon: 3.3890, baseRisk: 72 },
  { name: "Maryland", lat: 6.5733, lon: 3.3755, baseRisk: 64 },

  { name: "Ajegunle", lat: 6.4550, lon: 3.3352, baseRisk: 82 },
  { name: "Makoko", lat: 6.4961, lon: 3.3881, baseRisk: 78 },

  { name: "Ikorodu Coastline", lat: 6.6194, lon: 3.5105, baseRisk: 83 },
  { name: "Majidun Ikorodu", lat: 6.6206, lon: 3.5087, baseRisk: 85 },

  { name: "Badagry", lat: 6.4150, lon: 2.8813, baseRisk: 72 },
  { name: "Epe", lat: 6.5841, lon: 3.9834, baseRisk: 70 },

  { name: "Apapa", lat: 6.4488, lon: 3.3590, baseRisk: 74 },
  { name: "Festac", lat: 6.4696, lon: 3.2823, baseRisk: 68 },
  { name: "Amuwo Odofin", lat: 6.4612, lon: 3.2955, baseRisk: 66 },

  { name: "Mile 2", lat: 6.4654, lon: 3.3176, baseRisk: 70 },
  { name: "Ogudu", lat: 6.5780, lon: 3.3900, baseRisk: 61 },
  { name: "Alapere", lat: 6.5990, lon: 3.3912, baseRisk: 60 },
];