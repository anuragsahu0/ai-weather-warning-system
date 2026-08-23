import {
  FusedGridWeatherState,
  FusionLineage,
  WeatherSourceType,
} from '../../../../shared/types/index.js';
import { observationProvider } from '../providers/observationProvider.js';
import { radarProvider } from '../providers/radarProvider.js';
import { satelliteProvider } from '../providers/satelliteProvider.js';
import { lightningProvider } from '../providers/lightningProvider.js';
import { nwpProvider } from '../providers/nwpProvider.js';
import { spatialAligner } from './spatialAligner.js';
import { qualityController } from './qualityController.js';
import { prisma } from '../../config/db.js';

export class WeatherFusionService {
  private fusionVersion = 'fusion-v1.0';

  async fuseWeatherForGrid(
    lat = 28.6139,
    lon = 77.209,
    gridId = 'GRID_R01_N2861_E07720'
  ): Promise<{ fusedState: FusedGridWeatherState; lineages: FusionLineage[] }> {
    const nowIso = new Date().toISOString();
    const cell = spatialAligner.mapPointToGrid(lat, lon);
    const resolvedGridId = gridId || cell.id;
    const resolvedGridCode = cell.gridCode || resolvedGridId;

    // 1. Fetch from all active provider adapters concurrently
    const [obsRes, radarRes, satRes, ltgRes, nwpRes] = await Promise.all([
      observationProvider.fetchData(lat, lon, resolvedGridId),
      radarProvider.fetchData(lat, lon, resolvedGridId),
      satelliteProvider.fetchData(lat, lon, resolvedGridId),
      lightningProvider.fetchData(lat, lon, resolvedGridId),
      nwpProvider.fetchData(lat, lon, resolvedGridId),
    ]);

    // 2. Perform Quality Checks on Telemetry
    const obsQuality = qualityController.evaluateSurfaceMetrics({
      temperature: obsRes.data?.temperature,
      humidity: obsRes.data?.humidity,
      pressure: obsRes.data?.pressure,
      windSpeed: obsRes.data?.windSpeed,
      rainfallRate: obsRes.data?.rainfallRate,
      freshnessSeconds: obsRes.freshnessSeconds,
    });

    const lineages: FusionLineage[] = [];
    const fusedStateId = `fused-${Date.now().toString(36)}`;

    // 3. FUSE RAINFALL (Radar QPE 60% + Surface Gauge 30% + NWP Model 10%)
    const radarRain = radarRes.data ? Math.max(0, (radarRes.data.value / 200) ** (1 / 1.6)) : 0.0;
    const stationRain = obsRes.data?.rainfallRate ?? 0.0;
    const nwpRain = nwpRes.data?.precipitationRate ?? 0.0;

    let fusedRain = 0.0;
    let rainConflictReason = 'Standard multi-sensor quantitative precipitation estimate weighted fusion';

    if (Math.abs(radarRain - stationRain) > 15.0) {
      // Conflict: Heavy radar echo with lower surface gauge (e.g. virga or rapid storm onset)
      fusedRain = radarRain * 0.7 + stationRain * 0.3;
      rainConflictReason = `Disparity detected between Doppler radar QPE (${radarRain.toFixed(1)} mm/h) and surface gauge (${stationRain.toFixed(1)} mm/h). Prioritized upwind radar reflectivity echo.`;
    } else {
      fusedRain = radarRain * 0.6 + stationRain * 0.3 + nwpRain * 0.1;
    }
    fusedRain = Number(Math.max(0, fusedRain).toFixed(1));

    lineages.push({
      id: `lin-rain-${Date.now().toString(36)}`,
      fusedStateId,
      variableName: 'rainfallRate',
      selectedSourceId: radarRes.success ? radarRes.sourceId : obsRes.sourceId,
      contributingSources: [
        { sourceId: radarRes.sourceId, provider: radarRes.sourceType, rawValue: Number(radarRain.toFixed(1)), weight: 0.6 },
        { sourceId: obsRes.sourceId, provider: obsRes.sourceType, rawValue: stationRain, weight: 0.3 },
        { sourceId: nwpRes.sourceId, provider: nwpRes.sourceType, rawValue: nwpRain, weight: 0.1 },
      ],
      conflictResolutionReason: rainConflictReason,
      timestamp: nowIso,
    });

    // 4. FUSE TEMPERATURE (Surface Station 85% + NWP Model 15%)
    const obsTemp = obsRes.data?.temperature ?? 28.0;
    const nwpTemp = nwpRes.data?.temperature ?? obsTemp;
    const fusedTemp = Number((obsTemp * 0.85 + nwpTemp * 0.15).toFixed(1));

    lineages.push({
      id: `lin-temp-${Date.now().toString(36)}`,
      fusedStateId,
      variableName: 'temperature',
      selectedSourceId: obsRes.sourceId,
      contributingSources: [
        { sourceId: obsRes.sourceId, provider: obsRes.sourceType, rawValue: obsTemp, weight: 0.85 },
        { sourceId: nwpRes.sourceId, provider: nwpRes.sourceType, rawValue: nwpTemp, weight: 0.15 },
      ],
      conflictResolutionReason: 'Calibrated surface in-situ thermometer weighted with boundary-layer NWP thermal grid',
      timestamp: nowIso,
    });

    // 5. FUSE WIND (Surface Anemometer 75% + NWP 25%)
    const obsWind = obsRes.data?.windSpeed ?? 12.0;
    const obsGust = obsRes.data?.windGust ?? obsWind;
    const nwpWind = nwpRes.data?.windSpeed ?? obsWind;
    const fusedWind = Number((obsWind * 0.75 + nwpWind * 0.25).toFixed(1));

    // 6. ASSEMBLE FUSED STATE
    const sourceMetadata: Array<{
      sourceId: string;
      sourceType: WeatherSourceType;
      provider: string;
      weight: number;
    }> = [
      { sourceId: obsRes.sourceId, sourceType: 'OBSERVATION', provider: obsRes.sourceType, weight: 0.40 },
      { sourceId: radarRes.sourceId, sourceType: 'RADAR', provider: radarRes.sourceType, weight: 0.30 },
      { sourceId: satRes.sourceId, sourceType: 'SATELLITE', provider: satRes.sourceType, weight: 0.10 },
      { sourceId: ltgRes.sourceId, sourceType: 'LIGHTNING', provider: ltgRes.sourceType, weight: 0.10 },
      { sourceId: nwpRes.sourceId, sourceType: 'NUMERICAL_MODEL', provider: nwpRes.sourceType, weight: 0.10 },
    ];

    const fusedState: FusedGridWeatherState = {
      id: fusedStateId,
      gridId: resolvedGridId,
      gridCode: resolvedGridCode,
      timestamp: nowIso,
      temperature: fusedTemp,
      humidity: obsRes.data?.humidity ?? 65,
      pressure: obsRes.data?.pressure ?? 1005.0,
      windSpeed: fusedWind,
      windGust: obsGust,
      windDirection: obsRes.data?.windDirection ?? 180,
      rainfall: fusedRain,
      precipitationRate: fusedRain,
      radarReflectivityDbz: radarRes.data?.value ?? null,
      satelliteCloudCover: satRes.data?.value ?? null,
      lightningStrikeDensity: ltgRes.data?.spatialDensityPerKm2 ?? null,
      nwpExpectedRain: nwpRes.data?.precipitationRate ?? null,
      dataQuality: obsQuality.quality,
      dataFreshnessSeconds: obsRes.freshnessSeconds,
      sourceMetadata,
      qualityMetadata: {
        overallReliabilityScore: obsQuality.reliabilityScore,
        conflictDetected: Math.abs(radarRain - stationRain) > 15.0,
        conflictResolutionReason: rainConflictReason,
      },
      fusionVersion: this.fusionVersion,
    };

    // 7. Persist to Database asynchronously
    this.persistFusedStateToDb(fusedState, lineages).catch(() => {});

    return { fusedState, lineages };
  }

  private async persistFusedStateToDb(
    state: FusedGridWeatherState,
    lineages: FusionLineage[]
  ): Promise<void> {
    try {
      const record = await prisma.fusedGridStateRecord.create({
        data: {
          id: state.id,
          gridId: state.gridId,
          timestamp: new Date(state.timestamp),
          temperature: state.temperature,
          humidity: state.humidity,
          pressure: state.pressure,
          windSpeed: state.windSpeed,
          windGust: state.windGust,
          windDirection: state.windDirection,
          rainfall: state.rainfall,
          precipitationRate: state.precipitationRate,
          radarReflectivityDbz: state.radarReflectivityDbz,
          satelliteCloudCover: state.satelliteCloudCover,
          lightningDensity: state.lightningStrikeDensity,
          dataQuality: state.dataQuality,
          freshnessSeconds: state.dataFreshnessSeconds,
          sourceMetadataJson: state.sourceMetadata as object,
          fusionVersion: state.fusionVersion,
        },
      });

      for (const lin of lineages) {
        await prisma.fusionLineageRecord.create({
          data: {
            id: lin.id,
            fusedStateId: record.id,
            variableName: lin.variableName,
            selectedSourceId: lin.selectedSourceId,
            contributingSourcesJson: lin.contributingSources as object,
            conflictResolutionReason: lin.conflictResolutionReason,
          },
        });
      }
    } catch {
      // Standby DB resilient catch
    }
  }
}

export const weatherFusionService = new WeatherFusionService();
