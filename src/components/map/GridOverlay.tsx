import { useState } from 'react';
import { WeatherGridCell } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface GridOverlayProps {
  cells: WeatherGridCell[];
  selectedCell: WeatherGridCell | null;
  onSelectCell: (cell: WeatherGridCell) => void;
  visible?: boolean;
}

export function GridOverlay({
  cells,
  selectedCell,
  onSelectCell,
  visible = true,
}: GridOverlayProps) {
  const [hoveredCell, setHoveredCell] = useState<WeatherGridCell | null>(null);

  if (!visible || cells.length === 0) return null;

  // Take up to 25 cells for the central visual overlay grid (5x5 matrix)
  const displayCells = cells.slice(0, 25);

  return (
    <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center p-8">
      {/* 5x5 Vector Grid Layout */}
      <div className="grid grid-cols-5 gap-1.5 w-full max-w-[460px] h-[340px] pointer-events-auto">
        {displayCells.map((cell) => {
          const isSelected = selectedCell?.gridCode === cell.gridCode;
          const isHovered = hoveredCell?.gridCode === cell.gridCode;
          const weather = cell.currentWeather;
          const hasData = weather !== null && weather !== undefined;
          const isLive = weather?.dataFreshness === 'FRESH' || weather?.dataFreshness === 'RECENT';

          return (
            <button
              key={cell.gridCode}
              type="button"
              onClick={() => onSelectCell(cell)}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
              className={cn(
                'relative rounded-md border p-1.5 transition-all flex flex-col justify-between text-left overflow-hidden select-none',
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-20 scale-[1.04]'
                  : isHovered
                  ? 'border-cyan-500/70 bg-cyan-950/40 z-10 scale-[1.02]'
                  : hasData && isLive
                  ? 'border-cyan-500/30 bg-mission-900/60 hover:border-cyan-400/60'
                  : hasData
                  ? 'border-amber-500/30 bg-mission-900/60'
                  : 'border-slate-800/60 bg-mission-950/40 hover:border-slate-700'
              )}
            >
              {/* Corner Reticle on Selected Cell */}
              {isSelected && (
                <>
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-cyan-400" />
                </>
              )}

              {/* Top Row: Grid Short Index & Freshness Dot */}
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[9px] text-muted-foreground/80 truncate">
                  {cell.gridCode.split('_').slice(-2).join('_')}
                </span>
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    hasData && isLive
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : hasData
                      ? 'bg-amber-400'
                      : 'bg-slate-700'
                  )}
                />
              </div>

              {/* Center Metric Display */}
              <div className="my-auto text-center">
                {hasData && weather.temperature !== null ? (
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    {weather.temperature}°C
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground/40">--</span>
                )}
              </div>

              {/* Bottom Row: Weather Condition / Resolution */}
              <div className="text-[8px] font-mono text-muted-foreground/70 truncate text-center">
                {hasData && weather.weatherCondition
                  ? weather.weatherCondition.split(' ')[0]
                  : `~${cell.resolutionKm}km`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
