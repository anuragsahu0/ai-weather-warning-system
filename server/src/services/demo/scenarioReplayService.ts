import {
  HazardType,
  FusedGridWeatherState,
  SpatioTemporalPredictionResult,
  RiskAssessmentResult,
  RiskHotspotCluster,
  AlertEvent,
  NotificationRecord,
} from '../../../../shared/types/index.js';

export interface ReplayScenarioMetadata {
  scenarioId: string;
  name: string;
  description: string;
  source: string;
  dataPeriod: string;
  geographicArea: string;
  gridId: string;
  hazardType: HazardType;
  dataType: 'HISTORICAL_REANALYSIS_REPLAY' | 'SYNTHETIC_TEST_DATA';
  createdAt: string;
  totalSteps: number;
}

export interface ReplayTimeStepFrame {
  stepIndex: number;
  timeOffsetLabel: 'T+00' | 'T+10' | 'T+20' | 'T+30';
  timestamp: string;
  weatherRecordId: string;
  weatherState: FusedGridWeatherState;
  nowcast: SpatioTemporalPredictionResult;
  riskAssessment: RiskAssessmentResult;
  hotspots: RiskHotspotCluster[];
  alert?: AlertEvent;
  notifications: NotificationRecord[];
}

export class ScenarioReplayService {
  private scenarios: Map<string, { meta: ReplayScenarioMetadata; frames: ReplayTimeStepFrame[] }> = new Map();
  private activeScenarioId: string = 'SCENARIO_DELHI_CLOUDBURST_2024';
  private activeStepIndex: number = 0;
  private playbackState: 'STOPPED' | 'PLAYING' | 'PAUSED' = 'STOPPED';

  constructor() {
    this.initializeHistoricalScenarios();
  }

  private initializeHistoricalScenarios(): void {
    // Scenario 1: Delhi NCR Monsoon Convective Cloudburst
    const delhiMeta: ReplayScenarioMetadata = {
      scenarioId: 'SCENARIO_DELHI_CLOUDBURST_2024',
      name: 'Delhi NCR Severe Convective Cloudburst Replay',
      description: 'Historical high-resolution reanalysis of intense monsoon convective storm cell over South Delhi / NCR with localized precipitation exceeding 65 mm/h.',
      source: 'WMO GTS + IMD Radar Reanalysis Archive',
      dataPeriod: '2024-07-28T14:00:00Z to 2024-07-28T14:30:00Z',
      geographicArea: 'Delhi NCR (28.6139°N, 77.2090°E)',
      gridId: 'GRID_R01_N2861_E07720',
      hazardType: 'HEAVY_RAIN',
      dataType: 'HISTORICAL_REANALYSIS_REPLAY',
      createdAt: '2024-07-28T14:00:00.000Z',
      totalSteps: 4,
    };

    const delhiFrames: ReplayTimeStepFrame[] = [
      // Frame 0: T+00 (Initial Inception)
      {
        stepIndex: 0,
        timeOffsetLabel: 'T+00',
        timestamp: '2024-07-28T14:00:00.000Z',
        weatherRecordId: 'REC_DELHI_20240728_1400',
        weatherState: {
          id: 'FUSED_DELHI_1400',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          timestamp: '2024-07-28T14:00:00.000Z',
          temperature: 31.5,
          humidity: 84.0,
          pressure: 998.2,
          windSpeed: 22.0,
          windGust: 38.0,
          windDirection: 110,
          rainfall: 8.5,
          precipitationRate: 14.0,
          radarReflectivityDbz: 38.5,
          satelliteCloudCover: 88,
          lightningStrikeDensity: 4.2,
          nwpExpectedRain: 12.0,
          dataQuality: 'VALID',
          dataFreshnessSeconds: 120,
          sourceMetadata: [
            { sourceId: 'SRC_OBS_OPENMETEO_GTS', sourceType: 'OBSERVATION', provider: 'WMO GTS', weight: 0.3 },
            { sourceId: 'SRC_RADAR_RAINVIEWER_QPE', sourceType: 'RADAR', provider: 'RainViewer', weight: 0.6 },
            { sourceId: 'SRC_NWP_ECMWF_GFS', sourceType: 'NUMERICAL_MODEL', provider: 'ECMWF', weight: 0.1 },
          ],
          qualityMetadata: { overallReliabilityScore: 0.95, conflictDetected: false },
          fusionVersion: 'fusion-v1.0',
        },
        nowcast: {
          id: 'PRED_DELHI_1400',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          modelType: 'ConvLSTM',
          modelVersion: 'spatiotemporal-convlstm-v1',
          featureScalerVersion: 'scaler-v1.0',
          device: 'mps',
          generatedAt: '2024-07-28T14:00:05.000Z',
          inputSequenceLength: 6,
          inputSequenceEndTimestamp: '2024-07-28T14:00:00.000Z',
          dataFreshnessSeconds: 120,
          status: 'MODEL_READY',
          horizons: [
            {
              horizonMinutes: 10,
              forecastTimestamp: '2024-07-28T14:10:00.000Z',
              expectedRainfall: 22.4,
              rainfallConfidenceInterval: { lower: 18.2, upper: 26.8, confidenceLevel: 0.9 },
              expectedWindSpeed: 28.0,
              eventProbabilities: { heavyRain: 0.72, severeConvective: 0.55, galeWind: 0.3 },
              uncertaintyScore: 0.12,
              severity: 'MODERATE',
            },
            {
              horizonMinutes: 30,
              forecastTimestamp: '2024-07-28T14:30:00.000Z',
              expectedRainfall: 48.0,
              rainfallConfidenceInterval: { lower: 39.0, upper: 58.0, confidenceLevel: 0.9 },
              expectedWindSpeed: 38.0,
              eventProbabilities: { heavyRain: 0.88, severeConvective: 0.78, galeWind: 0.45 },
              uncertaintyScore: 0.16,
              severity: 'MODERATE',
            },
          ],
          spatialNeighborhood: { height: 5, width: 5, centerGridId: 'GRID_R01_N2861_E07720', neighborhoodCellsCount: 25 },
          explainability: {
            spatialRiskContributions: [],
            topTemporalFeatures: [],
            summary: 'Convective cell intensifying rapidly from south-east quadrant.',
          },
        },
        riskAssessment: {
          riskId: 'RISK_DELHI_1400',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          hazardType: 'HEAVY_RAIN',
          riskLevel: 'WATCH',
          riskScore: 38,
          modelProbability: 0.72,
          uncertaintyScore: 0.12,
          validFrom: '2024-07-28T14:00:00.000Z',
          validUntil: '2024-07-28T14:30:00.000Z',
          generatedAt: '2024-07-28T14:00:06.000Z',
          status: 'ACTIVE',
          dataQuality: 'VALID',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          explanation: {
            primaryDrivers: [
              { factorName: 'Radar Reflectivity (38.5 dBZ)', factorValue: 38.5, relativeContribution: 0.45, direction: 'INCREASES_RISK', explanationText: 'Moderate convective core detected' },
              { factorName: 'Model Convective Probability', factorValue: 0.72, relativeContribution: 0.4, direction: 'INCREASES_RISK', explanationText: 'High probability of localized intensification' },
            ],
            summary: 'Approaching convective rain band triggering WATCH state.',
          },
          timeline: [],
          disclaimer: 'ERROR 404 model assessment — Not an official weather warning.',
        },
        hotspots: [],
        notifications: [],
      },

      // Frame 1: T+10 (Intensification & Hotspot Formation)
      {
        stepIndex: 1,
        timeOffsetLabel: 'T+10',
        timestamp: '2024-07-28T14:10:00.000Z',
        weatherRecordId: 'REC_DELHI_20240728_1410',
        weatherState: {
          id: 'FUSED_DELHI_1410',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          timestamp: '2024-07-28T14:10:00.000Z',
          temperature: 28.2,
          humidity: 92.0,
          pressure: 994.8,
          windSpeed: 38.0,
          windGust: 52.0,
          windDirection: 125,
          rainfall: 24.0,
          precipitationRate: 36.5,
          radarReflectivityDbz: 46.8,
          satelliteCloudCover: 95,
          lightningStrikeDensity: 11.5,
          nwpExpectedRain: 18.0,
          dataQuality: 'VALID',
          dataFreshnessSeconds: 90,
          sourceMetadata: [
            { sourceId: 'SRC_OBS_OPENMETEO_GTS', sourceType: 'OBSERVATION', provider: 'WMO GTS', weight: 0.3 },
            { sourceId: 'SRC_RADAR_RAINVIEWER_QPE', sourceType: 'RADAR', provider: 'RainViewer', weight: 0.6 },
            { sourceId: 'SRC_NWP_ECMWF_GFS', sourceType: 'NUMERICAL_MODEL', provider: 'ECMWF', weight: 0.1 },
          ],
          qualityMetadata: { overallReliabilityScore: 0.96, conflictDetected: false },
          fusionVersion: 'fusion-v1.0',
        },
        nowcast: {
          id: 'PRED_DELHI_1410',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          modelType: 'ConvLSTM',
          modelVersion: 'spatiotemporal-convlstm-v1',
          featureScalerVersion: 'scaler-v1.0',
          device: 'mps',
          generatedAt: '2024-07-28T14:10:05.000Z',
          inputSequenceLength: 6,
          inputSequenceEndTimestamp: '2024-07-28T14:10:00.000Z',
          dataFreshnessSeconds: 90,
          status: 'MODEL_READY',
          horizons: [
            {
              horizonMinutes: 10,
              forecastTimestamp: '2024-07-28T14:20:00.000Z',
              expectedRainfall: 42.0,
              rainfallConfidenceInterval: { lower: 36.0, upper: 49.0, confidenceLevel: 0.9 },
              expectedWindSpeed: 42.0,
              eventProbabilities: { heavyRain: 0.91, severeConvective: 0.82, galeWind: 0.6 },
              uncertaintyScore: 0.1,
              severity: 'HIGH',
            },
            {
              horizonMinutes: 30,
              forecastTimestamp: '2024-07-28T14:40:00.000Z',
              expectedRainfall: 68.0,
              rainfallConfidenceInterval: { lower: 58.0, upper: 79.0, confidenceLevel: 0.9 },
              expectedWindSpeed: 52.0,
              eventProbabilities: { heavyRain: 0.96, severeConvective: 0.92, galeWind: 0.75 },
              uncertaintyScore: 0.14,
              severity: 'SEVERE',
            },
          ],
          spatialNeighborhood: { height: 5, width: 5, centerGridId: 'GRID_R01_N2861_E07720', neighborhoodCellsCount: 25 },
          explainability: {
            spatialRiskContributions: [],
            topTemporalFeatures: [],
            summary: 'High-density convective core tracking directly over monitoring sector.',
          },
        },
        riskAssessment: {
          riskId: 'RISK_DELHI_1410',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          hazardType: 'HEAVY_RAIN',
          riskLevel: 'HIGH',
          riskScore: 68,
          modelProbability: 0.91,
          uncertaintyScore: 0.1,
          validFrom: '2024-07-28T14:10:00.000Z',
          validUntil: '2024-07-28T14:40:00.000Z',
          generatedAt: '2024-07-28T14:10:06.000Z',
          status: 'ACTIVE',
          dataQuality: 'VALID',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          explanation: {
            primaryDrivers: [
              { factorName: 'Radar Reflectivity (46.8 dBZ)', factorValue: 46.8, relativeContribution: 0.5, direction: 'INCREASES_RISK', explanationText: 'Intense convective precipitation echo' },
              { factorName: 'Pressure Drop (-3.4 hPa/10m)', factorValue: -3.4, relativeContribution: 0.25, direction: 'INCREASES_RISK', explanationText: 'Strong mesoscale barometric gradient' },
            ],
            summary: 'Precipitation exceeding 35 mm/h triggers HIGH risk threshold.',
          },
          timeline: [],
          disclaimer: 'ERROR 404 model assessment — Not an official weather warning.',
        },
        hotspots: [
          {
            hotspotId: 'HOTSPOT_DELHI_01',
            hazardType: 'HEAVY_RAIN',
            riskLevel: 'HIGH',
            peakRiskScore: 68,
            affectedGridCount: 4,
            centroid: { latitude: 28.6139, longitude: 77.209 },
            boundingBox: { minLat: 28.6039, maxLat: 28.6239, minLon: 77.199, maxLon: 77.219 },
            gridIds: ['GRID_R01_N2861_E07720', 'GRID_R01_N2860_E07720', 'GRID_R01_N2861_E07721'],
            estimatedSpeedKmh: 18.5,
            estimatedDirectionDeg: 125,
            validUntil: '2024-07-28T14:40:00.000Z',
          },
        ],
        alert: {
          alertId: 'ALERT_DELHI_1410',
          hazardType: 'HEAVY_RAIN',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          riskLevel: 'HIGH',
          riskScore: 68,
          probability: 0.91,
          uncertaintyScore: 0.1,
          title: 'High Convective Rain Warning (Delhi NCR)',
          description: 'AI model assessment detects rapid convective intensification. Expected rate: 42 mm/h within +10m to +30m.',
          origin: 'AI_MODEL_ASSESSMENT',
          validFrom: '2024-07-28T14:10:00.000Z',
          validUntil: '2024-07-28T14:40:00.000Z',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          status: 'ACTIVE',
          createdAt: '2024-07-28T14:10:07.000Z',
          updatedAt: '2024-07-28T14:10:07.000Z',
        },
        notifications: [
          {
            notificationId: 'NOTIF_DELHI_1410_01',
            alertId: 'ALERT_DELHI_1410',
            subscriptionId: 'SUB_MUNICIPAL_EOC',
            userId: 'USER_MUNICIPAL_DISASTER_OFFICER',
            channel: 'IN_APP',
            title: 'HIGH RISK: Severe Rain Approaching Delhi NCR',
            body: 'ConvLSTM nowcast projects 42 mm/h convective rain cell. Municipal drainage standby recommended.',
            hazardType: 'HEAVY_RAIN',
            riskLevel: 'HIGH',
            gridId: 'GRID_R01_N2861_E07720',
            origin: 'AI_MODEL_ASSESSMENT',
            status: 'DELIVERED',
            retryCount: 0,
            maxRetries: 3,
            deliveredAt: '2024-07-28T14:10:08.000Z',
            deduplicationKey: 'ALERT_DELHI_1410:SUB_MUNICIPAL_EOC:HIGH:IN_APP',
            disclaimer: 'AI model assessment — Not an official weather warning.',
            createdAt: '2024-07-28T14:10:07.000Z',
            updatedAt: '2024-07-28T14:10:08.000Z',
          },
        ],
      },

      // Frame 2: T+20 (Peak Cloudburst Event)
      {
        stepIndex: 2,
        timeOffsetLabel: 'T+20',
        timestamp: '2024-07-28T14:20:00.000Z',
        weatherRecordId: 'REC_DELHI_20240728_1420',
        weatherState: {
          id: 'FUSED_DELHI_1420',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          timestamp: '2024-07-28T14:20:00.000Z',
          temperature: 25.4,
          humidity: 98.0,
          pressure: 991.2,
          windSpeed: 48.0,
          windGust: 68.0,
          windDirection: 130,
          rainfall: 52.0,
          precipitationRate: 64.0,
          radarReflectivityDbz: 54.2,
          satelliteCloudCover: 100,
          lightningStrikeDensity: 24.8,
          nwpExpectedRain: 22.0,
          dataQuality: 'VALID',
          dataFreshnessSeconds: 60,
          sourceMetadata: [
            { sourceId: 'SRC_OBS_OPENMETEO_GTS', sourceType: 'OBSERVATION', provider: 'WMO GTS', weight: 0.3 },
            { sourceId: 'SRC_RADAR_RAINVIEWER_QPE', sourceType: 'RADAR', provider: 'RainViewer', weight: 0.6 },
            { sourceId: 'SRC_NWP_ECMWF_GFS', sourceType: 'NUMERICAL_MODEL', provider: 'ECMWF', weight: 0.1 },
          ],
          qualityMetadata: { overallReliabilityScore: 0.98, conflictDetected: false },
          fusionVersion: 'fusion-v1.0',
        },
        nowcast: {
          id: 'PRED_DELHI_1420',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          modelType: 'ConvLSTM',
          modelVersion: 'spatiotemporal-convlstm-v1',
          featureScalerVersion: 'scaler-v1.0',
          device: 'mps',
          generatedAt: '2024-07-28T14:20:05.000Z',
          inputSequenceLength: 6,
          inputSequenceEndTimestamp: '2024-07-28T14:20:00.000Z',
          dataFreshnessSeconds: 60,
          status: 'MODEL_READY',
          horizons: [
            {
              horizonMinutes: 10,
              forecastTimestamp: '2024-07-28T14:30:00.000Z',
              expectedRainfall: 72.0,
              rainfallConfidenceInterval: { lower: 62.0, upper: 84.0, confidenceLevel: 0.9 },
              expectedWindSpeed: 55.0,
              eventProbabilities: { heavyRain: 0.98, severeConvective: 0.96, galeWind: 0.85 },
              uncertaintyScore: 0.08,
              severity: 'SEVERE',
            },
          ],
          spatialNeighborhood: { height: 5, width: 5, centerGridId: 'GRID_R01_N2861_E07720', neighborhoodCellsCount: 25 },
          explainability: {
            spatialRiskContributions: [],
            topTemporalFeatures: [],
            summary: 'Extreme convective downburst and cloudburst conditions active.',
          },
        },
        riskAssessment: {
          riskId: 'RISK_DELHI_1420',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          hazardType: 'EXTREME_RAINFALL',
          riskLevel: 'SEVERE',
          riskScore: 89,
          modelProbability: 0.98,
          uncertaintyScore: 0.08,
          validFrom: '2024-07-28T14:20:00.000Z',
          validUntil: '2024-07-28T14:50:00.000Z',
          generatedAt: '2024-07-28T14:20:06.000Z',
          status: 'ACTIVE',
          dataQuality: 'VALID',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          explanation: {
            primaryDrivers: [
              { factorName: 'Radar Reflectivity (54.2 dBZ)', factorValue: 54.2, relativeContribution: 0.55, direction: 'INCREASES_RISK', explanationText: 'Extreme cloudburst core exceeding 60 mm/h rate' },
              { factorName: 'Lightning Flash Density (24.8/km²)', factorValue: 24.8, relativeContribution: 0.25, direction: 'INCREASES_RISK', explanationText: 'Severe convective updraft surges' },
            ],
            summary: 'Precipitation rate 64 mm/h triggers SEVERE emergency alert state.',
          },
          timeline: [],
          disclaimer: 'ERROR 404 model assessment — Not an official weather warning.',
        },
        hotspots: [
          {
            hotspotId: 'HOTSPOT_DELHI_02',
            hazardType: 'EXTREME_RAINFALL',
            riskLevel: 'SEVERE',
            peakRiskScore: 89,
            affectedGridCount: 8,
            centroid: { latitude: 28.6139, longitude: 77.209 },
            boundingBox: { minLat: 28.5939, maxLat: 28.6339, minLon: 77.189, maxLon: 77.229 },
            gridIds: ['GRID_R01_N2861_E07720', 'GRID_R01_N2860_E07720', 'GRID_R01_N2861_E07721', 'GRID_R01_N2862_E07720'],
            estimatedSpeedKmh: 14.0,
            estimatedDirectionDeg: 135,
            validUntil: '2024-07-28T14:50:00.000Z',
          },
        ],
        alert: {
          alertId: 'ALERT_DELHI_1420',
          hazardType: 'EXTREME_RAINFALL',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          riskLevel: 'SEVERE',
          riskScore: 89,
          probability: 0.98,
          uncertaintyScore: 0.08,
          title: 'SEVERE CLOUDBURST WARNING (Delhi NCR)',
          description: 'AI model assessment detects severe localized cloudburst. Precipitation rate 64 mm/h with gale gusts 68 km/h.',
          origin: 'AI_MODEL_ASSESSMENT',
          validFrom: '2024-07-28T14:20:00.000Z',
          validUntil: '2024-07-28T14:50:00.000Z',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          status: 'ACTIVE',
          createdAt: '2024-07-28T14:20:07.000Z',
          updatedAt: '2024-07-28T14:20:07.000Z',
        },
        notifications: [
          {
            notificationId: 'NOTIF_DELHI_1420_01',
            alertId: 'ALERT_DELHI_1420',
            subscriptionId: 'SUB_MUNICIPAL_EOC',
            userId: 'USER_MUNICIPAL_DISASTER_OFFICER',
            channel: 'IN_APP',
            title: 'EMERGENCY: Severe Cloudburst Active (Delhi NCR)',
            body: 'Observed rate 64 mm/h. Severe localized urban waterlogging imminent in Sector 28.61°N, 77.20°E.',
            hazardType: 'EXTREME_RAINFALL',
            riskLevel: 'SEVERE',
            gridId: 'GRID_R01_N2861_E07720',
            origin: 'AI_MODEL_ASSESSMENT',
            status: 'DELIVERED',
            retryCount: 0,
            maxRetries: 3,
            deliveredAt: '2024-07-28T14:20:08.000Z',
            deduplicationKey: 'ALERT_DELHI_1420:SUB_MUNICIPAL_EOC:SEVERE:IN_APP',
            disclaimer: 'AI model assessment — Not an official weather warning.',
            createdAt: '2024-07-28T14:20:07.000Z',
            updatedAt: '2024-07-28T14:20:08.000Z',
          },
        ],
      },

      // Frame 3: T+30 (Dissipation & Return to Normal)
      {
        stepIndex: 3,
        timeOffsetLabel: 'T+30',
        timestamp: '2024-07-28T14:30:00.000Z',
        weatherRecordId: 'REC_DELHI_20240728_1430',
        weatherState: {
          id: 'FUSED_DELHI_1430',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          timestamp: '2024-07-28T14:30:00.000Z',
          temperature: 24.8,
          humidity: 94.0,
          pressure: 996.5,
          windSpeed: 24.0,
          windGust: 32.0,
          windDirection: 140,
          rainfall: 65.0,
          precipitationRate: 18.0,
          radarReflectivityDbz: 32.0,
          satelliteCloudCover: 82,
          lightningStrikeDensity: 2.1,
          nwpExpectedRain: 8.0,
          dataQuality: 'VALID',
          dataFreshnessSeconds: 120,
          sourceMetadata: [
            { sourceId: 'SRC_OBS_OPENMETEO_GTS', sourceType: 'OBSERVATION', provider: 'WMO GTS', weight: 0.3 },
            { sourceId: 'SRC_RADAR_RAINVIEWER_QPE', sourceType: 'RADAR', provider: 'RainViewer', weight: 0.6 },
            { sourceId: 'SRC_NWP_ECMWF_GFS', sourceType: 'NUMERICAL_MODEL', provider: 'ECMWF', weight: 0.1 },
          ],
          qualityMetadata: { overallReliabilityScore: 0.95, conflictDetected: false },
          fusionVersion: 'fusion-v1.0',
        },
        nowcast: {
          id: 'PRED_DELHI_1430',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          modelType: 'ConvLSTM',
          modelVersion: 'spatiotemporal-convlstm-v1',
          featureScalerVersion: 'scaler-v1.0',
          device: 'mps',
          generatedAt: '2024-07-28T14:30:05.000Z',
          inputSequenceLength: 6,
          inputSequenceEndTimestamp: '2024-07-28T14:30:00.000Z',
          dataFreshnessSeconds: 120,
          status: 'MODEL_READY',
          horizons: [
            {
              horizonMinutes: 10,
              forecastTimestamp: '2024-07-28T14:40:00.000Z',
              expectedRainfall: 8.0,
              rainfallConfidenceInterval: { lower: 4.0, upper: 12.0, confidenceLevel: 0.9 },
              expectedWindSpeed: 20.0,
              eventProbabilities: { heavyRain: 0.25, severeConvective: 0.15, galeWind: 0.1 },
              uncertaintyScore: 0.09,
              severity: 'LOW',
            },
          ],
          spatialNeighborhood: { height: 5, width: 5, centerGridId: 'GRID_R01_N2861_E07720', neighborhoodCellsCount: 25 },
          explainability: {
            spatialRiskContributions: [],
            topTemporalFeatures: [],
            summary: 'Convective cell dissipated. Light stratiform rain lingering.',
          },
        },
        riskAssessment: {
          riskId: 'RISK_DELHI_1430',
          gridId: 'GRID_R01_N2861_E07720',
          gridCode: 'GRID_R01_N2861_E07720',
          hazardType: 'HEAVY_RAIN',
          riskLevel: 'WATCH',
          riskScore: 32,
          modelProbability: 0.25,
          uncertaintyScore: 0.09,
          validFrom: '2024-07-28T14:30:00.000Z',
          validUntil: '2024-07-28T15:00:00.000Z',
          generatedAt: '2024-07-28T14:30:06.000Z',
          status: 'ACTIVE',
          dataQuality: 'VALID',
          modelVersion: 'spatiotemporal-convlstm-v1',
          fusionVersion: 'fusion-v1.0',
          explanation: {
            primaryDrivers: [
              { factorName: 'Radar Reflectivity (32.0 dBZ)', factorValue: 32.0, relativeContribution: 0.4, direction: 'DECREASES_RISK', explanationText: 'Cell echo dropping below severe threshold' },
              { factorName: 'Barometric Rise (+5.3 hPa/10m)', factorValue: 5.3, relativeContribution: 0.3, direction: 'DECREASES_RISK', explanationText: 'Post-convective pressure recovery' },
            ],
            summary: 'Storm cell dissipated. Hysteresis transitions level back to WATCH (Score 32).',
          },
          timeline: [],
          disclaimer: 'ERROR 404 model assessment — Not an official weather warning.',
        },
        hotspots: [],
        notifications: [],
      },
    ];

    this.scenarios.set(delhiMeta.scenarioId, { meta: delhiMeta, frames: delhiFrames });
  }

  getScenarios(): ReplayScenarioMetadata[] {
    return Array.from(this.scenarios.values()).map((s) => s.meta);
  }

  getScenario(scenarioId: string): { meta: ReplayScenarioMetadata; frames: ReplayTimeStepFrame[] } | undefined {
    return this.scenarios.get(scenarioId);
  }

  getCurrentFrame(): ReplayTimeStepFrame {
    const active = this.scenarios.get(this.activeScenarioId);
    if (!active || active.frames.length === 0) {
      throw new Error(`Active scenario ${this.activeScenarioId} not found`);
    }
    return active.frames[Math.min(this.activeStepIndex, active.frames.length - 1)];
  }

  stepTo(stepIndex: number, scenarioId?: string): ReplayTimeStepFrame {
    if (scenarioId && this.scenarios.has(scenarioId)) {
      this.activeScenarioId = scenarioId;
    }
    const active = this.scenarios.get(this.activeScenarioId);
    if (!active) {
      throw new Error(`Scenario ${this.activeScenarioId} not found`);
    }

    this.activeStepIndex = Math.max(0, Math.min(stepIndex, active.frames.length - 1));
    this.playbackState = 'PAUSED';
    return active.frames[this.activeStepIndex];
  }

  reset(): ReplayTimeStepFrame {
    this.activeStepIndex = 0;
    this.playbackState = 'STOPPED';
    return this.getCurrentFrame();
  }

  getActiveScenarioState() {
    const active = this.scenarios.get(this.activeScenarioId);
    return {
      activeScenarioId: this.activeScenarioId,
      activeStepIndex: this.activeStepIndex,
      playbackState: this.playbackState,
      totalSteps: active?.frames.length || 0,
      metadata: active?.meta,
      currentFrame: this.getCurrentFrame(),
    };
  }
}

export const scenarioReplayService = new ScenarioReplayService();
