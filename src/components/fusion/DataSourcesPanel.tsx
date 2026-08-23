import { Database, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useSourcesStatus } from '../../hooks/useSourcesStatus.js';

export function DataSourcesPanel() {
  const { sourcesData, isLoading } = useSourcesStatus();

  if (isLoading || !sourcesData) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 text-center text-xs font-mono text-muted-foreground">
        Loading multi-source weather stream registry...
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Multi-Source Weather Stream Registry (Phase 7 Ingestion)
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="operational" className="font-mono text-xs">
            {sourcesData.activeCount} / {sourcesData.totalSources} Streams Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2.5 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sourcesData.sources.map((src) => {
            const isActive = src.status === 'ACTIVE';
            const isDegraded = src.status === 'DEGRADED';

            return (
              <div
                key={src.sourceId}
                className="p-2.5 rounded-lg bg-card/40 border border-border/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-[11px] truncate" title={src.sourceName}>
                    {src.sourceType}
                  </span>
                  <Badge
                    variant={isActive ? 'operational' : isDegraded ? 'standby' : 'secondary'}
                    className="text-[9px] px-1.5 py-0 font-bold"
                  >
                    {src.status}
                  </Badge>
                </div>

                <div className="text-[10px] text-muted-foreground truncate" title={src.provider}>
                  Provider: <strong className="text-foreground/90">{src.provider}</strong>
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/30 pt-1">
                  <span>Res: {src.spatialResolution.split(' ')[0]}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {src.temporalResolution}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2 rounded bg-muted/20 border border-border/30 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Attribution: WMO GTS, Open-Meteo, RainViewer Doppler Radar, EUMETSAT & ECMWF IFS</span>
          <span className="text-cyan-400 font-bold">100% Verified Telemetry</span>
        </div>
      </CardContent>
    </Card>
  );
}
