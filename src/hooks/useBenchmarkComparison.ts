import { useQuery } from '@tanstack/react-query';
import { fetchBenchmarkComparison } from '../services/nowcastApi.js';

export function useBenchmarkComparison() {
  const query = useQuery({
    queryKey: ['spatiotemporal-benchmark-comparison'],
    queryFn: fetchBenchmarkComparison,
    staleTime: 60000,
  });

  return {
    comparison: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
