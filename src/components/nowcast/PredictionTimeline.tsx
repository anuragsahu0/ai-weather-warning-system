import { Clock, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function PredictionTimeline() {
  const intervals = [
    { step: '+15 min', time: 'T+15m' },
    { step: '+30 min', time: 'T+30m' },
    { step: '+45 min', time: 'T+45m' },
    { step: '+60 min', time: 'T+1h' },
    { step: '+120 min', time: 'T+2h' },
    { step: '+180 min', time: 'T+3h' },
    { step: '+240 min', time: 'T+4h' },
    { step: '+360 min', time: 'T+6h' },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            0–6 Hour Prediction Timeline
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            15-minute hyper-local nowcasting intervals
          </p>
        </div>
        <Badge variant="standby" className="font-mono text-[10px]">
          MODEL ENGINE IDLE
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {intervals.map((interval) => (
            <div
              key={interval.step}
              className="p-3 rounded-lg bg-background/50 border border-border/60 flex flex-col justify-between text-center space-y-2"
            >
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-foreground">{interval.step}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{interval.time}</span>
              </div>

              <div className="py-2 border-y border-border/30">
                <div className="font-mono text-base font-bold text-muted-foreground/60">--</div>
                <div className="text-[9px] text-muted-foreground uppercase">mm/h rate</div>
              </div>

              <Badge variant="awaiting" className="text-[9px] px-1 py-0 justify-center">
                Awaiting
              </Badge>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-dashed border-border/70 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>AI Model Architecture:</strong> ConvLSTM + Spatial Optical Flow ensemble pipeline will generate 15-minute nowcasts in Phase 7.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
