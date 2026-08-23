import { useQuery } from '@tanstack/react-query';
import {
  fetchDatasets,
  fetchQualityReport,
  fetchFeatures,
} from '../services/datasetApi.js';

export function useDatasetAnalytics() {
  const datasetsQuery = useQuery({
    queryKey: ['datasets-list'],
    queryFn: fetchDatasets,
    staleTime: 60000,
  });

  const qualityReportQuery = useQuery({
    queryKey: ['dataset-quality-report'],
    queryFn: () => fetchQualityReport(),
    staleTime: 60000,
  });

  const featuresQuery = useQuery({
    queryKey: ['dataset-sample-features'],
    queryFn: () => fetchFeatures(undefined, undefined, undefined, 20),
    staleTime: 60000,
  });

  return {
    datasets: datasetsQuery.data || [],
    qualityReport: qualityReportQuery.data,
    features: featuresQuery.data?.features || [],
    totalFeatures: featuresQuery.data?.total || 0,
    isLoading: datasetsQuery.isLoading || qualityReportQuery.isLoading,
    isError: datasetsQuery.isError || qualityReportQuery.isError,
  };
}
