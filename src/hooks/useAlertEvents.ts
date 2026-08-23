import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAlerts, fetchAlertById, triggerAlertEvaluation } from '../services/notificationApi.js';

export function useAlertEvents(status?: string, hazard?: string, gridId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alert-events', status, hazard, gridId],
    queryFn: () => fetchAlerts(status, hazard, gridId),
    refetchInterval: 20000,
    staleTime: 10000,
  });

  const evaluateMutation = useMutation({
    mutationFn: (params: { lat?: number; lon?: number; hazard?: string; horizon?: number }) =>
      triggerAlertEvaluation(params.lat, params.lon, params.hazard, params.horizon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    alerts: query.data?.alerts || [],
    isLoading: query.isLoading,
    isError: query.isError,
    evaluateAndTrigger: evaluateMutation.mutateAsync,
    refetch: query.refetch,
  };
}

export function useAlertDetail(alertId?: string) {
  const query = useQuery({
    queryKey: ['alert-detail', alertId],
    queryFn: () => (alertId ? fetchAlertById(alertId) : null),
    enabled: Boolean(alertId),
    staleTime: 30000,
  });

  return {
    alert: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
