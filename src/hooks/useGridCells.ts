import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyGrids, fetchCurrentGrid } from '../services/gridApi.js';
import { useLocation } from '../context/LocationContext.js';
import { WeatherGridCell } from '@shared/types/index.js';

export function useGridCells(initialResolution = 0.01) {
  const { currentLocation } = useLocation();
  const { latitude, longitude } = currentLocation.coordinates;

  const [resolution, setResolution] = useState(initialResolution);
  const [selectedCell, setSelectedCell] = useState<WeatherGridCell | null>(null);

  // 1. Fetch current center cell with live weather
  const currentCellQuery = useQuery({
    queryKey: ['current-grid-cell', latitude, longitude, resolution],
    queryFn: () => fetchCurrentGrid(latitude, longitude, resolution),
    staleTime: 60000,
  });

  // 2. Fetch surrounding spatial cells (radius 15km)
  const nearbyGridsQuery = useQuery({
    queryKey: ['nearby-grid-cells', latitude, longitude, resolution],
    queryFn: () => fetchNearbyGrids(latitude, longitude, 15, resolution),
    staleTime: 60000,
  });

  const cells = nearbyGridsQuery.data?.cells || [];
  const currentCell = currentCellQuery.data || (cells.length > 0 ? cells[0] : null);

  const activeCell = selectedCell || currentCell;

  return {
    resolution,
    setResolution,
    cells,
    currentCell,
    selectedCell: activeCell,
    setSelectedCell,
    isLoading: nearbyGridsQuery.isLoading || currentCellQuery.isLoading,
    isError: nearbyGridsQuery.isError || currentCellQuery.isError,
    refetch: () => {
      currentCellQuery.refetch();
      nearbyGridsQuery.refetch();
    },
  };
}
