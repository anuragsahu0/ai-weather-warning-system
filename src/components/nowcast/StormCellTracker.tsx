import { Navigation } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function StormCellTracker() {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Convective Storm Cell Motion Tracker
        </CardTitle>
        <Badge variant="awaiting">0 Cells Tracked</Badge>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground block font-mono uppercase">Centroid Coords</span>
            <span className="font-mono font-semibold text-muted-foreground/60 text-sm mt-1 block">--</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground block font-mono uppercase">Cell Velocity</span>
            <span className="font-mono font-semibold text-muted-foreground/60 text-sm mt-1 block">-- km/h</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground block font-mono uppercase">Heading / Azimuth</span>
            <span className="font-mono font-semibold text-muted-foreground/60 text-sm mt-1 block">-- °</span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
            <span className="text-[10px] text-muted-foreground block font-mono uppercase">Estimated ETA</span>
            <span className="font-mono font-semibold text-muted-foreground/60 text-sm mt-1 block">-- min</span>
          </div>
        </div>

        <div className="p-3 text-center rounded-lg border border-dashed border-border/70 text-muted-foreground">
          <p className="text-[11px]">
            No convective storm cell clusters identified in the current radar volume.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
