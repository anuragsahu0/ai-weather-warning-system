import { useQuery } from '@tanstack/react-query';
import { fetchBaselineNowcast, fetchMLStatus } from '../services/nowcastApi.js';
import { useLocation } from '../context/LocationContext.js';
import { PredictionTaskType } from '@shared/types/index.js';

export function useNowcastPrediction(task: PredictionTaskType = 'HEAVY_RAIN', horizon = 30) {
  const { currentLocation } = useLocation();

  const predictionQuery = useQuery({
    queryKey: [
      'nowcast-baseline-prediction',
      currentLocation.gridId,
      currentLocation.coordinates.latitude,
      currentLocation.coordinates.longitude,
      task,
      horizon,
    ],
    queryFn: () =>
      fetchBaselineNowcast(
        currentLocation.gridId,
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        task,
        horizon
      ),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const mlStatusQuery = useQuery({
    queryKey: ['ml-microservice-status'],
    queryFn: fetchMLStatus,
    staleTime: 60000,
  });

  return {
    prediction: predictionQuery.data,
    mlStatus: mlStatusQuery.data,
    isLoading: predictionQuery.isLoading,
    isError: predictionQuery.isError,
    refetch: predictionQuery.refetch,
  };
}
