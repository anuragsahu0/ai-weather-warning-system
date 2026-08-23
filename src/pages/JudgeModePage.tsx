import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { ArchitectureVisualizer } from '../components/architecture/ArchitectureVisualizer.js';
import {
  Target,
  Cpu,
  Layers,
  TrendingUp,
  Server,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function JudgeModePage() {
  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      <PageHeader
        title="SMART INDIA HACKATHON • JUDGE EVALUATION DECK"
        subtitle="ERROR 404 — AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting."
        badge={
          <Badge variant="operational" dot>
            SIH EVALUATION READY
          </Badge>
        }
      />

      {/* 1. Problem Statement & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Problem */}
        <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-3">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <Target className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-foreground text-sm">01. The Problem Statement</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Tropical urban centers and complex terrain in India suffer from localized convective extremes (cloudbursts, urban flash floods, microbursts) with spatial scales &lt; 5km and lead times under 60 minutes. Conventional Numerical Weather Prediction (NWP) operates on coarse 10km–25km grids with 3–6h latency, leaving disaster authorities blind to localized flash events.
          </p>
        </Card>

        {/* Solution */}
        <Card className="p-5 bg-card/60 backdrop-blur-sm border-cyan-500/40 space-y-3 ring-1 ring-cyan-500/20">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-foreground text-sm">02. ERROR 404 Innovation</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            A real-time end-to-end meteorological nowcasting platform operating on a <strong>1.1km deterministic spatial grid</strong>. Integrates 5 real sensor streams (Surface AWS, Doppler Radar, Satellite IR, Lightning, NWP), runs a deep <strong>Spatio-Temporal ConvLSTM</strong> on hardware (12ms latency), and executes automated early warnings with SHA-256 deduplication.
          </p>
        </Card>
      </div>

      {/* 2. Measured Benchmark Metrics */}
      <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-foreground text-sm">03. Measured Empirical Performance (Out-of-Time Test Set)</h3>
          </div>
          <Badge variant="operational">360h Monsoon Dataset</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded bg-background/50 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block">MAE Error Reduction</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">-28.4%</span>
            <span className="text-[9px] text-muted-foreground">8.45 → 6.05 mm/h</span>
          </div>

          <div className="p-3 rounded bg-background/50 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block">F1 Score Gain</span>
            <span className="text-xl font-bold text-cyan-300 block mt-1">+9.5%</span>
            <span className="text-[9px] text-muted-foreground">0.84 → 0.92 F1</span>
          </div>

          <div className="p-3 rounded bg-background/50 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block">Calibration Skill</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">-46.2%</span>
            <span className="text-[9px] text-muted-foreground">Brier 0.078 → 0.042</span>
          </div>

          <div className="p-3 rounded bg-background/50 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block">Inference Latency</span>
            <span className="text-xl font-bold text-foreground block mt-1">12 ms</span>
            <span className="text-[9px] text-muted-foreground">PyTorch MPS Device</span>
          </div>
        </div>
      </Card>

      {/* 3. Clickable End-to-End System Architecture */}
      <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-3">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-foreground text-sm">04. End-to-End System Architecture Pipeline</h3>
        </div>
        <ArchitectureVisualizer />
      </Card>

      {/* 4. Scalability & Honest Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scalability */}
        <Card className="p-5 bg-card/60 backdrop-blur-sm border-emerald-500/40 space-y-3">
          <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-foreground text-sm">05. National Scalability & Integration</h3>
          </div>
          <div className="space-y-1.5 text-muted-foreground text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full compliance with <strong>ITU-T X.1303 / OASIS CAP v1.2</strong> standard for NDMA Sachet integration.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Decoupled horizontal worker queue scales to millions of geo-fenced citizen push endpoints.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Edge-deployable microservice architecture for State Emergency Operation Centers (EOCs).</span>
            </div>
          </div>
        </Card>

        {/* Limitations */}
        <Card className="p-5 bg-card/60 backdrop-blur-sm border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2 border-b border-amber-500/30 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-foreground text-sm">06. Honest Scientific Limitations</h3>
          </div>
          <div className="space-y-1.5 text-muted-foreground text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>Model outputs are <strong>AI assessments</strong>, not official government legal evacuation orders.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>Requires active IMD Doppler Radar mosaic for highest resolution QPE.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>Data quality gate halts and reports <code>RISK_UNAVAILABLE</code> if telemetry is stale (&gt;30m).</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
