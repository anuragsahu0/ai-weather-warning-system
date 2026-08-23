import { useQuery } from '@tanstack/react-query';
import { fetchCurrentWeather } from '../services/weatherApi.js';
import { useLocation } from '../context/LocationContext.js';

export function formatRelativeTime(isoTimestamp?: string | null): string {
  if (!isoTimestamp) return 'Awaiting data';
  try {
    const time = new Date(isoTimestamp).getTime();
    if (isNaN(time)) return 'Awaiting data';
    const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

    if (diffSeconds < 60) return 'Observed just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Observed ${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Observed ${diffHours} hr ago`;
    return `Observed on ${new Date(isoTimestamp).toLocaleDateString()}`;
  } catch {
    return 'Awaiting data';
  }
}

export function useCurrentWeather() {
  const { currentLocation } = useLocation();
  const { latitude, longitude } = currentLocation.coordinates;

  const query = useQuery({
    queryKey: ['current-weather', latitude, longitude, currentLocation.id],
    queryFn: () => fetchCurrentWeather(latitude, longitude, currentLocation.id),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 60000,
    retry: 2,
  });

  const weather = query.data;
  const isLive = weather?.dataFreshness === 'FRESH' || weather?.dataFreshness === 'RECENT';
  const freshnessLabel = formatRelativeTime(weather?.observedAt);

  return {
    ...query,
    weather,
    isLive,
    freshnessLabel,
    currentLocation,
  };
}
