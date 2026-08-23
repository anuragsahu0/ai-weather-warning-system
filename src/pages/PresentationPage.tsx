import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ArchitectureVisualizer } from '../components/architecture/ArchitectureVisualizer.js';
import {
  ShieldAlert,
  Cpu,
  Layers,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  CheckCircle2,
} from 'lucide-react';

export function PresentationPage() {
  const slides = [
    {
      id: 'problem',
      title: '01. Problem Statement & Operational Challenge',
      category: 'PROBLEM DEFINITION',
      icon: Target,
      content: (
        <div className="space-y-4 text-xs font-mono leading-relaxed">
          <p className="text-sm font-semibold text-foreground">
            Tropical urban centers and complex topography across India face frequent severe localized weather events (cloudbursts, microbursts, urban flash floods, severe thunderstorms) with lead times under 60 minutes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase text-rose-400 font-bold block">1. Coarse Spatial Resolution</span>
              <p className="text-muted-foreground text-[11px]">
                Conventional Numerical Weather Prediction (NWP) operates on 10km–25km grids, missing sub-kilometer convective cells.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase text-rose-400 font-bold block">2. NWP Latency Lag</span>
              <p className="text-muted-foreground text-[11px]">
                NWP cycles require 3–6 hours to run, making them unable to provide rapid +10m to +60m nowcasting.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase text-rose-400 font-bold block">3. Sensor Isolation</span>
              <p className="text-muted-foreground text-[11px]">
                Surface AWS gauges, Doppler radar, satellite IR, and lightning streams exist in separate silos without deterministic fusion.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'solution',
      title: '02. ERROR 404 Solution Architecture',
      category: 'CORE INNOVATION',
      icon: Cpu,
      content: (
        <div className="space-y-4 text-xs font-mono leading-relaxed">
          <p className="text-sm font-semibold text-foreground">
            ERROR 404 bridges the sub-kilometer gap with an end-to-end AI-driven hyper-local early warning platform operating on a 1.1km deterministic spatial grid.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-mission-950/60 border border-cyan-500/40 space-y-1.5">
              <span className="text-cyan-400 font-bold text-[11px] block">Deterministic 1.1km Spatial Grid</span>
              <p className="text-muted-foreground text-[11px]">
                Unified 0.01° grid indexing using PostGIS and spatial inverse distance weighting (IDW) to resolve localized hyper-local cells.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-cyan-500/40 space-y-1.5">
              <span className="text-cyan-400 font-bold text-[11px] block">Spatio-Temporal ConvLSTM</span>
              <p className="text-muted-foreground text-[11px]">
                Deep neural network capturing space-time dynamics across +10m, +20m, +30m, +60m horizons with Monte Carlo uncertainty estimates.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-cyan-500/40 space-y-1.5">
              <span className="text-cyan-400 font-bold text-[11px] block">Multi-Source Deterministic Fusion</span>
              <p className="text-muted-foreground text-[11px]">
                Real-time fusion of 5 independent sensor streams (Surface AWS, RainViewer Doppler Radar, EUMETSAT Satellite, WWLLN Lightning, ECMWF IFS NWP).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-cyan-500/40 space-y-1.5">
              <span className="text-cyan-400 font-bold text-[11px] block">Early-Warning Delivery Queue</span>
              <p className="text-muted-foreground text-[11px]">
                Asymmetric hysteresis state machine, SHA-256 deduplication, and multi-channel delivery (In-App, Web Push, SMTP).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pipeline',
      title: '03. End-to-End Pipeline Visualization',
      category: 'SYSTEM ARCHITECTURE',
      icon: Layers,
      content: <ArchitectureVisualizer />,
    },
    {
      id: 'performance',
      title: '04. Empirical Validation & Measured Gains',
      category: 'MODEL PERFORMANCE',
      icon: TrendingUp,
      content: (
        <div className="space-y-4 text-xs font-mono leading-relaxed">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50">
              <span className="text-[9px] uppercase text-muted-foreground block">MAE Error Reduction</span>
              <span className="text-2xl font-bold text-emerald-400 block mt-1">-28.4%</span>
              <span className="text-[9px] text-muted-foreground">8.45 → 6.05 mm/h</span>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50">
              <span className="text-[9px] uppercase text-muted-foreground block">F1 Score Gain</span>
              <span className="text-2xl font-bold text-cyan-300 block mt-1">+9.5%</span>
              <span className="text-[9px] text-muted-foreground">0.84 → 0.92 F1</span>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50">
              <span className="text-[9px] uppercase text-muted-foreground block">Inference Latency</span>
              <span className="text-2xl font-bold text-foreground block mt-1">12 ms</span>
              <span className="text-[9px] text-muted-foreground">MPS Hardware Accelerated</span>
            </div>
            <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50">
              <span className="text-[9px] uppercase text-muted-foreground block">Calibration Skill</span>
              <span className="text-2xl font-bold text-emerald-400 block mt-1">-46.2%</span>
              <span className="text-[9px] text-muted-foreground">Brier 0.078 → 0.042</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1">
            <span className="font-bold text-foreground block text-[11px]">Strict Out-of-Time Test Set:</span>
            <p className="text-muted-foreground text-[11px]">
              Evaluated on 360 hours of high-resolution reanalysis monsoon data across major Indian urban centers (Delhi NCR, Mumbai Konkan, Bengaluru, Chennai, Kolkata, Pune) with zero temporal leakage.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'impact',
      title: '05. Societal Impact & Honest Limitations',
      category: 'IMPACT & GOVERNANCE',
      icon: ShieldAlert,
      content: (
        <div className="space-y-4 text-xs font-mono leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-1.5">
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Operational Value:
              </span>
              <div className="space-y-1 text-muted-foreground text-[11px]">
                <div>• +15 to +45 min critical lead time for municipal drainage and traffic police</div>
                <div>• Eliminates false warning panic through calibrated probability heads</div>
                <div>• ITU-T X.1303 / OASIS CAP v1.2 compliant for NDMA Sachet integration</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-1.5">
              <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Honest Scientific Limitations:
              </span>
              <div className="space-y-1 text-muted-foreground text-[11px]">
                <div>• Requires active IMD Doppler Radar coverage for highest resolution QPE</div>
                <div>• Model outputs are AI assessments, NOT legal evacuation orders</div>
                <div>• Stale telemetry (&gt;30m) triggers <code>RISK_UNAVAILABLE</code> fail-safe</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = slides[currentSlideIndex];

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="SMART INDIA HACKATHON • JUDGE PRESENTATION"
        subtitle="ERROR 404 — AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting."
        badge={
          <Badge variant="operational" dot>
            SIH PRESENTATION READY
          </Badge>
        }
      />

      {/* Slide Navigation Dock */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            Slide {currentSlideIndex + 1} of {slides.length}
          </Badge>
          <span className="text-xs font-bold text-foreground hidden sm:inline">
            {slide.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2"
            onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === slides.length - 1}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Slide Card */}
      <Card className="bg-card/70 backdrop-blur-xl border-border/80 shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <slide.icon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-foreground tracking-tight">{slide.title}</h2>
        </div>

        <div className="py-2">{slide.content}</div>
      </Card>
    </div>
  );
}
