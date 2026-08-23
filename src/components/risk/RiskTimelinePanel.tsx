import { Clock, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { RiskTimelineStep } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface RiskTimelinePanelProps {
  timeline: RiskTimelineStep[];
  selectedHorizon: number;
  onSelectHorizon: (h: number) => void;
}

export function RiskTimelinePanel({
  timeline,
  selectedHorizon,
  onSelectHorizon,
}: RiskTimelinePanelProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Multi-Horizon Hazard Risk Timeline (0–60 Min)
          </CardTitle>
        </div>
        <Badge variant="radar" className="font-mono text-xs">
          Horizon-Aware Risk Evolution
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {timeline.map((step) => {
            const isSelected = selectedHorizon === step.horizonMinutes;
            const label = step.horizonMinutes === 0 ? 'NOW' : `+${step.horizonMinutes} MIN`;

            return (
              <Button
                key={step.horizonMinutes}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelectHorizon(step.horizonMinutes)}
                className={cn(
                  'h-auto py-2 flex flex-col items-center gap-1 font-mono transition-all',
                  isSelected
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-mission-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] border-cyan-300'
                    : 'bg-card/40 hover:bg-muted/40 border-border/60 text-muted-foreground'
                )}
              >
                <span className="text-[11px] font-bold tracking-wider">{label}</span>
                <Badge
                  variant={
                    step.riskLevel === 'SEVERE' || step.riskLevel === 'HIGH'
                      ? 'high'
                      : step.riskLevel === 'ELEVATED'
                      ? 'standby'
                      : 'operational'
                  }
                  className="text-[9px] px-1 py-0"
                >
                  {step.riskLevel}
                </Badge>
                <span className="text-[10px] font-bold">
                  Score: {step.riskScore}/100
                </span>
              </Button>
            );
          })}
        </div>

        {/* Selected Horizon Narrative */}
        {timeline.find((t) => t.horizonMinutes === selectedHorizon) && (
          <div className="p-3 rounded-lg bg-card/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {timeline.find((t) => t.horizonMinutes === selectedHorizon)?.summary}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
