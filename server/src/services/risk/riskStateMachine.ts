import { RiskLevel, HazardType, RiskStateTransitionRecord } from './riskTypes.js';
import { scoreToRiskLevel } from './riskThresholdConfig.js';
import { prisma } from '../../config/db.js';

export class RiskStateMachine {
  private activeStates = new Map<string, RiskLevel>();

  evaluateTransition(
    gridId: string,
    hazardType: HazardType,
    newScore: number
  ): { level: RiskLevel; transitioned: boolean; transition?: RiskStateTransitionRecord } {
    const key = `${gridId}_${hazardType}`;
    const currentLevel = this.activeStates.get(key) || 'NORMAL';
    const newLevel = scoreToRiskLevel(newScore, currentLevel);

    const transitioned = newLevel !== currentLevel;
    let transitionRecord: RiskStateTransitionRecord | undefined;

    if (transitioned) {
      this.activeStates.set(key, newLevel);
      transitionRecord = {
        id: `trans-${Date.now().toString(36)}`,
        gridId,
        hazardType,
        fromLevel: currentLevel,
        toLevel: newLevel,
        riskScore: newScore,
        reason: `Risk score updated to ${newScore} triggering transition from ${currentLevel} to ${newLevel}`,
        timestamp: new Date().toISOString(),
      };

      // Persist asynchronously
      this.persistTransition(transitionRecord).catch(() => {});
    }

    return {
      level: newLevel,
      transitioned,
      transition: transitionRecord,
    };
  }

  getCurrentLevel(gridId: string, hazardType: HazardType): RiskLevel {
    return this.activeStates.get(`${gridId}_${hazardType}`) || 'NORMAL';
  }

  private async persistTransition(t: RiskStateTransitionRecord): Promise<void> {
    try {
      await prisma.riskStateTransitionRecord.create({
        data: {
          id: t.id,
          gridId: t.gridId,
          hazardType: t.hazardType,
          fromLevel: t.fromLevel,
          toLevel: t.toLevel,
          riskScore: t.riskScore,
          transitionReason: t.reason,
          timestamp: new Date(t.timestamp),
        },
      });
    } catch {
      // Standby DB resilient catch
    }
  }
}

export const riskStateMachine = new RiskStateMachine();
