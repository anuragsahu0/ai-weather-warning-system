import {
  RiskAssessmentResult,
  HazardType,
  RiskLevel,
} from '../../../../shared/types/index.js';
import {
  AlertEvent,
  AlertDecisionType,
  AlertThresholdConfig,
} from './notificationTypes.js';
import { prisma } from '../../config/db.js';

export interface AlertDecisionResult {
  decision: AlertDecisionType;
  alert?: AlertEvent;
  reason: string;
}

export class AlertDecisionService {
  private config: AlertThresholdConfig = {
    minimumRiskLevelForAlert: 'HIGH',
    allowWatchAlerts: false,
    allowElevatedAlerts: false,
    minRiskScore: 60,
  };

  private activeAlerts = new Map<string, AlertEvent>();

  async evaluateRiskAssessment(
    assessment: RiskAssessmentResult
  ): Promise<AlertDecisionResult> {
    const {
      gridId,
      gridCode,
      hazardType,
      riskLevel,
      riskScore,
      modelProbability,
      uncertaintyScore,
      dataQuality,
      status,
      validFrom,
      validUntil,
      modelVersion,
      fusionVersion,
      explanation,
    } = assessment;

    // 1. Data Quality Gate: Never create alerts from invalid or stale telemetry
    if (dataQuality !== 'VALID' || status !== 'ACTIVE') {
      return {
        decision: 'NO_ALERT',
        reason: `Risk assessment data quality is ${dataQuality} (status: ${status}). Alerts cannot be generated from unvalidated telemetry.`,
      };
    }

    const key = `${gridId}_${hazardType}`;
    const existingAlert = this.activeAlerts.get(key);

    const isAboveAlertThreshold =
      riskScore >= this.config.minRiskScore ||
      riskLevel === 'HIGH' ||
      riskLevel === 'SEVERE';

    // 2. If above threshold
    if (isAboveAlertThreshold) {
      const nowIso = new Date().toISOString();
      const alertId = existingAlert ? existingAlert.alertId : `alt-${Date.now().toString(36)}`;
      const isUpdate = existingAlert !== undefined && existingAlert.status === 'ACTIVE';

      const title = `${this.formatHazardTitle(hazardType)} ${riskLevel} Risk Detected`;
      const description = `ERROR 404 AI model assessment: Localized ${hazardType.toLowerCase().replace(/_/g, ' ')} risk score (${riskScore}/100) detected for grid sector ${gridId}. Valid until ${new Date(validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC.`;

      const alertEvent: AlertEvent = {
        alertId,
        hazardType,
        gridId,
        gridCode,
        riskLevel,
        riskScore,
        probability: modelProbability,
        uncertaintyScore,
        title,
        description,
        origin: 'AI_MODEL_ASSESSMENT',
        validFrom,
        validUntil,
        modelVersion,
        fusionVersion,
        status: isUpdate ? 'UPDATED' : 'ACTIVE',
        explanationSummary: explanation.summary,
        contributingSources: explanation.primaryDrivers.map((d) => d.factorName),
        createdAt: existingAlert ? existingAlert.createdAt : nowIso,
        updatedAt: nowIso,
      };

      this.activeAlerts.set(key, alertEvent);
      this.persistAlertToDb(alertEvent).catch(() => {});

      return {
        decision: isUpdate ? 'UPDATE_ALERT' : 'CREATE_ALERT',
        alert: alertEvent,
        reason: isUpdate
          ? `Risk level updated to ${riskLevel} (${riskScore}/100) for active alert ${alertId}.`
          : `Risk level elevated to ${riskLevel} (${riskScore}/100) exceeding alert threshold.`,
      };
    }

    // 3. If below threshold and an active alert exists, expire it
    if (existingAlert && existingAlert.status === 'ACTIVE') {
      const nowIso = new Date().toISOString();
      existingAlert.status = 'EXPIRED';
      existingAlert.updatedAt = nowIso;
      this.activeAlerts.set(key, existingAlert);
      this.persistAlertToDb(existingAlert).catch(() => {});

      return {
        decision: 'EXPIRE_ALERT',
        alert: existingAlert,
        reason: `Risk level subsided to ${riskLevel} (${riskScore}/100). Active alert ${existingAlert.alertId} expired.`,
      };
    }

    return {
      decision: 'NO_ALERT',
      reason: `Risk score (${riskScore}/100, Level: ${riskLevel}) remains below configured alert activation threshold (${this.config.minRiskScore}).`,
    };
  }

  getActiveAlerts(): AlertEvent[] {
    const nowMs = Date.now();
    return Array.from(this.activeAlerts.values()).filter(
      (a) => a.status === 'ACTIVE' && new Date(a.validUntil).getTime() > nowMs
    );
  }

  getAlertById(alertId: string): AlertEvent | undefined {
    return Array.from(this.activeAlerts.values()).find((a) => a.alertId === alertId);
  }

  private formatHazardTitle(hazard: HazardType): string {
    switch (hazard) {
      case 'HEAVY_RAIN':
        return 'Heavy Rain';
      case 'THUNDERSTORM':
        return 'Thunderstorm Surge';
      case 'STRONG_WIND':
        return 'Strong Gale Wind';
      case 'EXTREME_RAINFALL':
        return 'Extreme Cloudburst';
      case 'SEVERE_WEATHER':
        return 'Severe Convective Weather';
    }
  }

  private async persistAlertToDb(a: AlertEvent): Promise<void> {
    try {
      await prisma.alertEventRecord.upsert({
        where: { alertId: a.alertId },
        update: {
          riskLevel: a.riskLevel,
          riskScore: a.riskScore,
          probability: a.probability,
          uncertaintyScore: a.uncertaintyScore,
          title: a.title,
          description: a.description,
          validFrom: new Date(a.validFrom),
          validUntil: new Date(a.validUntil),
          status: a.status,
          explanationSummary: a.explanationSummary,
          contributingSourcesJson: a.contributingSources as object,
          updatedAt: new Date(a.updatedAt),
        },
        create: {
          alertId: a.alertId,
          hazardType: a.hazardType,
          gridId: a.gridId,
          gridCode: a.gridCode,
          riskLevel: a.riskLevel,
          riskScore: a.riskScore,
          probability: a.probability,
          uncertaintyScore: a.uncertaintyScore,
          title: a.title,
          description: a.description,
          origin: a.origin,
          validFrom: new Date(a.validFrom),
          validUntil: new Date(a.validUntil),
          modelVersion: a.modelVersion,
          fusionVersion: a.fusionVersion,
          status: a.status,
          explanationSummary: a.explanationSummary,
          contributingSourcesJson: a.contributingSources as object,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        },
      });
    } catch {
      // Resilient DB catch
    }
  }
}

export const alertDecisionService = new AlertDecisionService();
