import { AlertEvent, AlertEventOrigin } from '../notificationTypes.js';

export interface OfficialAlertPayload {
  authority: string;
  externalAlertId: string;
  hazard: string;
  severity: string;
  headline: string;
  description: string;
  instruction?: string;
  effectiveTime: string;
  expiresTime: string;
  areaDescription: string;
  sourceUrl?: string;
}

export class OfficialAlertProvider {
  readonly origin: AlertEventOrigin = 'OFFICIAL_EXTERNAL_ALERT';
  readonly providerName = 'NDMA / IMD Authoritative CAP Feed';

  parseOfficialAlertToAlertEvent(raw: OfficialAlertPayload, gridId = 'SECTOR_REGIONAL'): AlertEvent {
    const nowIso = new Date().toISOString();
    return {
      alertId: `official-${raw.externalAlertId}`,
      hazardType: 'SEVERE_WEATHER',
      gridId,
      gridCode: gridId,
      riskLevel: 'SEVERE',
      riskScore: 95,
      probability: 1.0,
      uncertaintyScore: 0.0,
      title: `[OFFICIAL ${raw.authority}] ${raw.headline}`,
      description: `${raw.description} — Instructions: ${raw.instruction || 'Follow official state emergency directives.'}`,
      origin: 'OFFICIAL_EXTERNAL_ALERT',
      validFrom: raw.effectiveTime || nowIso,
      validUntil: raw.expiresTime || new Date(Date.now() + 7200000).toISOString(),
      modelVersion: 'N/A (Authoritative Source)',
      fusionVersion: 'N/A (CAP Feed)',
      status: 'ACTIVE',
      explanationSummary: `Official emergency advisory issued by ${raw.authority}. Source: ${raw.sourceUrl || 'Official Weather Bulletin'}`,
      contributingSources: [raw.authority],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }
}

export const officialAlertProvider = new OfficialAlertProvider();
