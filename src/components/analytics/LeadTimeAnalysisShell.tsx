import { Timer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function LeadTimeAnalysisShell() {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Timer className="w-4 h-4 text-cyan-400" />
          Lead Time Warning Verification Matrix
        </CardTitle>
        <Badge variant="standby">Awaiting Records</Badge>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Mean Lead Time</span>
            <span className="text-lg font-bold font-mono text-muted-foreground/60 block mt-1">-- min</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Rapid Onset Accuracy</span>
            <span className="text-lg font-bold font-mono text-muted-foreground/60 block mt-1">-- %</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Early Warning Lead</span>
            <span className="text-lg font-bold font-mono text-muted-foreground/60 block mt-1">-- min</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Verification Events</span>
            <span className="text-lg font-bold font-mono text-muted-foreground/60 block mt-1">0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
