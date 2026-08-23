import { Database, Clock } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface DataUnavailableProps {
  label?: string;
  reason?: string;
  className?: string;
  compact?: boolean;
}

export function DataUnavailableState({
  label = 'Data Unavailable',
  reason = 'Awaiting live radar/sensor ingestion stream',
  className,
  compact = false,
}: DataUnavailableProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground/80 font-mono text-xs', className)}>
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-lg border border-border/50 bg-card/20',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground mb-2.5">
        <Database className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-foreground tracking-wide font-mono uppercase">{label}</span>
      <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">{reason}</p>
    </div>
  );
}
