import { ShieldAlert, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { HorizonNowcast } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface UncertaintyIndicatorProps {
  horizonData?: HorizonNowcast;
}

export function UncertaintyIndicator({ horizonData }: UncertaintyIndicatorProps) {
  if (!horizonData) return null;

  const { expectedRainfall, rainfallConfidenceInterval, uncertaintyScore, severity } = horizonData;
  const uncertaintyPct = Math.round(uncertaintyScore * 100);

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Predictive Uncertainty & Confidence Interval (+{horizonData.horizonMinutes}m)
          </CardTitle>
        </div>
        <Badge
          variant={severity === 'SEVERE' || severity === 'HIGH' ? 'high' : 'operational'}
          className="font-mono text-xs"
        >
          {severity} SEVERITY
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono text-xs">
        {/* Continuous Interval Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-mission-950/60 border border-border/40 space-y-1">
            <div className="text-[10px] uppercase text-muted-foreground">Expected Rainfall Rate</div>
            <div className="text-xl font-bold text-cyan-300">
              {expectedRainfall.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">mm/h</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              90% CI: <strong className="text-foreground">[{rainfallConfidenceInterval.lower.toFixed(1)} – {rainfallConfidenceInterval.upper.toFixed(1)} mm/h]</strong>
            </div>
          </div>

          {/* Uncertainty Meter */}
          <div className="p-3 rounded-lg bg-mission-950/60 border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
              <span>MC Dropout Variance:</span>
              <span className="font-bold text-foreground">{uncertaintyPct}% Dispersion</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-mission-900 border border-border/50 overflow-hidden">
              <div
                style={{ width: `${uncertaintyPct}%` }}
                className={cn(
                  'h-full transition-all',
                  uncertaintyPct >= 60
                    ? 'bg-amber-500'
                    : uncertaintyPct >= 35
                    ? 'bg-cyan-500'
                    : 'bg-emerald-500'
                )}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0% Narrow Band</span>
              <span>100% High Dispersion</span>
            </div>
          </div>
        </div>

        {/* Hazard Event Probabilities */}
        <div className="space-y-1.5 border-t border-border/30 pt-3">
          <div className="text-[10px] uppercase text-muted-foreground">Calibrated Event Probabilities</div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground block text-[9px]">Heavy Rain (&ge; 15 mm/h)</span>
              <strong className="text-foreground text-sm">
                {Math.round(horizonData.eventProbabilities.heavyRain * 100)}%
              </strong>
            </div>
            <div className="p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground block text-[9px]">Convective Surge</span>
              <strong className="text-foreground text-sm">
                {Math.round(horizonData.eventProbabilities.severeConvective * 100)}%
              </strong>
            </div>
            <div className="p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground block text-[9px]">Gale Gust (&ge; 50 km/h)</span>
              <strong className="text-foreground text-sm">
                {Math.round(horizonData.eventProbabilities.galeWind * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Official Warning Distinction Alert */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/40 text-[10px] text-amber-300/90">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>SCIENTIFIC DISTINCTION:</strong> This output is an experimental AI/ML spatiotemporal nowcast with bounded statistical uncertainty. It does <em>not</em> constitute an official government weather warning.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
