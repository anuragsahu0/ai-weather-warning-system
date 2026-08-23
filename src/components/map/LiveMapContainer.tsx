import { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Crosshair,
  Compass,
  Grid as GridIcon,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext.js';
import { useCurrentWeather } from '../../hooks/useCurrentWeather.js';
import { useGridCells } from '../../hooks/useGridCells.js';
import { Button } from '../ui/Button.js';
import { LayerControls } from './LayerControls.js';
import { MapLegend } from './MapLegend.js';
import { TimeSlider } from './TimeSlider.js';
import { GridOverlay } from './GridOverlay.js';
import { GridInspectionPanel } from './GridInspectionPanel.js';
import { DataFreshnessBadge } from '../weather/DataFreshnessBadge.js';
import { cn } from '../../lib/utils.js';

interface LiveMapContainerProps {
  expanded?: boolean;
  className?: string;
  showTimeline?: boolean;
}

export function LiveMapContainer({
  expanded = false,
  className,
  showTimeline = true,
}: LiveMapContainerProps) {
  const { currentLocation } = useLocation();
  const { weather } = useCurrentWeather();
  const {
    resolution,
    setResolution,
    cells,
    selectedCell,
    setSelectedCell,
  } = useGridCells(0.01);

  const [isFullscreen, setIsFullscreen] = useState(expanded);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [radarSweepActive, setRadarSweepActive] = useState(true);
  const [showGridOverlay, setShowGridOverlay] = useState(true);

  // Active layers state
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'radar_reflectivity',
    'warning_polygons',
    'hyperlocal_grid',
  ]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
    if (layerId === 'hyperlocal_grid') {
      setShowGridOverlay(!showGridOverlay);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border/70 bg-mission-950 overflow-hidden flex flex-col shadow-2xl transition-all',
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[480px] md:h-[540px]',
        className
      )}
    >
      {/* 1. Map Canvas Visual Container */}
      <div className="relative flex-1 w-full h-full bg-mission-950 bg-mission-grid flex items-center justify-center overflow-hidden select-none">
        {/* Concentric Radar Range Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[180px] h-[180px] rounded-full border border-cyan-500/20" />
          <div className="w-[340px] h-[340px] rounded-full border border-cyan-500/15" />
          <div className="w-[520px] h-[520px] rounded-full border border-cyan-500/10" />
          <div className="w-[720px] h-[720px] rounded-full border border-cyan-500/5" />

          {/* Azimuth Axis Lines */}
          <div className="absolute w-full h-[1px] bg-cyan-500/10" />
          <div className="absolute h-full w-[1px] bg-cyan-500/10" />
          <div className="absolute w-full h-[1px] bg-cyan-500/5 rotate-45" />
          <div className="absolute w-full h-[1px] bg-cyan-500/5 -rotate-45" />
        </div>

        {/* Dynamic Radar Beam Sweep Animation */}
        {radarSweepActive && (
          <div className="absolute w-[600px] h-[600px] pointer-events-none animate-radar-sweep opacity-30">
            <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-400/20 rounded-tl-full" />
          </div>
        )}

        {/* 2. Interactive Hyper-Local Vector Grid Matrix */}
        <GridOverlay
          cells={cells}
          selectedCell={selectedCell}
          onSelectCell={(c) => setSelectedCell(c)}
          visible={showGridOverlay}
        />

        {/* Top-Left: Active Sector & Coordinates HUD */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 bg-mission-900/90 border border-border/80 rounded-lg px-2.5 py-1.5 backdrop-blur-md shadow-lg">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-[11px] font-mono font-medium text-foreground">
              {currentLocation.coordinates.latitude.toFixed(4)}°N, {currentLocation.coordinates.longitude.toFixed(4)}°E
            </div>
            <DataFreshnessBadge freshness={weather?.dataFreshness} />
          </div>

          {/* Active Grid Cell Indicator */}
          {selectedCell && (
            <div className="flex items-center gap-2 bg-mission-900/90 border border-cyan-500/40 rounded-lg px-2.5 py-1 backdrop-blur-md shadow-lg text-[10px] font-mono text-cyan-300">
              <GridIcon className="w-3 h-3 text-cyan-400" />
              <span>{selectedCell.gridCode}</span>
              <span className="text-muted-foreground">(~{selectedCell.resolutionKm}km • Zoom {zoomLevel}x)</span>
            </div>
          )}
        </div>

        {/* Top-Right: Controls Dock (Resolution, Fullscreen, Layers, Sweep, Zoom) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-mission-900/90 border border-border/80 rounded-lg p-1 backdrop-blur-md shadow-lg">
          {/* Resolution Selector */}
          <div className="hidden sm:flex items-center bg-card/80 rounded border border-border/60 p-0.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setResolution(0.01)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                resolution === 0.01 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Hyper-Local Convective Core Grid (~1.1km)"
            >
              1.1km
            </button>
            <button
              type="button"
              onClick={() => setResolution(0.05)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                resolution === 0.05 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Meso-Scale Radar Grid (~5.5km)"
            >
              5.5km
            </button>
            <button
              type="button"
              onClick={() => setResolution(0.1)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                resolution === 0.1 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Regional Synoptic Grid (~11km)"
            >
              11km
            </button>
          </div>

          <div className="w-[1px] h-4 bg-border/60 mx-0.5 hidden sm:block" />

          <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', showGridOverlay ? 'text-cyan-400' : 'text-muted-foreground')}
            onClick={() => setShowGridOverlay(!showGridOverlay)}
            title={showGridOverlay ? 'Hide Hyper-Local Grid' : 'Show Hyper-Local Grid'}
          >
            <GridIcon className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setRadarSweepActive(!radarSweepActive)}
            title={radarSweepActive ? 'Pause Radar Scan' : 'Resume Radar Scan'}
          >
            <Compass className={cn('w-3.5 h-3.5', radarSweepActive && 'text-cyan-400')} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShowLayersModal(!showLayersModal)}
            title="Configure Map Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </Button>

          <div className="w-[1px] h-4 bg-border/60 mx-0.5" />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 14))}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 4))}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Floating Slide-Out Grid Inspection Panel */}
        {selectedCell && (
          <div className="absolute top-14 right-3 z-30 animate-in fade-in-0 slide-in-from-right-4 duration-200">
            <GridInspectionPanel
              cell={selectedCell}
              onClose={() => setSelectedCell(null)}
            />
          </div>
        )}

        {/* Bottom-Left: Reflectivity dBZ Legend */}
        <div className="absolute bottom-3 left-3 z-10 hidden sm:block">
          <MapLegend />
        </div>

        {/* Layer Controls Floating Drawer */}
        {showLayersModal && (
          <div className="absolute top-12 right-3 z-40 w-64 bg-card/95 border rounded-lg p-3 shadow-2xl backdrop-blur-xl animate-in fade-in-0 duration-150">
            <LayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
          </div>
        )}
      </div>

      {/* 3. Bottom Interactive Time Scrubber */}
      {showTimeline && (
        <div className="border-t border-border/70 bg-card/80 p-2.5 backdrop-blur-md">
          <TimeSlider />
        </div>
      )}
    </div>
  );
}
