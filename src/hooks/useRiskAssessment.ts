import { useQuery } from '@tanstack/react-query';
import {
  fetchRiskAssessment,
  fetchRiskHotspots,
  fetchRiskOverview,
} from '../services/riskApi.js';
import { useLocation } from '../context/LocationContext.js';
import { HazardType } from '@shared/types/index.js';

export function useRiskAssessment(hazard: HazardType = 'HEAVY_RAIN', horizon = 30) {
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [
      'risk-assessment',
      hazard,
      horizon,
      currentLocation.gridId,
      currentLocation.coordinates.latitude,
      currentLocation.coordinates.longitude,
    ],
    queryFn: () =>
      fetchRiskAssessment(
        hazard,
        horizon,
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        currentLocation.gridId
      ),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    assessment: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useRiskHotspots(hazard: HazardType = 'HEAVY_RAIN', horizon = 30) {
  const query = useQuery({
    queryKey: ['risk-hotspots', hazard, horizon],
    queryFn: () => fetchRiskHotspots(hazard, horizon),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    hotspots: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useRiskOverview() {
  const query = useQuery({
    queryKey: ['risk-overview'],
    queryFn: fetchRiskOverview,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    overview: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
