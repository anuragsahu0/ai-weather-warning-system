import { Clock } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { HorizonNowcast } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface NowcastTimelineSliderProps {
  selectedHorizon: number;
  onSelectHorizon: (h: number) => void;
  horizons?: HorizonNowcast[];
}

export function NowcastTimelineSlider({
  selectedHorizon,
  onSelectHorizon,
  horizons = [],
}: NowcastTimelineSliderProps) {
  const steps = [
    { label: 'NOW', horizon: 0 },
    { label: '+10 MIN', horizon: 10 },
    { label: '+20 MIN', horizon: 20 },
    { label: '+30 MIN', horizon: 30 },
    { label: '+60 MIN', horizon: 60 },
  ];

  return (
    <div className="p-4 rounded-xl bg-card/70 border border-border/70 backdrop-blur-md shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Spatiotemporal Evolution Timeline (0–60 Min Lead Time)
          </span>
        </div>
        <Badge variant="radar" className="font-mono text-[10px]">
          ConvLSTM Multi-Horizon Head
        </Badge>
      </div>

      {/* Interactive Step Slider Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step) => {
          const isSelected = selectedHorizon === step.horizon;
          const hData = horizons.find((h) => h.horizonMinutes === step.horizon);

          return (
            <Button
              key={step.label}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectHorizon(step.horizon)}
              className={cn(
                'h-auto py-2 flex flex-col items-center gap-1 font-mono transition-all',
                isSelected
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-mission-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] border-cyan-300'
                  : 'bg-card/40 hover:bg-muted/40 border-border/60 text-muted-foreground'
              )}
            >
              <span className="text-[11px] font-bold tracking-wider">{step.label}</span>
              {step.horizon > 0 && hData ? (
                <div className="flex items-center gap-1 text-[10px]">
                  <span className={isSelected ? 'font-bold text-mission-950' : 'text-cyan-300'}>
                    {hData.expectedRainfall.toFixed(1)} mm/h
                  </span>
                </div>
              ) : (
                <span className="text-[9px] text-muted-foreground/80">Observed</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
