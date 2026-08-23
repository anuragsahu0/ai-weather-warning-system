import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface AttributionFooterProps {
  providerName?: string;
  sourceUrl?: string;
  license?: string;
  className?: string;
}

export function AttributionFooter({
  providerName = 'Open-Meteo Weather API',
  sourceUrl = 'https://open-meteo.com/',
  license = 'WMO & National Weather Services Open Meteorological Data',
  className,
}: AttributionFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 rounded-lg bg-card/40 border border-border/40 text-[11px] text-muted-foreground backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Weather Data Ingestion Source:</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground font-medium hover:underline font-mono"
        >
          {providerName}
        </a>
      </div>

      <div className="text-[10px] text-muted-foreground/80 font-mono">
        Standard: {license}
      </div>
    </div>
  );
}
