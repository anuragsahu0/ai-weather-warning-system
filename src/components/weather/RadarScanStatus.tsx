import { Radio, Database, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useLocation } from '../../context/LocationContext.js';

export function RadarScanStatus() {
  const { currentLocation } = useLocation();

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Radar Ingestion Status
        </CardTitle>
        <Badge variant="standby">Awaiting Ingest Stream</Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Active Sector:</span>
          </div>
          <span className="font-semibold text-foreground font-mono">{currentLocation.district} ({currentLocation.gridId})</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Scan Cycle Frequency:</span>
          </div>
          <span className="font-mono text-muted-foreground">Every 10 min (Standard Volume Scan)</span>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-dashed border-border/70 text-center">
          <p className="text-[11px] text-muted-foreground">
            Real Doppler Weather Radar (DWR) composite data feeds will be connected during Phase 2.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
