import { useQuery } from '@tanstack/react-query';
import { fetchMLEvaluation } from '../services/nowcastApi.js';

export function useModelEvaluation() {
  const evaluationQuery = useQuery({
    queryKey: ['ml-model-evaluations'],
    queryFn: fetchMLEvaluation,
    staleTime: 60000,
  });

  return {
    models: evaluationQuery.data?.models || [],
    totalModels: evaluationQuery.data?.totalModels || 0,
    isLoading: evaluationQuery.isLoading,
    isError: evaluationQuery.isError,
  };
}
