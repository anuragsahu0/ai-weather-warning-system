import { gridEngine } from '../services/geospatial/gridEngine.js';

export function runGridEngineTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Coordinate Validation
  try {
    let errorCaught = false;
    try {
      gridEngine.validateCoordinates(95, 77); // Invalid latitude
    } catch {
      errorCaught = true;
    }

    results.push({
      name: 'GridEngine: Validates latitude and rejects > 90°',
      passed: errorCaught,
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridEngine: Validates latitude and rejects > 90°',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Grid Code Determinism
  try {
    const lat = 28.6139;
    const lon = 77.209;
    const code1 = gridEngine.generateGridCode(lat, lon, 0.01);
    const code2 = gridEngine.generateGridCode(lat, lon, 0.01);

    results.push({
      name: 'GridEngine: Guaranteed deterministic grid code generation',
      passed: code1 === code2 && code1 === 'GRID_R01_N2861_E07720',
      error: `Generated: ${code1}`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridEngine: Guaranteed deterministic grid code generation',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Grid Boundaries & Center Calculation
  try {
    const cell = gridEngine.getGridCell(28.6139, 77.209, 0.01);
    const hasValidBounds =
      cell.bounds.south === 28.61 &&
      cell.bounds.north === 28.62 &&
      cell.bounds.west === 77.2 &&
      cell.bounds.east === 77.21 &&
      cell.center.latitude === 28.615 &&
      cell.center.longitude === 77.205;

    results.push({
      name: 'GridEngine: Computes exact bounding box and center coordinate',
      passed: hasValidBounds,
      error: JSON.stringify(cell),
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridEngine: Computes exact bounding box and center coordinate',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 4: Distance calculation (Haversine)
  try {
    // Exact great-circle distance between Delhi (28.6139, 77.209) and Mumbai (18.922, 72.8347) is ~ 1165.7km
    const dist = gridEngine.calculateDistanceKm(
      { latitude: 28.6139, longitude: 77.209 },
      { latitude: 18.922, longitude: 72.8347 }
    );

    const isAccurate = dist > 1150 && dist < 1180;

    results.push({
      name: 'GridEngine: Accurately computes Haversine geodesic distance in km',
      passed: isAccurate,
      error: `Computed distance: ${dist} km`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridEngine: Accurately computes Haversine geodesic distance in km',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
