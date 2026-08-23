import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demoApi } from '../services/demoApi.js';

export function useDemoControl() {
  const queryClient = useQueryClient();

  const scenariosQuery = useQuery({
    queryKey: ['demo-scenarios'],
    queryFn: () => demoApi.getScenarios(),
  });

  const stateQuery = useQuery({
    queryKey: ['demo-state'],
    queryFn: () => demoApi.getActiveState(),
    refetchInterval: 3000,
  });

  const lineageQuery = useQuery({
    queryKey: ['demo-lineage-trace'],
    queryFn: () => demoApi.getLineageTrace(),
  });

  const preflightQuery = useQuery({
    queryKey: ['demo-preflight'],
    queryFn: () => demoApi.getPreflightDiagnostics(),
  });

  const stepMutation = useMutation({
    mutationFn: ({ stepIndex, scenarioId }: { stepIndex: number; scenarioId?: string }) =>
      demoApi.stepReplay(stepIndex, scenarioId),
    onSuccess: (data) => {
      queryClient.setQueryData(['demo-state'], data);
      queryClient.invalidateQueries({ queryKey: ['demo-lineage-trace'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => demoApi.resetReplay(),
    onSuccess: (data) => {
      queryClient.setQueryData(['demo-state'], data);
      queryClient.invalidateQueries({ queryKey: ['demo-lineage-trace'] });
    },
  });

  return {
    scenarios: scenariosQuery.data || [],
    isLoadingScenarios: scenariosQuery.isLoading,
    activeState: stateQuery.data,
    isLoadingState: stateQuery.isLoading,
    lineageTrace: lineageQuery.data,
    isLoadingLineage: lineageQuery.isLoading,
    preflight: preflightQuery.data,
    isLoadingPreflight: preflightQuery.isLoading,
    stepReplay: stepMutation.mutateAsync,
    isStepping: stepMutation.isPending,
    resetReplay: resetMutation.mutateAsync,
    isResetting: resetMutation.isPending,
    refetchState: stateQuery.refetch,
  };
}
