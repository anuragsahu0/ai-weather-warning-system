import { useQuery } from '@tanstack/react-query';
import {
  fetchSystemHealth,
  fetchDataQuality,
  fetchModelMetrics,
} from '../services/monitoringApi.js';

export function useSystemHealth() {
  const query = useQuery({
    queryKey: ['system-health-report'],
    queryFn: fetchSystemHealth,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  return {
    health: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDataQuality() {
  const query = useQuery({
    queryKey: ['data-quality-report'],
    queryFn: fetchDataQuality,
    refetchInterval: 20000,
    staleTime: 15000,
  });

  return {
    dataQuality: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useModelMetrics() {
  const query = useQuery({
    queryKey: ['model-metrics-report'],
    queryFn: fetchModelMetrics,
    staleTime: 60000,
  });

  return {
    metricsData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
