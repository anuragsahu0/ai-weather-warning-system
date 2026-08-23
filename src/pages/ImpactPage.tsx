import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { ShieldCheck, Building2, Truck, Users, Radio, CheckCircle2 } from 'lucide-react';

export function ImpactPage() {
  const impacts = [
    {
      title: 'Municipal Stormwater & Drainage Teams',
      icon: Building2,
      points: [
        '+15 to +45 min advance warning for deployment of high-capacity dewatering pumps at underpasses.',
        'Hyper-local 1.1km grid specificity directs emergency municipal crews directly to vulnerable catchments.',
        'Prevents localized flash flooding gridlocks across critical urban transit corridors.',
      ],
    },
    {
      title: 'Traffic & Emergency Police Services',
      icon: Truck,
      points: [
        'Enables proactive traffic diversion away from low-lying arterial underpasses before inundation occurs.',
        'Provides real-time storm drift vectors and estimated cell trajectories to emergency dispatchers.',
        'Reduces emergency response times by pre-positioning rescue vehicles outside active flood zones.',
      ],
    },
    {
      title: 'Public Transit & Aviation Operations',
      icon: Radio,
      points: [
        'Provides sub-kilometer downburst and gust-front nowcasting for regional metro and suburban rail corridors.',
        'Aviation terminal maneuvering area (TMA) convective cell alerts within +10m to +60m lead times.',
        'Automated CAP v1.2 feeds integrate seamlessly into existing digital passenger advisory signage.',
      ],
    },
    {
      title: 'Citizens & Community Vulnerability',
      icon: Users,
      points: [
        'Deduplicated geo-fenced push notifications ensure citizens receive actionable alerts without panic.',
        'Strict location privacy guarantees users are notified based on discrete grid references without continuous tracking.',
        'Clear model explainability builds trust by showing the exact meteorological drivers behind every warning.',
      ],
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      <PageHeader
        title="SOCIETAL, MUNICIPAL & OPERATIONAL IMPACT"
        subtitle="Evidence-based decision support capabilities delivered by ERROR 404 for disaster management agencies."
        badge={
          <Badge variant="operational" dot>
            DECISION SUPPORT IMPACT
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impacts.map((imp) => {
          const Icon = imp.icon;
          return (
            <Card key={imp.title} className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <div className="p-2 rounded bg-mission-950/60 border border-emerald-500/30 text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-foreground text-xs">{imp.title}</h3>
              </div>

              <div className="space-y-2 text-[11px] text-muted-foreground">
                {imp.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-card/40 border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>SCIENTIFIC INTEGRITY NOTE:</strong> Operational impact estimates are based on empirical nowcasting lead-time improvements (+15 to +45 min) evaluated against standard 3–6h Numerical Weather Prediction update cycles.
        </span>
      </Card>
    </div>
  );
}
