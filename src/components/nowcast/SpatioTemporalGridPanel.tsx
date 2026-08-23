import { Wind, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { SpatialRiskContribution } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface SpatioTemporalGridPanelProps {
  contributions: SpatialRiskContribution[];
  centerGridId: string;
}

export function SpatioTemporalGridPanel({
  contributions,
  centerGridId,
}: SpatioTemporalGridPanelProps) {
  if (!contributions || contributions.length === 0) return null;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            3x3 Spatial Grid Neighborhood ($H \times W$ Propagation Context)
          </CardTitle>
        </div>
        <Badge variant="radar" className="font-mono text-xs">
          1.1 km Grid Centroid
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono text-xs">
        <div className="text-[11px] text-muted-foreground">
          Spatial influence weights learned by ConvLSTM kernels capturing convective cloud propagation:
        </div>

        {/* 3x3 Grid Matrix */}
        <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
          {contributions.slice(0, 9).map((cell, idx) => {
            const isCenter = idx === 4;
            const weightPct = Math.round(cell.relativeWeight * 100);

            return (
              <div
                key={cell.gridId}
                className={cn(
                  'p-2.5 rounded-lg border text-center space-y-1 transition-all',
                  isCenter
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : cell.isUpwind
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-card/40 border-border/40'
                )}
              >
                <div className="text-[10px] font-bold text-foreground flex items-center justify-center gap-1">
                  {cell.isUpwind && <Wind className="w-3 h-3 text-rose-400 shrink-0" />}
                  <span>{isCenter ? 'TARGET (CENTER)' : cell.gridId.split('_').pop()}</span>
                </div>
                <div className="text-xs font-bold text-cyan-300">{weightPct}% Weight</div>
                <div className="text-[9px] text-muted-foreground">
                  {isCenter ? '0.0 km' : `${cell.distanceKm.toFixed(1)} km`}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-500 inline-block" />
            <span>Upwind Vector (Outflow Boundary)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400 inline-block" />
            <span>Target Centroid ({centerGridId})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
