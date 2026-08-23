import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../lib/utils.js';

export interface WeatherMetricCardProps {
  title: string;
  value: string | number | null;
  unit: string;
  icon: LucideIcon;
  status?: 'LIVE' | 'AWAITING_DATA' | 'CALCULATING' | 'SENSOR_OFFLINE';
  observationTime?: string;
  description?: string;
  delta?: string;
  className?: string;
}

export function WeatherMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status = 'AWAITING_DATA',
  observationTime,
  description,
  delta,
  className,
}: WeatherMetricCardProps) {
  const isAwaiting = status === 'AWAITING_DATA' || value === null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm rounded-2xl transition-all hover:border-cyan-500/50 hover:shadow-md group',
        className
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
        {/* Top Row: Metric Label & Icon */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-sans">
            {title}
          </span>
          <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Middle Row: Large Value / -- */}
        <div className="my-1">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-extrabold font-mono tracking-tight',
                isAwaiting ? 'text-muted-foreground/60' : 'text-foreground'
              )}
            >
              {isAwaiting ? '--' : value}
            </span>
            <span className="text-sm font-mono font-bold text-muted-foreground">{unit}</span>
          </div>

          {delta && !isAwaiting && (
            <span className="text-xs font-mono text-emerald-400 mt-1 inline-block font-semibold">{delta}</span>
          )}

          {observationTime && (
            <div className="text-[11px] text-muted-foreground font-mono mt-1">
              {observationTime}
            </div>
          )}
        </div>

        {/* Bottom Row: Status Tag & Description */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate font-medium">{description || 'Surface Sensor'}</span>
          <Badge
            variant={status === 'LIVE' ? 'operational' : 'awaiting'}
            className="text-[10px] px-2 py-0.5 font-mono shrink-0"
          >
            {status === 'LIVE' ? 'LIVE DATA' : 'Awaiting'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
