// Helper to clamp values between 0 and 1
const normalize = (val, min, max) => Math.max(0, Math.min(1, (val - min) / (max - min)));

export const calculateRiskScore = (item) => {
  const asteroid = item.data ? item.data : item;
  let score = 0;

  // 1. Hazardous flag (50 points)
  if (asteroid.isHazardous || asteroid.is_potentially_hazardous_asteroid) {
    score += 50;
  }

  // 2. Diameter (20 points)
  // We'll lower the min range to 10m so small asteroids still get some "size points"
  let diameter = parseFloat(asteroid.realSizeMeters) || 0;
  const diameterScore = normalize(diameter, 10, 1000) * 20; 
  score += diameterScore;

  // 3. Miss distance (30 points)
  let missKm = 0;
  if (asteroid.distToEarth) {
    // Correctly parsing "53.17M KM"
    missKm = parseFloat(asteroid.distToEarth.replace(/[^\d.]/g, '')) * 1000000;
  }

  /**
   * ADJUSTED LOGIC:
   * We increase the 'Safe Zone' to 75 Million KM (approx 0.5 AU) 
   * so that 53M KM doesn't immediately result in a 0 score.
   */
  const safeDistance = 75000000; 
  const missScore = (1 - normalize(missKm, 0, safeDistance)) * 30;
  score += missScore;

  return Math.max(5, Math.round(score)); // Minimum 5% risk so it never looks "empty"
};

// 🚨 ENSURE THIS 'export' IS HERE
export const getStatus = (score) => {
  if (score > 70) return { label: 'High Risk', color: 'text-red-500', border: 'border-red-500' };
  if (score > 40) return { label: 'Moderate', color: 'text-yellow-400', border: 'border-yellow-400' };
  return { label: 'Low Risk', color: 'text-green-400', border: 'border-green-400' };
};