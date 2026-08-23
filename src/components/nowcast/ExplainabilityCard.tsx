import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { MLPredictionResult } from '@shared/types/index.js';

interface ExplainabilityCardProps {
  prediction?: MLPredictionResult;
}

export function ExplainabilityCard({ prediction }: ExplainabilityCardProps) {
  if (!prediction || prediction.status !== 'MODEL_READY') return null;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Why This Prediction? (Feature Attribution & Risk Contributors)
          </CardTitle>
        </div>
        <Badge variant="radar" className="font-mono text-xs">
          Permutation Importance
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Explanatory Summary */}
        <div className="p-3 rounded-lg bg-mission-950/60 border border-border/40 text-xs font-mono text-cyan-200/90 leading-relaxed">
          {prediction.explanationSummary}
        </div>

        {/* Feature Contribution List */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono font-semibold uppercase text-muted-foreground">
            Top Predictive Atmospheric Indicators
          </div>

          <div className="space-y-2">
            {prediction.topFeatures.map((feat) => {
              const isRiskIncrease = feat.direction === 'INCREASES_RISK';
              const isRiskDecrease = feat.direction === 'DECREASES_RISK';
              const widthPct = Math.round(feat.relativeContribution * 100);

              return (
                <div
                  key={feat.featureName}
                  className="p-2.5 rounded-lg bg-card/40 border border-border/30 space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isRiskIncrease ? (
                        <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      ) : isRiskDecrease ? (
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="font-bold text-foreground">{feat.featureName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Value: <strong className="text-cyan-300">{feat.featureValue !== null ? String(feat.featureValue) : 'N/A'}</strong>
                      </span>
                      <Badge
                        variant={isRiskIncrease ? 'high' : isRiskDecrease ? 'operational' : 'secondary'}
                        className="text-[9px] px-1 py-0"
                      >
                        {feat.direction.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Relative Importance Bar */}
                  <div className="w-full h-1.5 rounded-full bg-mission-950 border border-border/40 overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={
                        isRiskIncrease
                          ? 'h-full bg-rose-500 transition-all'
                          : 'h-full bg-cyan-500 transition-all'
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scientific Attribution Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30 text-[10px] font-mono text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Feature attribution reflects statistical predictive weight in the calibrated baseline model. Feature contributions indicate atmospheric state correlations and do not imply standalone physical causality.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
