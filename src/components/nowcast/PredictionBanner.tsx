import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { MLPredictionResult } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface PredictionBannerProps {
  prediction?: MLPredictionResult;
  isLoading?: boolean;
}

export function PredictionBanner({ prediction, isLoading }: PredictionBannerProps) {
  if (isLoading || !prediction) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-6 text-center text-xs font-mono text-muted-foreground">
        Loading AI/ML baseline nowcast prediction...
      </Card>
    );
  }

  const isModelReady = prediction.status === 'MODEL_READY';
  const isStale = prediction.status === 'STALE_INPUT_DATA';
  const probPercent = Math.round(prediction.probability * 100);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border backdrop-blur-md shadow-xl transition-all',
        prediction.prediction && isModelReady
          ? 'bg-rose-950/30 border-rose-500/50'
          : isModelReady
          ? 'bg-card/60 border-border/70'
          : 'bg-amber-950/20 border-amber-500/40'
      )}
    >
      <CardContent className="p-5 space-y-4">
        {/* Top Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
              {prediction.task.replace('_', ' ')} NOWCAST ({prediction.horizonMinutes}M HORIZON)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                isModelReady
                  ? prediction.prediction
                    ? 'high'
                    : 'operational'
                  : isStale
                  ? 'standby'
                  : 'secondary'
              }
              className="font-mono text-xs font-bold uppercase"
            >
              {prediction.status.replace(/_/g, ' ')}
            </Badge>

            <Badge variant="radar" className="font-mono text-[10px]">
              {prediction.modelVersion}
            </Badge>
          </div>
        </div>

        {/* Center Prediction & Probability HUD */}
        {isModelReady ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Risk Decision */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">
                Convective Hazard Classification
              </div>
              <div className="flex items-center gap-2">
                {prediction.prediction ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <span className="text-lg font-bold font-mono text-foreground">
                  {prediction.prediction ? 'CONVECTIVE HAZARD LIKELY' : 'NO SEVERE CONVECTION DETECTED'}
                </span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Decision Threshold: {(prediction.decisionThreshold * 100).toFixed(0)}% (Tuned on Val Split)
              </div>
            </div>

            {/* Probability Score Bar */}
            <div className="space-y-1.5 md:border-x md:border-border/40 md:px-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Calibrated Probability:</span>
                <span className="font-bold text-foreground text-sm">{probPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-mission-950 border border-border/60 overflow-hidden">
                <div
                  style={{ width: `${probPercent}%` }}
                  className={cn(
                    'h-full transition-all duration-500',
                    probPercent >= 70
                      ? 'bg-rose-500'
                      : probPercent >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                <span>0% Safe</span>
                <span>Severity: {prediction.severityLevel}</span>
                <span>100% Severe</span>
              </div>
            </div>

            {/* Provenance & Freshness */}
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Feature Age: {prediction.dataFreshnessSeconds}s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Algorithm: {prediction.algorithm}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
                <Activity className="w-3.5 h-3.5" />
                <span>Target Window: Next {prediction.horizonMinutes} Minutes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40 text-center space-y-1.5">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-xs font-mono font-bold text-foreground uppercase">
              {prediction.status.replace(/_/g, ' ')}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground max-w-lg mx-auto">
              {prediction.explanationSummary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
