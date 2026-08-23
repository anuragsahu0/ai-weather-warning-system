import { useQuery } from '@tanstack/react-query';
import { fetchSourcesStatus } from '../services/fusionApi.js';

export function useSourcesStatus() {
  const query = useQuery({
    queryKey: ['weather-sources-status'],
    queryFn: fetchSourcesStatus,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    sourcesData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
