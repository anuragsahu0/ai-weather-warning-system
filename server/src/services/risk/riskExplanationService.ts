import { RiskExplanationFactor, HazardType } from './riskTypes.js';

export class RiskExplanationService {
  generateExplanationNarrative(
    hazard: HazardType,
    score: number,
    factors: RiskExplanationFactor[]
  ): string {
    if (score < 20) {
      return `Atmospheric variables across the sector remain within nominal, non-severe baseline conditions.`;
    }

    const topFactor = factors[0];
    const secondFactor = factors[1];

    let narrative = `Model-based risk assessment (${score}/100) indicates elevated ${hazard.toLowerCase().replace(/_/g, ' ')} hazard.`;

    if (topFactor) {
      narrative += ` Primary driver: ${topFactor.explanationText}`;
    }
    if (secondFactor && secondFactor.direction === 'INCREASES_RISK') {
      narrative += ` Additionally, ${secondFactor.explanationText.toLowerCase()}`;
    }

    return narrative;
  }
}

export const riskExplanationService = new RiskExplanationService();
