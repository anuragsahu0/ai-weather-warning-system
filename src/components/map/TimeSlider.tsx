import { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { cn } from '../../lib/utils.js';

export function TimeSlider() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStep, setSelectedStep] = useState(4); // 0 = T-60m, 4 = NOW (T-0), 8 = T+120m, 12 = T+360m

  const timeSteps = [
    { label: 'T-60m', type: 'HISTORICAL' },
    { label: 'T-45m', type: 'HISTORICAL' },
    { label: 'T-30m', type: 'HISTORICAL' },
    { label: 'T-15m', type: 'HISTORICAL' },
    { label: 'NOW', type: 'LIVE' },
    { label: '+15m', type: 'NOWCAST' },
    { label: '+30m', type: 'NOWCAST' },
    { label: '+45m', type: 'NOWCAST' },
    { label: '+1h', type: 'NOWCAST' },
    { label: '+2h', type: 'NOWCAST' },
    { label: '+3h', type: 'NOWCAST' },
    { label: '+4h', type: 'NOWCAST' },
    { label: '+6h', type: 'NOWCAST' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-xs"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Scrubber' : 'Play Timeline'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-xs text-muted-foreground"
          onClick={() => setSelectedStep(4)}
          title="Reset to Live Now"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <div className="text-[11px] font-mono px-2 py-1 rounded bg-background/60 border border-border/50">
          <span className="text-muted-foreground mr-1">FRAME:</span>
          <span className="font-semibold text-foreground">{timeSteps[selectedStep].label}</span>
          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary uppercase">
            {timeSteps[selectedStep].type}
          </span>
        </div>
      </div>

      {/* Interactive Step Track */}
      <div className="flex-1 w-full flex items-center gap-1 overflow-x-auto py-1">
        {timeSteps.map((step, idx) => {
          const isSelected = selectedStep === idx;
          const isLive = step.type === 'LIVE';
          const isNowcast = step.type === 'NOWCAST';

          return (
            <button
              key={step.label}
              type="button"
              onClick={() => setSelectedStep(idx)}
              className={cn(
                'flex-1 min-w-[42px] py-1 px-1.5 rounded text-center font-mono text-[10px] transition-all border',
                isSelected
                  ? 'bg-primary text-primary-foreground font-bold border-primary shadow-sm scale-105'
                  : isLive
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                  : isNowcast
                  ? 'bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent'
                  : 'bg-background/40 text-muted-foreground/80 border-border/30 hover:bg-accent'
              )}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
