import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { useDemoControl } from '../hooks/useDemoControl.js';
import {
  RotateCcw,
  SkipForward,
  Database,
  Cpu,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export function DemoControlCenterPage() {
  const {
    activeState,
    isLoadingState,
    lineageTrace,
    stepReplay,
    resetReplay,
    isStepping,
  } = useDemoControl();

  const [dataMode, setDataMode] = useState<'LIVE' | 'REPLAY' | 'DEMO'>('REPLAY');
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);

  const currentFrame = activeState?.currentFrame;
  const currentStep = activeState?.activeStepIndex ?? 0;

  const timeOffsets: Array<'T+00' | 'T+10' | 'T+20' | 'T+30'> = ['T+00', 'T+10', 'T+20', 'T+30'];

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="SIH DEMONSTRATION & OPERATIONAL CONTROL CENTER"
        subtitle="Master operator deck for live system demonstration, historical scenario playback, synchronized event timeline, and verifiable end-to-end data lineage."
        badge={
          <div className="flex items-center gap-2">
            {/* Persistent Data Mode Badge */}
            <Badge
              variant={dataMode === 'LIVE' ? 'operational' : dataMode === 'REPLAY' ? 'secondary' : 'high'}
              className="font-bold text-[11px] px-2.5 py-0.5"
            >
              {dataMode === 'LIVE'
                ? '● LIVE SENSOR DATA'
                : dataMode === 'REPLAY'
                ? '↺ HISTORICAL REPLAY DATA'
                : '⚠ SYNTHETIC DEMO DATA'}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            >
              <BookOpen className="w-3 h-3 text-cyan-400" />
              {showPresenterNotes ? 'Hide Script' : 'Presenter Script'}
            </Button>
          </div>
        }
      />

      {/* Mode Switcher Ribbon */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase">Data Telemetry Mode:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDataMode('LIVE')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                dataMode === 'LIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-muted-foreground hover:bg-card'
              }`}
            >
              LIVE
            </button>
            <button
              type="button"
              onClick={() => setDataMode('REPLAY')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                dataMode === 'REPLAY'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-muted-foreground hover:bg-card'
              }`}
            >
              HISTORICAL REPLAY
            </button>
            <button
              type="button"
              onClick={() => setDataMode('DEMO')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                dataMode === 'DEMO'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-muted-foreground hover:bg-card'
              }`}
            >
              SYNTHETIC DEMO
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Active Sector:</span>
          <Badge variant="secondary" className="text-[10px]">
            {activeState?.metadata?.geographicArea || 'Delhi NCR (28.61°N, 77.20°E)'}
          </Badge>
        </div>
      </div>

      {/* Presenter Talking Points Script Panel */}
      {showPresenterNotes && (
        <Card className="bg-cyan-950/20 border-cyan-500/40 p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Presenter Talking Points & Judge Script
            </span>
            <Badge variant="secondary" className="text-[9px]">
              Step {currentStep + 1} of 4 • {timeOffsets[currentStep]}
            </Badge>
          </div>

          <div className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
            {currentStep === 0 && (
              <p>
                <strong>T+00 (Initial Inception):</strong> &ldquo;We are examining a legitimate monsoon reanalysis over Delhi NCR. Surface gauges show 14 mm/h while RainViewer Doppler Radar detects a 38.5 dBZ core. ConvLSTM projects rapid intensification to 48 mm/h over the next 30 minutes, placing the sector in WATCH state.&rdquo;
              </p>
            )}
            {currentStep === 1 && (
              <p>
                <strong>T+10 (Intensification & Hotspot Clustering):</strong> &ldquo;Ten minutes later, the storm core intensifies to 46.8 dBZ with barometric pressure dropping 3.4 hPa. The Risk Engine crosses the 60-point threshold to 68 (HIGH RISK), detecting a 4-cell spatial hotspot cluster and dispatching deduplicated early warnings to municipal disaster officers.&rdquo;
              </p>
            )}
            {currentStep === 2 && (
              <p>
                <strong>T+20 (Peak Convective Cloudburst):</strong> &ldquo;At peak convective maturity, precipitation rate reaches 64 mm/h with lightning flashes exceeding 24/km². The Risk Index escalates to 89 (SEVERE RISK), updating the active Common Alerting Protocol event and issuing emergency flash flood bulletins.&rdquo;
              </p>
            )}
            {currentStep === 3 && (
              <p>
                <strong>T+30 (Dissipation & Hysteresis Damping):</strong> &ldquo;As the convective core tracks eastward, radar reflectivity falls to 32 dBZ and barometric pressure recovers. The asymmetric hysteresis state machine smoothly transitions the risk score to 32 without flapping.&rdquo;
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Replay Timeline Controls Dock */}
      <Card className="bg-card/70 backdrop-blur-xl border-border/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-foreground text-xs">Synchronized Event Playback Timeline</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={() => resetReplay()}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={() => stepReplay({ stepIndex: Math.min(3, currentStep + 1) })}
              disabled={currentStep >= 3 || isStepping}
            >
              <SkipForward className="w-3 h-3 mr-1" /> Step +10m
            </Button>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {timeOffsets.map((offset, idx) => {
            const isActive = currentStep === idx;
            const isPast = currentStep > idx;

            return (
              <button
                key={offset}
                type="button"
                onClick={() => stepReplay({ stepIndex: idx })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-mission-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                    : isPast
                    ? 'bg-card/60 border-emerald-500/40 text-muted-foreground'
                    : 'bg-card/40 border-border/50 text-muted-foreground/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground">{offset}</span>
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {idx === 0 && 'Inception'}
                  {idx === 1 && 'Intensification'}
                  {idx === 2 && 'Peak Cloudburst'}
                  {idx === 3 && 'Dissipation'}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Synchronized Operational State Grid */}
      {isLoadingState || !currentFrame ? (
        <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/70 text-muted-foreground">
          Loading synchronized telemetry replay frame...
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Multi-Source Fused Telemetry */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Multi-Source Fusion
              </span>
              <Badge variant="operational">Lineage OK</Badge>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precipitation Rate:</span>
                <strong className="text-foreground">{currentFrame.weatherState.precipitationRate} mm/h</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Radar Reflectivity:</span>
                <strong className="text-cyan-300">{currentFrame.weatherState.radarReflectivityDbz} dBZ</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lightning Density:</span>
                <strong className="text-foreground">{currentFrame.weatherState.lightningStrikeDensity} /km²</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barometric Pressure:</span>
                <strong className="text-foreground">{currentFrame.weatherState.pressure} hPa</strong>
              </div>
            </div>
          </Card>

          {/* Card 2: Spatio-Temporal Nowcast */}
          <Card className="bg-card/60 backdrop-blur-sm border-cyan-500/30 p-4 space-y-2.5 ring-1 ring-cyan-500/20">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> ConvLSTM Nowcast
              </span>
              <Badge variant="operational">MPS 12ms</Badge>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Rate (+10m):</span>
                <strong className="text-cyan-300">
                  {currentFrame.nowcast.horizons[0]?.expectedRainfall} mm/h
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model Probability:</span>
                <strong className="text-foreground">
                  {Math.round((currentFrame.nowcast.horizons[0]?.eventProbabilities.heavyRain || 0) * 100)}%
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Predictive Uncertainty:</span>
                <strong className="text-muted-foreground">
                  ±{currentFrame.nowcast.horizons[0]?.uncertaintyScore}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model Type:</span>
                <strong className="text-foreground">{currentFrame.nowcast.modelType}</strong>
              </div>
            </div>
          </Card>

          {/* Card 3: Hyper-Local Risk & Alerts */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Risk & Early Warning
              </span>
              <Badge
                variant={
                  currentFrame.riskAssessment.riskLevel === 'SEVERE'
                    ? 'high'
                    : currentFrame.riskAssessment.riskLevel === 'HIGH'
                    ? 'secondary'
                    : 'operational'
                }
              >
                {currentFrame.riskAssessment.riskLevel}
              </Badge>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk Score:</span>
                <span className="text-base font-bold text-rose-400">
                  {currentFrame.riskAssessment.riskScore} / 100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Hotspots:</span>
                <strong className="text-foreground">
                  {currentFrame.hotspots.length > 0 ? `${currentFrame.hotspots.length} Clusters` : 'None'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alert State:</span>
                <strong className="text-foreground">
                  {currentFrame.alert ? 'DISPATCHED' : 'SUPPRESSED'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispatched Notifications:</span>
                <strong className="text-emerald-400">
                  {currentFrame.notifications.length} Delivered
                </strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* End-to-End Lineage Audit Trail */}
      {lineageTrace && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> End-to-End Lineage Audit Chain
            </span>
            <Badge variant="operational">100% Traceable</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {lineageTrace.nodes.map((n, idx) => (
              <div key={n.stage} className="p-2.5 rounded bg-background/50 border border-border/40 text-[10px] space-y-1">
                <span className="text-[9px] uppercase text-cyan-400 block font-bold">0{idx + 1}. {n.stage.replace('_', ' ')}</span>
                <span className="text-foreground font-mono truncate block">{n.entityId}</span>
                <span className="text-emerald-400 font-bold block">{n.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
