import { useQuery } from '@tanstack/react-query';
import { fetchFusedWeather } from '../services/fusionApi.js';
import { useLocation } from '../context/LocationContext.js';

export function useFusedWeather() {
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [
      'fused-weather',
      currentLocation.gridId,
      currentLocation.coordinates.latitude,
      currentLocation.coordinates.longitude,
    ],
    queryFn: () =>
      fetchFusedWeather(
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        currentLocation.gridId
      ),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    fusedData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
