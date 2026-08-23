import { Loader2, Radio } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface LoadingStateProps {
  title?: string;
  message?: string;
  className?: string;
  variant?: 'radar' | 'spinner' | 'minimal';
}

export function LoadingState({
  title = 'Initializing Telemetry',
  message = 'Connecting to weather data stream...',
  className,
  variant = 'radar',
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[220px] rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm',
        className
      )}
    >
      {variant === 'radar' ? (
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/50" />
          <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
        </div>
      ) : (
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      )}
      <h4 className="text-sm font-semibold text-foreground tracking-wide font-sans">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{message}</p>
    </div>
  );
}
