import { spatialQueries } from '../services/geospatial/spatialQueries.js';

export function runSpatialQueriesTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: findGridContaining
  try {
    const cell = spatialQueries.findGridContaining(28.6139, 77.209, 0.01);
    const isValid = cell.gridCode.startsWith('GRID_R01_') && cell.resolutionKm === 1.1;

    results.push({
      name: 'SpatialQueries: Correctly identifies containing grid cell',
      passed: isValid,
      error: cell.gridCode,
    });
  } catch (err: unknown) {
    results.push({
      name: 'SpatialQueries: Correctly identifies containing grid cell',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: findGridsInRadius
  try {
    const nearby = spatialQueries.findGridsInRadius({
      latitude: 28.6139,
      longitude: 77.209,
      radiusKm: 5,
      resolution: 0.01,
    });

    const isNearbyValid = nearby.length > 5 && nearby.length < 150;

    results.push({
      name: 'SpatialQueries: Retrieves radial grid cells sorted by distance',
      passed: isNearbyValid,
      error: `Found ${nearby.length} cells`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'SpatialQueries: Retrieves radial grid cells sorted by distance',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: findGridsInBoundingBox
  try {
    const bboxCells = spatialQueries.findGridsInBoundingBox({
      north: 28.65,
      south: 28.60,
      east: 77.25,
      west: 77.20,
      resolution: 0.01,
      limit: 100,
    });

    const isBBoxValid = bboxCells.length === 25; // 5x5 grid

    results.push({
      name: 'SpatialQueries: Generates exact bounding box grid cells',
      passed: isBBoxValid,
      error: `Generated ${bboxCells.length} cells instead of 25`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'SpatialQueries: Generates exact bounding box grid cells',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
