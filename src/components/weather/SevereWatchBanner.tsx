import { ShieldCheck, Info } from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { SeverityLevel } from '@shared/types/index.js';
import { getSeverityConfig } from '../../lib/utils.js';

export function SevereWatchBanner({ severity }: { severity?: SeverityLevel }) {
  const config = getSeverityConfig(severity);

  return (
    <div
      className={`rounded-xl border p-4 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${config.bgClass} ${config.borderClass}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-card/60 text-foreground shrink-0 border border-border/40">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
              CONVECTIVE WEATHER THREAT LEVEL:
            </span>
            <Badge variant={severity === 'SEVERE' ? 'severe' : 'low'} dot>
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
            {severity ? config.description : 'Platform initialized in baseline monitoring mode. Awaiting real-time convective triggers from Doppler Radar & Satellite telemetry.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          IMD / NDMA Guidelines
        </span>
      </div>
    </div>
  );
}
