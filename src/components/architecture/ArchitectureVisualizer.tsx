import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { ArrowRight, Layers, Cpu, ShieldAlert, Bell, Database, CheckCircle2 } from 'lucide-react';

interface StageInfo {
  id: string;
  number: string;
  name: string;
  icon: any;
  tech: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export function ArchitectureVisualizer() {
  const stages: StageInfo[] = [
    {
      id: 'ingestion',
      number: '01',
      name: 'Multi-Source Telemetry Ingest',
      icon: Database,
      tech: 'Open-Meteo GTS, RainViewer DWR, EUMETSAT, WWLLN, ECMWF IFS',
      description: 'Ingests live surface telemetry, Doppler radar reflectivity mosaics, geostationary IR cloud tops, convective lightning density, and numerical forecast grids.',
      inputs: ['Global Telecommunication System', 'WMO Surface AWS', 'Doppler Radar Network'],
      outputs: ['Validated Raw Observations', 'Quality Telemetry Records'],
    },
    {
      id: 'grid',
      number: '02',
      name: '1.1km Deterministic Spatial Grid',
      icon: Layers,
      tech: 'PostgreSQL / PostGIS, 0.01° Haversine GridEngine',
      description: 'Projects all continuous sensor coordinates onto a deterministic 1.1km × 1.1km discrete bounding box structure with inverse distance weighting (IDW) spatial averaging.',
      inputs: ['Point Lat/Lon Coordinates', 'Raster Doppler dBZ Tiles'],
      outputs: ['Discrete Grid Cells (GRID_R01_Nxxxx_Exxxx)', 'Spatial Index'],
    },
    {
      id: 'fusion',
      number: '03',
      name: 'Deterministic Data Fusion & Lineage',
      icon: Layers,
      tech: 'TemporalAligner (±15m UTC), Sensor Conflict Resolver',
      description: 'Fuses multi-rate sensor streams using deterministic weighted formulas with complete variable-by-variable lineage logging.',
      inputs: ['Surface Gauge (30%)', 'Radar dBZ (60%)', 'NWP IFS (10%)'],
      outputs: ['FusedGridWeatherState', 'Lineage Attribution Record'],
    },
    {
      id: 'nowcasting',
      number: '04',
      name: 'AI Spatio-Temporal ConvLSTM',
      icon: Cpu,
      tech: 'PyTorch, 5D Sliding Window Tensors, Apple Silicon MPS Acceleration',
      description: 'Deep neural network learning joint spatial patterns and temporal atmospheric evolution across multi-horizon steps (+10m, +20m, +30m, +60m) with Monte Carlo dropout uncertainty.',
      inputs: ['6-Step History Tensor [B, T=6, C=6, H=5, W=5]'],
      outputs: ['Calibrated Rainfall Rate (mm/h)', 'Model Probability', 'Uncertainty Score'],
    },
    {
      id: 'risk',
      number: '05',
      name: 'Hyper-Local Risk Intelligence',
      icon: ShieldAlert,
      tech: '5 Hazard Strategies, Asymmetric Hysteresis State Machine',
      description: 'Synthesizes model probability with surface telemetry and barometric tendencies to compute 0–100 Application Risk Scores and detect contiguous spatial clusters.',
      inputs: ['Nowcast Predictions', 'Surface Pressure Gradient', 'Soil Moisture'],
      outputs: ['Risk Level (NORMAL to SEVERE)', 'Contiguous Risk Hotspots', 'Factor Explanations'],
    },
    {
      id: 'delivery',
      number: '06',
      name: 'Early-Warning Delivery Queue',
      icon: Bell,
      tech: 'Deduplication SHA-256 Engine, In-App / Web Push / SMTP, Dead-Letter Queue',
      description: 'Matches validated high-risk events against user geographic subscriptions (1.1km grid / radius) with quiet hours enforcement and asynchronous background worker execution.',
      inputs: ['Alert Events (Risk ≥ 60)', 'User Subscriptions'],
      outputs: ['In-App Broadcasts', 'Web Push Dispatches', 'Auditable Delivery Receipts'],
    },
  ];

  const [selectedStage, setSelectedStage] = useState<StageInfo>(stages[3]);

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-xl font-mono text-xs">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            ERROR 404 End-to-End System Pipeline Architecture
          </CardTitle>
          <Badge variant="operational">Production Pipeline</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Stage Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {stages.map((stage) => {
            const isSelected = stage.id === selectedStage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-mission-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-card/40 border-border/50 hover:bg-card hover:border-border text-muted-foreground'
                }`}
              >
                <div className="text-[10px] text-cyan-400 font-bold mb-1">{stage.number}</div>
                <div className="text-[11px] font-semibold text-foreground line-clamp-1">
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive */}
        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-3 animate-in fade-in-0 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase">
                Stage {selectedStage.number} Execution Profile:
              </span>
              <h4 className="text-sm font-bold text-foreground">{selectedStage.name}</h4>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {selectedStage.tech}
            </Badge>
          </div>

          <p className="text-muted-foreground leading-relaxed text-[11px]">
            {selectedStage.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[10px]">
            <div className="p-2.5 rounded bg-background/50 border border-border/40 space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-cyan-400" /> Pipeline Inputs:
              </span>
              {selectedStage.inputs.map((inp) => (
                <div key={inp} className="text-muted-foreground">• {inp}</div>
              ))}
            </div>

            <div className="p-2.5 rounded bg-background/50 border border-border/40 space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Pipeline Outputs:
              </span>
              {selectedStage.outputs.map((out) => (
                <div key={out} className="text-muted-foreground">• {out}</div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
