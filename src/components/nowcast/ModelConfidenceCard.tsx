import { Award, Binary } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function ModelConfidenceCard() {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Model Verification & Confidence
        </CardTitle>
        <Badge variant="standby">Awaiting Evaluation</Badge>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase font-mono">CSI Index</div>
            <div className="text-lg font-bold font-mono text-muted-foreground/60 my-1">--</div>
            <span className="text-[9px] text-muted-foreground">Critical Success</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase font-mono">FAR Ratio</div>
            <div className="text-lg font-bold font-mono text-muted-foreground/60 my-1">--</div>
            <span className="text-[9px] text-muted-foreground">False Alarm</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase font-mono">POD Score</div>
            <div className="text-lg font-bold font-mono text-muted-foreground/60 my-1">--</div>
            <span className="text-[9px] text-muted-foreground">Detection Prob</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Ensemble Spread:</span>
          </div>
          <span className="font-mono text-muted-foreground">-- (Not active)</span>
        </div>
      </CardContent>
    </Card>
  );
}
