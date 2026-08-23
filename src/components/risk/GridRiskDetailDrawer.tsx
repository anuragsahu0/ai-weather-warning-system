import { Layers, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { RiskAssessmentResult } from '@shared/types/index.js';

interface GridRiskDetailDrawerProps {
  assessment?: RiskAssessmentResult;
}

export function GridRiskDetailDrawer({ assessment }: GridRiskDetailDrawerProps) {
  if (!assessment) return null;

  const { explanation, dataQuality, validUntil, modelVersion, fusionVersion } = assessment;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Risk Factor Attribution & Data Quality Audit
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="operational" className="font-mono text-xs">
            Data Quality: {dataQuality}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 font-mono text-xs">
        {/* Ranked Primary Drivers */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase text-muted-foreground font-bold">
            Ranked Atmospheric Drivers (Model Attribution)
          </span>
          <div className="space-y-1.5">
            {explanation.primaryDrivers.map((driver) => (
              <div
                key={driver.factorName}
                className="p-2 rounded bg-card/40 border border-border/40 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">{driver.factorName}</span>
                  <span className="text-[10px] text-muted-foreground">{driver.explanationText}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-cyan-300 block">
                    {Math.round(driver.relativeContribution * 100)}% Weight
                  </span>
                  <span
                    className={
                      driver.direction === 'INCREASES_RISK'
                        ? 'text-rose-400 text-[9px]'
                        : 'text-muted-foreground text-[9px]'
                    }
                  >
                    {driver.direction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
          <div>Model: <strong className="text-foreground">{modelVersion}</strong></div>
          <div>Fusion: <strong className="text-foreground">{fusionVersion}</strong></div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Valid Until: {new Date(validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
