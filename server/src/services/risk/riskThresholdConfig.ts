import { RiskLevel } from './riskTypes.js';

export interface LevelThresholdConfig {
  level: RiskLevel;
  activationScore: number;
  deactivationScore: number; // Hysteresis lower threshold
  description: string;
}

export const RISK_THRESHOLD_CONFIGS: Record<RiskLevel, LevelThresholdConfig> = {
  NORMAL: {
    level: 'NORMAL',
    activationScore: 0,
    deactivationScore: 0,
    description: 'Background surface conditions within non-severe historical envelopes.',
  },
  WATCH: {
    level: 'WATCH',
    activationScore: 21,
    deactivationScore: 16,
    description: 'Developing atmospheric instability or early convective cloud emergence.',
  },
  ELEVATED: {
    level: 'ELEVATED',
    activationScore: 41,
    deactivationScore: 36,
    description: 'Accelerating precipitation rate, barometric drop, or strong convective surge.',
  },
  HIGH: {
    level: 'HIGH',
    activationScore: 61,
    deactivationScore: 56,
    description: 'High probability of severe localized hazard with intense surface impacts.',
  },
  SEVERE: {
    level: 'SEVERE',
    activationScore: 81,
    deactivationScore: 76,
    description: 'Critical severe event threshold: rapid urban inundation, cloudburst, or gale gusts.',
  },
};

export function scoreToRiskLevel(score: number, currentLevel: RiskLevel = 'NORMAL'): RiskLevel {
  const clamped = Math.max(0, Math.min(100, score));

  // If currently at SEVERE, check deactivation
  if (currentLevel === 'SEVERE' && clamped >= RISK_THRESHOLD_CONFIGS.SEVERE.deactivationScore) {
    return 'SEVERE';
  }
  if (clamped >= RISK_THRESHOLD_CONFIGS.SEVERE.activationScore) {
    return 'SEVERE';
  }

  // If currently at HIGH, check deactivation
  if (currentLevel === 'HIGH' && clamped >= RISK_THRESHOLD_CONFIGS.HIGH.deactivationScore) {
    return 'HIGH';
  }
  if (clamped >= RISK_THRESHOLD_CONFIGS.HIGH.activationScore) {
    return 'HIGH';
  }

  // If currently at ELEVATED, check deactivation
  if (currentLevel === 'ELEVATED' && clamped >= RISK_THRESHOLD_CONFIGS.ELEVATED.deactivationScore) {
    return 'ELEVATED';
  }
  if (clamped >= RISK_THRESHOLD_CONFIGS.ELEVATED.activationScore) {
    return 'ELEVATED';
  }

  // If currently at WATCH, check deactivation
  if (currentLevel === 'WATCH' && clamped >= RISK_THRESHOLD_CONFIGS.WATCH.deactivationScore) {
    return 'WATCH';
  }
  if (clamped >= RISK_THRESHOLD_CONFIGS.WATCH.activationScore) {
    return 'WATCH';
  }

  return 'NORMAL';
}
