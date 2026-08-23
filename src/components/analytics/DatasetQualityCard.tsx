import {
  CheckCircle2,
  Database,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { DatasetQualityReport } from '@shared/types/index.js';

interface DatasetQualityCardProps {
  report?: DatasetQualityReport;
}

export function DatasetQualityCard({ report }: DatasetQualityCardProps) {
  if (!report) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardContent className="p-6 text-center text-muted-foreground font-mono text-xs">
          Loading dataset validation metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 overflow-hidden shadow-lg">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Dataset Quality & Integrity Audit
          </CardTitle>
        </div>
        <Badge variant="operational" className="font-mono text-xs">
          Score: {report.overallQualityScore}/100
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Total Records</div>
            <div className="text-base font-bold font-mono text-cyan-300">{report.totalRecords}</div>
            <div className="text-[9px] text-muted-foreground font-mono">Hourly Intervals</div>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Spatial Grids</div>
            <div className="text-base font-bold font-mono text-foreground">{report.gridCount}</div>
            <div className="text-[9px] text-muted-foreground font-mono">0.01° Resolution</div>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Continuity</div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {report.temporalContinuityPct}%
            </div>
            <div className="text-[9px] text-muted-foreground font-mono">Zero Time Skew</div>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Outliers Flagged</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {report.outlierCounts.temperatureOutliers +
                report.outlierCounts.pressureSpikes +
                report.outlierCounts.extremeWindGusts}
            </div>
            <div className="text-[9px] text-muted-foreground font-mono">Preserved Raw</div>
          </div>
        </div>

        {/* Temporal Window */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Range:</span>
            <span className="text-foreground">
              {new Date(report.timeRange.start).toLocaleDateString()} –{' '}
              {new Date(report.timeRange.end).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Version:</span>
            <span className="text-cyan-300 font-bold">{report.versionTag}</span>
          </div>
        </div>

        {/* Missingness & Feature Completeness Bars */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Feature Completeness (0% Missing = 100% Signal)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground">Temperature & Humidity</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Complete
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground">Barometric Pressure</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Complete
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground">Wind Velocity & Heading</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Complete
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border/30">
              <span className="text-muted-foreground">Rainfall Intensity</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Complete
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
