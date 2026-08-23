import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../lib/utils.js';

export function AnalyticsMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  className,
}: {
  title: string;
  value: string | number | null;
  unit?: string;
  icon: LucideIcon;
  description: string;
  status?: string;
  className?: string;
}) {
  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm border-border/70', className)}>
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">{title}</span>
          <div className="p-2 rounded-lg bg-muted text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-muted-foreground/60">
              {value ?? '--'}
            </span>
            {unit && <span className="text-xs font-mono text-muted-foreground">{unit}</span>}
          </div>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{description}</span>
          <Badge variant="awaiting" className="text-[9px] px-1.5 py-0">
            Awaiting data
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
