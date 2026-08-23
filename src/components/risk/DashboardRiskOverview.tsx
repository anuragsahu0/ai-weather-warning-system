import { ShieldAlert, MapPin, Gauge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useRiskOverview } from '../../hooks/useRiskAssessment.js';
import { useLocation } from '../../context/LocationContext.js';

export function DashboardRiskOverview() {
  const { overview, isLoading } = useRiskOverview();
  const { currentLocation } = useLocation();

  if (isLoading || !overview) {
    return (
      <Card className="bg-white border-slate-200/90 rounded-3xl p-6 text-center text-xs font-mono text-slate-500 shadow-sm">
        Evaluating regional hazard risk levels across active 1.1km grid cells...
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200/90 rounded-3xl shadow-sm space-y-2">
      <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Current Risk Intelligence Overview
            </CardTitle>
            <p className="text-xs text-slate-500">
              Dynamic 0–100 risk synthesis across active 1.1km grid cells in {currentLocation.district}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="operational" className="font-mono text-xs py-0.5">
            Data Quality: {overview.dataQualityStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {/* Active Hotspots */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block">
              Active Hotspots
            </span>
            <span className="text-2xl font-extrabold text-blue-600 block mt-1.5">
              {overview.activeHotspotsCount}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Contiguous Clusters</span>
          </div>

          {/* Highest Risk Hazard */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block">
              Primary Hazard
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-1.5 truncate">
              {overview.highestRiskHazard.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">{currentLocation.district} Sector</span>
          </div>

          {/* Peak Risk Score */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block">
              Peak Risk Score
            </span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1.5">
              {overview.peakRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">{overview.highestRiskLevel} Level</span>
          </div>

          {/* Max Model Probability */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block">
              Max Model Prob
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">
              {Math.round(overview.maxModelProbability * 100)}%
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">ConvLSTM Probability</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 gap-2">
          <span className="flex items-center gap-1.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Evaluated Grids: <strong className="text-slate-900">{overview.evaluatedGridsCount} Discrete 1.1km Cells</strong>
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            Hysteresis Damped State Machine Active (61/56)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
