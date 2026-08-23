import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { NowcastTimelineSlider } from '../components/nowcast/NowcastTimelineSlider.js';
import { UncertaintyIndicator } from '../components/nowcast/UncertaintyIndicator.js';
import { SpatioTemporalGridPanel } from '../components/nowcast/SpatioTemporalGridPanel.js';
import { PredictionBanner } from '../components/nowcast/PredictionBanner.js';
import { ExplainabilityCard } from '../components/nowcast/ExplainabilityCard.js';
import { RiskMatrix } from '../components/nowcast/RiskMatrix.js';
import { ModelConfidenceCard } from '../components/nowcast/ModelConfidenceCard.js';
import { StormCellTracker } from '../components/nowcast/StormCellTracker.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { MapPin, SlidersHorizontal, Cpu } from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { useSpatioTemporalNowcast } from '../hooks/useSpatioTemporalNowcast.js';
import { useNowcastPrediction } from '../hooks/useNowcastPrediction.js';
import { PredictionTaskType } from '@shared/types/index.js';

export function NowcastPage() {
  const { currentLocation } = useLocation();
  const [selectedEngine, setSelectedEngine] = useState<'SPATIOTEMPORAL' | 'BASELINE'>('SPATIOTEMPORAL');
  const [selectedTask, setSelectedTask] = useState<PredictionTaskType>('HEAVY_RAIN');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);

  // Spatio-Temporal Nowcast Query (Phase 6)
  const { nowcast, isLoading: isStLoading } = useSpatioTemporalNowcast(selectedHorizon);

  // Baseline Prediction Query (Phase 5)
  const { prediction, isLoading: isBaseLoading } = useNowcastPrediction(selectedTask, selectedHorizon);

  const activeHorizonData = nowcast?.horizons?.find(
    (h) => h.horizonMinutes === (selectedHorizon === 0 ? 30 : selectedHorizon)
  ) || nowcast?.horizons?.[2];

  const centerGrid = currentLocation.gridId || 'GRID_R01_N2861_E07720';

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI SEVERE WEATHER NOWCAST STATION"
        subtitle="Deep spatiotemporal ConvLSTM neural network and statistical baselines delivering 0–60 minute hyper-local precipitation and convective hazard forecasts."
        badge={
          <Badge variant="operational" dot>
            {nowcast?.status === 'MODEL_READY' ? 'ADVANCED MODEL READY' : 'BASELINE PREDICTOR ACTIVE'}
          </Badge>
        }
      />

      {/* Model Engine Selector & Hardware HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card/70 border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-foreground">
            Prediction Engine:
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant={selectedEngine === 'SPATIOTEMPORAL' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs font-mono"
              onClick={() => setSelectedEngine('SPATIOTEMPORAL')}
            >
              Phase 6: Spatio-Temporal ConvLSTM
            </Button>
            <Button
              variant={selectedEngine === 'BASELINE' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs font-mono"
              onClick={() => setSelectedEngine('BASELINE')}
            >
              Phase 5: Baseline ML
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="radar" className="font-mono text-xs">
            Device: {nowcast?.device ? nowcast.device.toUpperCase() : 'MPS'} ACCELERATED
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs hidden sm:inline-flex">
            Target: {centerGrid}
          </Badge>
        </div>
      </div>

      {selectedEngine === 'SPATIOTEMPORAL' ? (
        <>
          {/* 1. Spatio-Temporal Evolution Timeline Slider (Phase 6) */}
          <NowcastTimelineSlider
            selectedHorizon={selectedHorizon}
            onSelectHorizon={setSelectedHorizon}
            horizons={nowcast?.horizons}
          />

          {/* 2. Predictive Uncertainty Indicator & Confidence Intervals (Phase 6) */}
          {isStLoading ? (
            <Card className="p-6 text-center text-xs font-mono text-muted-foreground">
              Computing Spatio-Temporal ConvLSTM inferences & MC Dropout variance...
            </Card>
          ) : (
            <UncertaintyIndicator horizonData={activeHorizonData} />
          )}

          {/* 3. 3x3 Spatial Grid Neighborhood Matrix (Phase 6) */}
          {nowcast?.explainability?.spatialRiskContributions && (
            <SpatioTemporalGridPanel
              contributions={nowcast.explainability.spatialRiskContributions}
              centerGridId={centerGrid}
            />
          )}
        </>
      ) : (
        <>
          {/* Phase 5 Baseline Task & Horizon Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card/60 border border-border/70 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Task:
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant={selectedTask === 'HEAVY_RAIN' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-mono"
                  onClick={() => setSelectedTask('HEAVY_RAIN')}
                >
                  Heavy Rain
                </Button>
                <Button
                  variant={selectedTask === 'SEVERE_CONVECTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-mono"
                  onClick={() => setSelectedTask('SEVERE_CONVECTIVE')}
                >
                  Severe Convection
                </Button>
                <Button
                  variant={selectedTask === 'GALE_WIND' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-mono"
                  onClick={() => setSelectedTask('GALE_WIND')}
                >
                  Gale Wind
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Horizon:
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant={selectedHorizon === 30 ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-mono"
                  onClick={() => setSelectedHorizon(30)}
                >
                  +30m
                </Button>
                <Button
                  variant={selectedHorizon === 60 ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-mono"
                  onClick={() => setSelectedHorizon(60)}
                >
                  +60m
                </Button>
              </div>
            </div>
          </div>

          {/* Phase 5 Baseline Prediction Banner & Explainability */}
          <PredictionBanner prediction={prediction} isLoading={isBaseLoading} />
          <ExplainabilityCard prediction={prediction} />
        </>
      )}

      {/* Auxiliary Meteorological Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskMatrix />
        <ModelConfidenceCard />
      </div>

      <StormCellTracker />

      {/* Spatial Impact Radius Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Spatial Impact Radius & Demographic Exposure
          </CardTitle>
          <Badge variant="operational">1.1 km² Cell Centroid</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Affected Grid Cell</span>
              <span className="text-base font-bold font-mono text-cyan-300 block mt-1">~1.1 km² Cell</span>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Sector Center</span>
              <span className="text-base font-bold font-mono text-foreground block mt-1">{currentLocation.name}</span>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">Target Coordinate</span>
              <span className="text-base font-bold font-mono text-muted-foreground block mt-1">
                {currentLocation.coordinates.latitude.toFixed(4)}°N, {currentLocation.coordinates.longitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
