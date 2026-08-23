import { RawHistoricalTimeSeries, NormalizedHistoricalObservation } from './types.js';
import { gridEngine } from '../geospatial/gridEngine.js';

export class TemporalAligner {
  alignAndNormalize(
    raw: RawHistoricalTimeSeries,
    resolution = 0.01
  ): NormalizedHistoricalObservation[] {
    const times = raw.hourly.time;
    const gridCell = gridEngine.getGridCell(raw.latitude, raw.longitude, resolution);

    const records: NormalizedHistoricalObservation[] = [];

    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      const isoUtc = timeStr.endsWith('Z') ? timeStr : `${timeStr}:00.000Z`;

      const temp = raw.hourly.temperature_2m?.[i] ?? null;
      const feels = raw.hourly.apparent_temperature?.[i] ?? null;
      const humidity = raw.hourly.relative_humidity_2m?.[i] ?? null;
      const pressure = raw.hourly.surface_pressure?.[i] ?? null;
      const windSpeed = raw.hourly.wind_speed_10m?.[i] ?? null;
      const windDirection = raw.hourly.wind_direction_10m?.[i] ?? null;
      const windGust = raw.hourly.wind_gusts_10m?.[i] ?? null;
      const rain = raw.hourly.rain?.[i] ?? raw.hourly.precipitation?.[i] ?? null;
      const cloudCover = raw.hourly.cloud_cover?.[i] ?? null;
      const weatherCode = raw.hourly.weather_code?.[i] ?? null;

      // Quality Flagging
      let qualityFlag: 'VALID' | 'SUSPECT' | 'INVALID' = 'VALID';
      if (temp !== null && (temp < -60 || temp > 60)) qualityFlag = 'SUSPECT';
      if (pressure !== null && (pressure < 850 || pressure > 1090)) qualityFlag = 'SUSPECT';
      if (humidity !== null && (humidity < 0 || humidity > 100)) qualityFlag = 'INVALID';

      const condition = this.mapWeatherCode(weatherCode);

      const record: NormalizedHistoricalObservation = {
        id: `hist-${gridCell.gridCode}-${new Date(isoUtc).getTime()}`,
        latitude: raw.latitude,
        longitude: raw.longitude,
        gridId: gridCell.id,
        gridCode: gridCell.gridCode,
        observedAt: isoUtc,
        temperature: temp !== null ? Number(temp.toFixed(1)) : null,
        feelsLike: feels !== null ? Number(feels.toFixed(1)) : null,
        humidity: humidity !== null ? Math.round(humidity) : null,
        pressure: pressure !== null ? Number(pressure.toFixed(1)) : null,
        windSpeed: windSpeed !== null ? Number(windSpeed.toFixed(1)) : null,
        windDirection: windDirection !== null ? Math.round(windDirection) : null,
        windGust: windGust !== null ? Number(windGust.toFixed(1)) : null,
        rainfall: rain !== null ? Number(rain.toFixed(2)) : null,
        precipitationRate: rain !== null ? Number(rain.toFixed(2)) : null,
        cloudCover: cloudCover !== null ? Math.round(cloudCover) : null,
        weatherCondition: condition,
        weatherCode,
        qualityFlag,
        imputationFlag: 'OBSERVED',
      };

      records.push(record);
    }

    // Guarantee strict ascending chronological ordering
    records.sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

    return records;
  }

  private mapWeatherCode(code: number | null): string {
    if (code === null) return 'Atmospheric Observation';
    switch (code) {
      case 0:
        return 'Clear Sky';
      case 1:
        return 'Mainly Clear';
      case 2:
        return 'Partly Cloudy';
      case 3:
        return 'Overcast';
      case 51:
      case 53:
      case 55:
        return 'Drizzle';
      case 61:
      case 63:
        return 'Rain';
      case 65:
        return 'Heavy Rain / Cloudburst Potential';
      case 80:
      case 81:
      case 82:
        return 'Rain Showers';
      case 95:
      case 96:
      case 99:
        return 'Thunderstorm with Convective Surge';
      default:
        return `WMO Code ${code}`;
    }
  }
}

export const temporalAligner = new TemporalAligner();
