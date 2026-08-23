import { WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function OfflineState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs backdrop-blur-sm',
        className
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
      <div className="flex-1">
        <span className="font-semibold">Local Standby Mode:</span> Live socket link disconnected. Telemetry polling operating in cached fallback state.
      </div>
    </div>
  );
}
