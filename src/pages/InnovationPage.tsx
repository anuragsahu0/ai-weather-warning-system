import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Cpu, MapPin, Database, ShieldAlert, Layers, Bell, CheckCircle2, TrendingUp } from 'lucide-react';

export function InnovationPage() {
  const innovations = [
    {
      num: '01',
      title: '1.1km Deterministic Geospatial Grid',
      category: 'SPATIAL GEOMETRY',
      icon: MapPin,
      desc: 'Replaces coarse 10–25km NWP grid cells with a discrete 0.01° PostGIS bounding cell architecture (`GRID_R01_Nxxxx_Exxxx`) supporting inverse distance weighting spatial interpolation.',
    },
    {
      num: '02',
      title: 'Deep Spatio-Temporal ConvLSTM Nowcaster',
      category: 'DEEP LEARNING',
      icon: Cpu,
      desc: 'Combines 2D spatial convolutions inside recurrent gating cells over 6-step temporal history tensors [B, T=6, C=6, H=5, W=5] to forecast convective storm evolution at +10m, +20m, +30m, and +60m lead times.',
    },
    {
      num: '03',
      title: 'Multi-Source Deterministic Data Fusion',
      category: 'DATA FUSION',
      icon: Database,
      desc: 'Synchronizes 5 distinct telemetry streams (Surface AWS, RainViewer Doppler Radar, EUMETSAT Satellite IR, WWLLN Lightning, ECMWF IFS) with deterministic variable weights and full audit lineage.',
    },
    {
      num: '04',
      title: 'Explainable Application Risk Intelligence',
      category: 'RISK MODELING',
      icon: ShieldAlert,
      desc: 'Synthesizes model probabilities, radar reflectivity, pressure trends, and precipitation rates into a domain-specific 0–100 Application Risk Score with uncertainty penalties.',
    },
    {
      num: '05',
      title: 'Asymmetric Hysteresis State Machine',
      category: 'STATE STABILITY',
      icon: Layers,
      desc: 'Prevents warning alert flapping at decision boundaries with asymmetric activation (Score 61) and deactivation (Score 56) thresholds.',
    },
    {
      num: '06',
      title: 'Contiguous Spatial Hotspot Clustering',
      category: 'SPATIAL CLUSTERING',
      icon: TrendingUp,
      desc: 'Identifies connected clusters of elevated grid cells, calculates centroid coordinates, bounding envelopes, and estimates convective storm drift vectors.',
    },
    {
      num: '07',
      title: 'SHA-256 Deduplicated Notification Queue',
      category: 'NOTIFICATION INFRASTRUCTURE',
      icon: Bell,
      desc: 'Decoupled asynchronous background worker queue with deterministic SHA-256 idempotency hashing preventing citizen spam across In-App, Web Push, and Email channels.',
    },
    {
      num: '08',
      title: 'Hardware Acceleration on Apple MPS & CUDA',
      category: 'PERFORMANCE',
      icon: CheckCircle2,
      desc: 'Optimized neural tensor inference executing in 12ms on Apple Silicon Metal Performance Shaders (MPS) and NVIDIA CUDA GPUs.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      <PageHeader
        title="CORE TECHNICAL INNOVATIONS & ARCHITECTURE"
        subtitle="Key engineering and meteorological innovations implemented across the ERROR 404 platform."
        badge={
          <Badge variant="operational" dot>
            8 IMPLEMENTED INNOVATIONS
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {innovations.map((inv) => {
          const Icon = inv.icon;
          return (
            <Card key={inv.num} className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-mission-950/60 border border-cyan-500/30 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-cyan-400 uppercase">{inv.category}</span>
                    <h3 className="font-bold text-foreground text-xs">{inv.title}</h3>
                  </div>
                </div>
                <span className="text-muted-foreground/60 font-mono text-xs font-bold">{inv.num}</span>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed pt-1">
                {inv.desc}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
