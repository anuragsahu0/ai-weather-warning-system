import {
  HazardType,
  HazardEvaluationContext,
  HazardStrategyResult,
  RiskExplanationFactor,
} from './riskTypes.js';
import { scoreToRiskLevel } from './riskThresholdConfig.js';

export interface HazardStrategy {
  hazardType: HazardType;
  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult;
}

export class HeavyRainStrategy implements HazardStrategy {
  hazardType: HazardType = 'HEAVY_RAIN';

  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult {
    const rainExp = ctx.expectedRainfallRate || 0;
    const rainObs = ctx.rainfallRate || 0;
    const rainAccum = ctx.rollingRainAccum60m || rainObs;
    const presTend = ctx.pressureTendencyHpaPerHr || 0;
    const prob = ctx.modelProbability;
    const unc = ctx.uncertaintyScore;

    // Component 1: Continuous Intensity Score (0–40 pts)
    const intensityScore = Math.min(40, (Math.max(rainExp, rainObs) / 25.0) * 40.0);

    // Component 2: Calibrated Model Probability Score (0–35 pts)
    const probScore = prob * 35.0;

    // Component 3: Antecedent Accumulation Score (0–15 pts)
    const accumScore = Math.min(15, (rainAccum / 30.0) * 15.0);

    // Component 4: Barometric Drop Instability Score (0–10 pts)
    const baroScore = presTend < -1.0 ? Math.min(10, Math.abs(presTend) * 3.5) : 0.0;

    const rawScore = intensityScore + probScore + accumScore + baroScore;

    // Uncertainty adjustment: High dispersion slightly damps deterministic certainty (up to -10 pts)
    const uncPenalty = Number((unc * 10.0).toFixed(1));
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - uncPenalty)));

    const riskLevel = scoreToRiskLevel(finalScore);

    const factors: RiskExplanationFactor[] = [
      {
        factorName: 'expectedRainfallRate',
        factorValue: Number(rainExp.toFixed(1)),
        relativeContribution: Number((intensityScore / (rawScore || 1)).toFixed(2)),
        direction: rainExp > 10 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Expected precipitation rate of ${rainExp.toFixed(1)} mm/h at +${ctx.horizonMinutes}m lead time.`,
      },
      {
        factorName: 'modelProbability',
        factorValue: Number((prob * 100).toFixed(1)),
        relativeContribution: Number((probScore / (rawScore || 1)).toFixed(2)),
        direction: prob > 0.4 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Calibrated spatiotemporal model assigns ${Math.round(prob * 100)}% probability for heavy rain event.`,
      },
      {
        factorName: 'pressureTendencyHpaPerHr',
        factorValue: Number(presTend.toFixed(2)),
        relativeContribution: Number((baroScore / (rawScore || 1)).toFixed(2)),
        direction: presTend < -1.5 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Barometric pressure tendency of ${presTend.toFixed(1)} hPa/h indicating convective inflow convergence.`,
      },
      {
        factorName: 'rollingRainAccum60m',
        factorValue: Number(rainAccum.toFixed(1)),
        relativeContribution: Number((accumScore / (rawScore || 1)).toFixed(2)),
        direction: rainAccum > 15 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Past 60-minute surface accumulation of ${rainAccum.toFixed(1)} mm saturating urban drainage.`,
      },
    ];

    const summary =
      finalScore >= 60
        ? `Elevated heavy rain risk (${finalScore}/100) driven by ${rainExp.toFixed(1)} mm/h nowcasted rain intensity and ${Math.round(prob * 100)}% model probability.`
        : `Surface meteorological telemetry within manageable baseline precipitation thresholds (${finalScore}/100).`;

    return {
      hazardType: this.hazardType,
      rawRiskScore: Math.round(rawScore),
      finalRiskScore: finalScore,
      riskLevel,
      modelProbability: prob,
      uncertaintyPenalty: uncPenalty,
      contributingFactors: factors,
      summary,
    };
  }
}

export class ThunderstormStrategy implements HazardStrategy {
  hazardType: HazardType = 'THUNDERSTORM';

  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult {
    const prob = ctx.modelProbability;
    const gust = ctx.windGust || ctx.windSpeed || 0;
    const presTend = ctx.pressureTendencyHpaPerHr || 0;
    const hum = ctx.humidity || 50;
    const unc = ctx.uncertaintyScore;

    // Component 1: Convective Model Probability (0–45 pts)
    const probScore = prob * 45.0;

    // Component 2: Barometric Surge / Frontal Drop (0–25 pts)
    const baroScore = presTend < -1.2 ? Math.min(25, Math.abs(presTend) * 8.0) : 0.0;

    // Component 3: Surface Wind Gust Shear (0–20 pts)
    const gustScore = Math.min(20, (gust / 50.0) * 20.0);

    // Component 4: Boundary Layer Moisture (0–10 pts)
    const moistureScore = hum > 75 ? Math.min(10, ((hum - 75) / 25.0) * 10.0) : 0.0;

    const rawScore = probScore + baroScore + gustScore + moistureScore;
    const uncPenalty = Number((unc * 8.0).toFixed(1));
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - uncPenalty)));

    const riskLevel = scoreToRiskLevel(finalScore);

    const factors: RiskExplanationFactor[] = [
      {
        factorName: 'modelProbability',
        factorValue: Number((prob * 100).toFixed(1)),
        relativeContribution: Number((probScore / (rawScore || 1)).toFixed(2)),
        direction: prob > 0.35 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Severe convective storm probability evaluated at ${Math.round(prob * 100)}%.`,
      },
      {
        factorName: 'pressureTendencyHpaPerHr',
        factorValue: Number(presTend.toFixed(2)),
        relativeContribution: Number((baroScore / (rawScore || 1)).toFixed(2)),
        direction: presTend < -1.5 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Rapid barometric drop (${presTend.toFixed(1)} hPa/h) signaling thunderstorm cell development.`,
      },
      {
        factorName: 'windGust',
        factorValue: Number(gust.toFixed(1)),
        relativeContribution: Number((gustScore / (rawScore || 1)).toFixed(2)),
        direction: gust > 40 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Peak surface wind gust of ${gust.toFixed(1)} km/h along convective gust front.`,
      },
    ];

    const summary =
      finalScore >= 60
        ? `Thunderstorm convective hazard risk (${finalScore}/100) supported by barometric destabilization and elevated storm probability.`
        : `Convective instability indices remain within stable non-thunderstorm baseline range (${finalScore}/100).`;

    return {
      hazardType: this.hazardType,
      rawRiskScore: Math.round(rawScore),
      finalRiskScore: finalScore,
      riskLevel,
      modelProbability: prob,
      uncertaintyPenalty: uncPenalty,
      contributingFactors: factors,
      summary,
    };
  }
}

export class StrongWindStrategy implements HazardStrategy {
  hazardType: HazardType = 'STRONG_WIND';

  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult {
    const windSpeed = ctx.windSpeed || 0;
    const windGust = ctx.windGust || windSpeed;
    const expWind = ctx.expectedWindSpeed || windSpeed;
    const prob = ctx.modelProbability;
    const unc = ctx.uncertaintyScore;

    // Component 1: Peak Gust Velocity (0–40 pts)
    const gustScore = Math.min(40, (windGust / 60.0) * 40.0);

    // Component 2: Sustained / Forecast Wind (0–35 pts)
    const sustainedScore = Math.min(35, (Math.max(windSpeed, expWind) / 45.0) * 35.0);

    // Component 3: Gale Wind Probability (0–25 pts)
    const probScore = prob * 25.0;

    const rawScore = gustScore + sustainedScore + probScore;
    const uncPenalty = Number((unc * 6.0).toFixed(1));
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - uncPenalty)));

    const riskLevel = scoreToRiskLevel(finalScore);

    const factors: RiskExplanationFactor[] = [
      {
        factorName: 'windGust',
        factorValue: Number(windGust.toFixed(1)),
        relativeContribution: Number((gustScore / (rawScore || 1)).toFixed(2)),
        direction: windGust > 45 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Observed / projected peak wind gust of ${windGust.toFixed(1)} km/h.`,
      },
      {
        factorName: 'expectedWindSpeed',
        factorValue: Number(expWind.toFixed(1)),
        relativeContribution: Number((sustainedScore / (rawScore || 1)).toFixed(2)),
        direction: expWind > 35 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Sustained wind velocity forecast of ${expWind.toFixed(1)} km/h (+${ctx.horizonMinutes}m).`,
      },
    ];

    const summary =
      finalScore >= 60
        ? `Strong wind hazard risk (${finalScore}/100) driven by high velocity gusts of ${windGust.toFixed(1)} km/h.`
        : `Wind velocity parameters within nominal environmental range (${finalScore}/100).`;

    return {
      hazardType: this.hazardType,
      rawRiskScore: Math.round(rawScore),
      finalRiskScore: finalScore,
      riskLevel,
      modelProbability: prob,
      uncertaintyPenalty: uncPenalty,
      contributingFactors: factors,
      summary,
    };
  }
}

export class ExtremeRainfallStrategy implements HazardStrategy {
  hazardType: HazardType = 'EXTREME_RAINFALL';

  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult {
    const rainExp = ctx.expectedRainfallRate || 0;
    const rainObs = ctx.rainfallRate || 0;
    const rainAccum = ctx.rollingRainAccum60m || rainObs;
    const prob = ctx.modelProbability;
    const unc = ctx.uncertaintyScore;

    // Extreme rainfall requires high threshold exceedance (e.g. >= 30mm/h or >= 50mm accum)
    const peakRate = Math.max(rainExp, rainObs);
    const rateScore = Math.min(50, (peakRate / 50.0) * 50.0);
    const accumScore = Math.min(30, (rainAccum / 60.0) * 30.0);
    const probScore = prob * 20.0;

    const rawScore = rateScore + accumScore + probScore;
    const uncPenalty = Number((unc * 10.0).toFixed(1));
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - uncPenalty)));

    const riskLevel = scoreToRiskLevel(finalScore);

    const factors: RiskExplanationFactor[] = [
      {
        factorName: 'expectedRainfallRate',
        factorValue: Number(peakRate.toFixed(1)),
        relativeContribution: Number((rateScore / (rawScore || 1)).toFixed(2)),
        direction: peakRate > 25 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `Peak precipitation intensity reaching ${peakRate.toFixed(1)} mm/h.`,
      },
      {
        factorName: 'rollingRainAccum60m',
        factorValue: Number(rainAccum.toFixed(1)),
        relativeContribution: Number((accumScore / (rawScore || 1)).toFixed(2)),
        direction: rainAccum > 30 ? 'INCREASES_RISK' : 'NEUTRAL',
        explanationText: `1-hour cumulative rainfall reached ${rainAccum.toFixed(1)} mm.`,
      },
    ];

    return {
      hazardType: this.hazardType,
      rawRiskScore: Math.round(rawScore),
      finalRiskScore: finalScore,
      riskLevel,
      modelProbability: prob,
      uncertaintyPenalty: uncPenalty,
      contributingFactors: factors,
      summary:
        finalScore >= 60
          ? `Critical extreme rainfall surge detected (${finalScore}/100) approaching urban flash flood thresholds.`
          : `Precipitation metrics below extreme inundation thresholds (${finalScore}/100).`,
    };
  }
}

export class SevereWeatherCompositeStrategy implements HazardStrategy {
  hazardType: HazardType = 'SEVERE_WEATHER';

  private rainStrategy = new HeavyRainStrategy();
  private stormStrategy = new ThunderstormStrategy();
  private windStrategy = new StrongWindStrategy();

  evaluate(ctx: HazardEvaluationContext): HazardStrategyResult {
    const rRes = this.rainStrategy.evaluate(ctx);
    const sRes = this.stormStrategy.evaluate(ctx);
    const wRes = this.windStrategy.evaluate(ctx);

    // Composite takes dominant hazard score + cross-coupling bonus
    const maxScore = Math.max(rRes.finalRiskScore, sRes.finalRiskScore, wRes.finalRiskScore);
    const multiHazardBonus = (rRes.finalRiskScore > 40 && sRes.finalRiskScore > 40) ? 5 : 0;
    const finalScore = Math.min(100, maxScore + multiHazardBonus);

    const riskLevel = scoreToRiskLevel(finalScore);

    const allFactors = [...rRes.contributingFactors, ...sRes.contributingFactors, ...wRes.contributingFactors]
      .sort((a, b) => b.relativeContribution - a.relativeContribution)
      .slice(0, 4);

    return {
      hazardType: this.hazardType,
      rawRiskScore: maxScore,
      finalRiskScore: finalScore,
      riskLevel,
      modelProbability: Math.max(rRes.modelProbability, sRes.modelProbability, wRes.modelProbability),
      uncertaintyPenalty: rRes.uncertaintyPenalty,
      contributingFactors: allFactors,
      summary: `Multi-hazard composite risk index evaluated at ${finalScore}/100 (${riskLevel}).`,
    };
  }
}

export const HAZARD_STRATEGIES: Record<HazardType, HazardStrategy> = {
  HEAVY_RAIN: new HeavyRainStrategy(),
  THUNDERSTORM: new ThunderstormStrategy(),
  STRONG_WIND: new StrongWindStrategy(),
  EXTREME_RAINFALL: new ExtremeRainfallStrategy(),
  SEVERE_WEATHER: new SevereWeatherCompositeStrategy(),
};
