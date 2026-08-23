import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
} from 'lucide-react';
import { WeatherMetricCard } from './WeatherMetricCard.js';
import { useCurrentWeather } from '../../hooks/useCurrentWeather.js';

export function TelemetryGrid() {
  const { weather, isLive, freshnessLabel } = useCurrentWeather();

  const status = isLive ? 'LIVE' : 'AWAITING_DATA';

  // Format wind heading label if degree is provided
  const windHeadingText = weather?.windDirection != null ? `${weather.windDirection}° Azimuth` : 'Anemometer Vector';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Ambient Temperature */}
      <WeatherMetricCard
        title="Ambient Temperature"
        value={weather?.temperature ?? null}
        unit="°C"
        icon={Thermometer}
        status={status}
        observationTime={freshnessLabel}
        description={weather?.feelsLike != null ? `Feels like ${weather.feelsLike}°C` : 'AWS Thermistor'}
      />

      {/* 2. Relative Humidity */}
      <WeatherMetricCard
        title="Relative Humidity"
        value={weather?.humidity ?? null}
        unit="%"
        icon={Droplets}
        status={status}
        observationTime={freshnessLabel}
        description={weather?.cloudCover != null ? `Cloud cover: ${weather.cloudCover}%` : 'Hygrometer Ingest'}
      />

      {/* 3. Wind Velocity & Heading */}
      <WeatherMetricCard
        title="Wind Velocity"
        value={weather?.windSpeed ?? null}
        unit="km/h"
        icon={Wind}
        status={status}
        observationTime={freshnessLabel}
        description={weather?.windGust != null ? `Gust: ${weather.windGust} km/h` : windHeadingText}
      />

      {/* 4. Barometric Pressure */}
      <WeatherMetricCard
        title="Barometric Pressure"
        value={weather?.pressure ?? null}
        unit="hPa"
        icon={Gauge}
        status={status}
        observationTime={freshnessLabel}
        description="Surface QNH Barometer"
      />

      {/* 5. Precipitation Rate */}
      <WeatherMetricCard
        title="Precipitation Rate"
        value={weather?.precipitationRate ?? weather?.rainfall ?? null}
        unit="mm/h"
        icon={CloudRain}
        status={status}
        observationTime={freshnessLabel}
        description={weather?.weatherCondition ?? 'Doppler QPE Rain Gauge'}
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
