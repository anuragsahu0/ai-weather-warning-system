import { useQuery } from '@tanstack/react-query';
import { fetchSpatioTemporalNowcast } from '../services/nowcastApi.js';
import { useLocation } from '../context/LocationContext.js';

export function useSpatioTemporalNowcast(horizon = 30) {
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [
      'spatiotemporal-nowcast',
      currentLocation.gridId,
      currentLocation.coordinates.latitude,
      currentLocation.coordinates.longitude,
      horizon,
    ],
    queryFn: () =>
      fetchSpatioTemporalNowcast(
        currentLocation.gridId,
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        horizon
      ),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    nowcast: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
