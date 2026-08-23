import { GitCommit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { DatasetQualityReport } from '@shared/types/index.js';

interface TemporalSplitViewProps {
  report?: DatasetQualityReport;
}

export function TemporalSplitView({ report }: TemporalSplitViewProps) {
  const classBalance = report?.classBalance || {
    noneCount: 304,
    heavyRainCount: 38,
    cloudburstCount: 6,
    galeWindCount: 8,
    convectiveSurgeCount: 4,
  };

  const totalEvents =
    classBalance.heavyRainCount +
    classBalance.cloudburstCount +
    classBalance.galeWindCount +
    classBalance.convectiveSurgeCount;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Chronological Split & Class Distribution
          </CardTitle>
        </div>
        <Badge variant="radar" className="font-mono text-xs">
          Zero Future Leakage
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* 1. Visual Chronological Partition Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Chronological Time Series Partitioning (No Random Shuffling)</span>
            <span>Total: 360 Hours</span>
          </div>

          <div className="w-full h-7 rounded-lg bg-mission-950 border border-border/60 overflow-hidden flex font-mono text-[11px] font-bold text-center">
            <div
              style={{ width: '70%' }}
              className="h-full bg-cyan-600/30 border-r border-cyan-500/40 text-cyan-300 flex items-center justify-center transition-all"
              title="70% Train Partition (July 1–11, 2024)"
            >
              TRAIN (70%) • 252h
            </div>
            <div
              style={{ width: '15%' }}
              className="h-full bg-amber-600/30 border-r border-amber-500/40 text-amber-300 flex items-center justify-center transition-all"
              title="15% Validation Partition (July 11–13, 2024)"
            >
              VAL (15%)
            </div>
            <div
              style={{ width: '15%' }}
              className="h-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center transition-all"
              title="15% Test Partition (July 13–15, 2024)"
            >
              TEST (15%)
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
            <span>Start: 2024-07-01 00:00Z</span>
            <span>Val Cutoff: 2024-07-11 12:00Z</span>
            <span>Test End: 2024-07-15 23:00Z</span>
          </div>
        </div>

        {/* 2. Severe Convective Event Label Distribution */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
              Authoritative Target Labels ($Y_t$ Horizon: +15m to +60m)
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {totalEvents} Convective Events
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-card/40 border border-border/30 flex justify-between items-center">
              <span className="text-muted-foreground">Heavy Rain (≥15mm/h)</span>
              <span className="font-bold text-foreground">{classBalance.heavyRainCount}</span>
            </div>

            <div className="p-2 rounded bg-card/40 border border-border/30 flex justify-between items-center">
              <span className="text-rose-400">Cloudburst Potential</span>
              <span className="font-bold text-rose-400">{classBalance.cloudburstCount}</span>
            </div>

            <div className="p-2 rounded bg-card/40 border border-border/30 flex justify-between items-center">
              <span className="text-amber-400">Gale Gust (≥70km/h)</span>
              <span className="font-bold text-amber-400">{classBalance.galeWindCount}</span>
            </div>

            <div className="p-2 rounded bg-card/40 border border-border/30 flex justify-between items-center">
              <span className="text-blue-400">Convective Surge</span>
              <span className="font-bold text-blue-400">{classBalance.convectiveSurgeCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
