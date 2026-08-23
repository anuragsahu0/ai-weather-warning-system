export class TemporalAligner {
  private defaultMaxWindowSeconds = 900; // 15 Minutes

  isWithinTemporalWindow(
    targetTimestamp: string,
    sourceTimestamp: string,
    maxWindowSeconds = this.defaultMaxWindowSeconds
  ): boolean {
    const targetMs = new Date(targetTimestamp).getTime();
    const sourceMs = new Date(sourceTimestamp).getTime();
    if (isNaN(targetMs) || isNaN(sourceMs)) return false;

    const diffSeconds = Math.abs(targetMs - sourceMs) / 1000;
    return diffSeconds <= maxWindowSeconds;
  }

  computeTemporalWeight(
    targetTimestamp: string,
    sourceTimestamp: string,
    decayHalfLifeSeconds = 600 // 10 Minutes
  ): number {
    const targetMs = new Date(targetTimestamp).getTime();
    const sourceMs = new Date(sourceTimestamp).getTime();
    if (isNaN(targetMs) || isNaN(sourceMs)) return 0.0;

    const diffSeconds = Math.abs(targetMs - sourceMs) / 1000;
    // Exponential decay weight: w = 2^(-dt / halfLife)
    const weight = Math.pow(2, -diffSeconds / decayHalfLifeSeconds);
    return Math.max(0.1, Math.min(1.0, Number(weight.toFixed(3))));
  }
}

export const temporalAligner = new TemporalAligner();
