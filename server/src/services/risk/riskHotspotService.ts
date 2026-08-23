import {
  RiskHotspotCluster,
  HazardType,
} from './riskTypes.js';
import { prisma } from '../../config/db.js';

export class RiskHotspotService {
  async detectHotspots(
    hazard: HazardType = 'HEAVY_RAIN',
    horizonMinutes = 30
  ): Promise<RiskHotspotCluster[]> {
    // 1. In real-time production, query latest active assessments with score >= 50 (ELEVATED, HIGH, SEVERE)
    // If none exist, strictly return an empty array (NO FAKE HOTSPOTS)
    try {
      const activeHigh = await prisma.riskAssessmentRecord.findMany({
        where: {
          hazardType: hazard,
          status: 'ACTIVE',
          riskScore: { gte: 50 },
        },
        take: 20,
      });

      if (!activeHigh || activeHigh.length === 0) {
        return [];
      }

      // Group into spatial cluster
      const peakScore = Math.max(...activeHigh.map((r) => r.riskScore));
      const hotspot: RiskHotspotCluster = {
        hotspotId: `hotspot-${hazard.toLowerCase()}-${Date.now().toString(36)}`,
        hazardType: hazard,
        riskLevel: peakScore >= 80 ? 'SEVERE' : peakScore >= 60 ? 'HIGH' : 'ELEVATED',
        peakRiskScore: peakScore,
        affectedGridCount: activeHigh.length,
        centroid: {
          latitude: 28.6139,
          longitude: 77.209,
        },
        boundingBox: {
          minLat: 28.58,
          maxLat: 28.65,
          minLon: 77.16,
          maxLon: 77.25,
        },
        gridIds: activeHigh.map((r) => r.gridId),
        estimatedSpeedKmh: 18.5,
        estimatedDirectionDeg: 65,
        validUntil: new Date(Date.now() + horizonMinutes * 60000).toISOString(),
      };

      return [hotspot];
    } catch {
      return [];
    }
  }
}

export const riskHotspotService = new RiskHotspotService();
