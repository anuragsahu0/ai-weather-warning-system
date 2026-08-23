import { Flame, Compass, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useRiskHotspots } from '../../hooks/useRiskAssessment.js';
import { HazardType } from '@shared/types/index.js';

interface RiskHotspotOverlayProps {
  hazard: HazardType;
  horizon: number;
}

export function RiskHotspotOverlay({ hazard, horizon }: RiskHotspotOverlayProps) {
  const { hotspots, isLoading } = useRiskHotspots(hazard, horizon);

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Contiguous Spatial Risk Hotspots ({hazard.replace(/_/g, ' ')})
          </CardTitle>
        </div>
        <Badge
          variant={hotspots.length > 0 ? 'high' : 'operational'}
          className="font-mono text-xs font-bold"
        >
          {hotspots.length} Active Hotspot Clusters
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3 font-mono text-xs">
        {isLoading ? (
          <div className="text-muted-foreground text-center py-4">
            Scanning 1.1km grid for contiguous risk hotspots...
          </div>
        ) : hotspots.length === 0 ? (
          <div className="p-4 rounded-lg bg-mission-950/40 border border-border/40 text-center space-y-1">
            <span className="text-emerald-400 font-bold block">NO ACTIVE HAZARD HOTSPOTS</span>
            <span className="text-[10px] text-muted-foreground">
              All 1.1km grid cells in the active sector remain below elevated clustering thresholds.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {hotspots.map((h) => (
              <div
                key={h.hotspotId}
                className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Cluster: {h.hotspotId}
                  </span>
                  <Badge variant="high" className="font-bold text-[9px]">
                    {h.riskLevel} ({h.peakRiskScore}/100)
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                  <div>Affected Cells: <strong className="text-foreground">{h.affectedGridCount} Cells (~{h.affectedGridCount * 1.2} km²)</strong></div>
                  <div>Centroid: <strong className="text-foreground">{h.centroid.latitude.toFixed(3)}°N, {h.centroid.longitude.toFixed(3)}°E</strong></div>
                  <div className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    <span>Drift: {h.estimatedSpeedKmh} km/h @ {h.estimatedDirectionDeg}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
