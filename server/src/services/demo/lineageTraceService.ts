import { scenarioReplayService, ReplayTimeStepFrame } from './scenarioReplayService.js';

export interface LineageAuditNode {
  stage: 'WEATHER_INGESTION' | 'DATA_FUSION' | 'NOWCASTING' | 'RISK_INTELLIGENCE' | 'ALERT_DECISION' | 'EARLY_WARNING_DISPATCH';
  entityId: string;
  timestamp: string;
  status: 'VALIDATED' | 'PROCESSED' | 'TRIGGERED' | 'DISPATCHED' | 'SUPPRESSED';
  details: Record<string, any>;
}

export interface EndToEndLineageTrace {
  traceId: string;
  scenarioId: string;
  stepIndex: number;
  timeOffsetLabel: string;
  generatedAt: string;
  isTraceValid: boolean;
  nodes: LineageAuditNode[];
  summary: {
    weatherRecordId: string;
    fusedStateId: string;
    predictionId: string;
    riskId: string;
    alertId?: string;
    notificationIds: string[];
  };
}

export class LineageTraceService {
  generateLineageTrace(frame?: ReplayTimeStepFrame): EndToEndLineageTrace {
    const targetFrame = frame || scenarioReplayService.getCurrentFrame();

    const nodes: LineageAuditNode[] = [
      // 1. Weather Ingestion
      {
        stage: 'WEATHER_INGESTION',
        entityId: targetFrame.weatherRecordId,
        timestamp: targetFrame.timestamp,
        status: 'VALIDATED',
        details: {
          gridId: targetFrame.weatherState.gridId,
          primarySource: 'Open-Meteo & WMO GTS',
          rawPrecipitationRateMmH: targetFrame.weatherState.precipitationRate,
        },
      },

      // 2. Multi-Source Fusion
      {
        stage: 'DATA_FUSION',
        entityId: targetFrame.weatherState.id,
        timestamp: targetFrame.weatherState.timestamp,
        status: 'PROCESSED',
        details: {
          fusionVersion: targetFrame.weatherState.fusionVersion,
          fusedSourcesCount: targetFrame.weatherState.sourceMetadata.length,
          radarDbz: targetFrame.weatherState.radarReflectivityDbz,
          reliabilityScore: targetFrame.weatherState.qualityMetadata.overallReliabilityScore,
        },
      },

      // 3. Spatio-Temporal Nowcasting
      {
        stage: 'NOWCASTING',
        entityId: targetFrame.nowcast.id,
        timestamp: targetFrame.nowcast.generatedAt,
        status: 'PROCESSED',
        details: {
          modelType: targetFrame.nowcast.modelType,
          modelVersion: targetFrame.nowcast.modelVersion,
          device: targetFrame.nowcast.device,
          horizonsCount: targetFrame.nowcast.horizons.length,
          peakProbability: targetFrame.nowcast.horizons[0]?.eventProbabilities.heavyRain || 0,
        },
      },

      // 4. Risk Intelligence
      {
        stage: 'RISK_INTELLIGENCE',
        entityId: targetFrame.riskAssessment.riskId,
        timestamp: targetFrame.riskAssessment.generatedAt,
        status: 'PROCESSED',
        details: {
          hazardType: targetFrame.riskAssessment.hazardType,
          riskLevel: targetFrame.riskAssessment.riskLevel,
          riskScore: targetFrame.riskAssessment.riskScore,
          modelProbability: targetFrame.riskAssessment.modelProbability,
          hysteresisActive: true,
        },
      },

      // 5. Alert Decision
      {
        stage: 'ALERT_DECISION',
        entityId: targetFrame.alert ? targetFrame.alert.alertId : `NO_ALERT_${targetFrame.riskAssessment.riskId}`,
        timestamp: targetFrame.alert ? targetFrame.alert.createdAt : targetFrame.riskAssessment.generatedAt,
        status: targetFrame.alert ? 'TRIGGERED' : 'SUPPRESSED',
        details: {
          origin: targetFrame.alert ? targetFrame.alert.origin : 'THRESHOLD_NOT_MET',
          riskScore: targetFrame.riskAssessment.riskScore,
          title: targetFrame.alert ? targetFrame.alert.title : 'No Alert Dispatched (Score < 60)',
        },
      },

      // 6. Early-Warning Notification Dispatch
      {
        stage: 'EARLY_WARNING_DISPATCH',
        entityId: targetFrame.notifications.map((n) => n.notificationId).join(',') || 'NO_DISPATCH',
        timestamp: targetFrame.notifications[0]?.createdAt || targetFrame.riskAssessment.generatedAt,
        status: targetFrame.notifications.length > 0 ? 'DISPATCHED' : 'SUPPRESSED',
        details: {
          dispatchesCount: targetFrame.notifications.length,
          channels: targetFrame.notifications.map((n) => n.channel),
          statuses: targetFrame.notifications.map((n) => n.status),
        },
      },
    ];

    const notificationIds = targetFrame.notifications.map((n) => n.notificationId);

    return {
      traceId: `TRACE_${targetFrame.weatherRecordId}`,
      scenarioId: 'SCENARIO_DELHI_CLOUDBURST_2024',
      stepIndex: targetFrame.stepIndex,
      timeOffsetLabel: targetFrame.timeOffsetLabel,
      generatedAt: new Date().toISOString(),
      isTraceValid: true,
      nodes,
      summary: {
        weatherRecordId: targetFrame.weatherRecordId,
        fusedStateId: targetFrame.weatherState.id,
        predictionId: targetFrame.nowcast.id,
        riskId: targetFrame.riskAssessment.riskId,
        alertId: targetFrame.alert?.alertId,
        notificationIds,
      },
    };
  }
}

export const lineageTraceService = new LineageTraceService();
