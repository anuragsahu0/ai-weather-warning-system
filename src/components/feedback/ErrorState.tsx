import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/Button.js';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  errorCode?: string;
}

export function ErrorState({
  title = 'Telemetry Stream Interrupted',
  message = 'Unable to establish a secure connection to the nowcast telemetry service.',
  onRetry,
  className,
  errorCode,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3 ring-1 ring-destructive/20">
        <AlertCircle className="h-6 w-6" />
      </div>

      {errorCode && (
        <span className="mb-2 font-mono text-[10px] text-destructive tracking-widest uppercase bg-destructive/10 px-2 py-0.5 rounded">
          {errorCode}
        </span>
      )}

      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">{message}</p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          Reconnect Feed
        </Button>
      )}
    </div>
  );
}
