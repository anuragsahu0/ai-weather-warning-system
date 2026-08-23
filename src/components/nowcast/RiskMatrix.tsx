import {
  CloudLightning,
  Waves,
  CloudRain,
  Wind,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function RiskMatrix() {
  const hazards = [
    {
      title: 'Cloudburst & Convective Core',
      icon: CloudRain,
      description: 'Severe localized rain exceeding 100mm/h',
    },
    {
      title: 'Flash Flood Runoff Potential',
      icon: Waves,
      description: 'Topography-informed surface inundation',
    },
    {
      title: 'Lightning & Thunderstorm Surge',
      icon: CloudLightning,
      description: 'Convective charge density spikes',
    },
    {
      title: 'Gale Winds & Microbursts',
      icon: Wind,
      description: 'Downbursts exceeding 75 km/h',
    },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Multi-Hazard Convective Risk Matrix
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time hazard breakdown for selected radar sector
          </p>
        </div>
        <Badge variant="standby">Risk Assessment Idle</Badge>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hazards.map((hazard) => {
            const Icon = hazard.icon;
            return (
              <div
                key={hazard.title}
                className="p-3 rounded-lg bg-background/50 border border-border/60 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{hazard.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{hazard.description}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold text-muted-foreground/60">-- %</div>
                  <Badge variant="awaiting" className="text-[9px] px-1 py-0 mt-1">
                    Awaiting data
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
