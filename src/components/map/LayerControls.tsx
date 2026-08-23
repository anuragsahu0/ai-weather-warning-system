import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface MapLayerDefinition {
  id: string;
  name: string;
  category: 'RADAR' | 'SATELLITE' | 'DERIVED' | 'EMERGENCY';
  description: string;
  isReady: boolean;
}

export const MAP_LAYERS: MapLayerDefinition[] = [
  {
    id: 'radar_reflectivity',
    name: 'Doppler Reflectivity (dBZ)',
    category: 'RADAR',
    description: 'Composite max reflectivity scan',
    isReady: true,
  },
  {
    id: 'cloud_top_ir',
    name: 'Cloud Top Infrared (IR)',
    category: 'SATELLITE',
    description: 'INSAT-3D/3DR Brightness Temperature',
    isReady: true,
  },
  {
    id: 'precipitation_accum',
    name: 'Precipitation Rate (mm/h)',
    category: 'DERIVED',
    description: 'Calibrated surface rain intensity',
    isReady: true,
  },
  {
    id: 'wind_vectors',
    name: 'Wind Velocity Streamlines',
    category: 'DERIVED',
    description: 'Doppler radial wind velocity vectors',
    isReady: true,
  },
  {
    id: 'lightning_density',
    name: 'Lightning Strike Density',
    category: 'RADAR',
    description: 'Real-time convective discharges',
    isReady: true,
  },
  {
    id: 'warning_polygons',
    name: 'CAP Emergency Warning Polygons',
    category: 'EMERGENCY',
    description: 'Active NDMA / IMD severe warning zones',
    isReady: true,
  },
];

export function LayerControls({
  activeLayers,
  onToggleLayer,
}: {
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <span className="text-xs font-semibold text-foreground font-sans">GIS Weather Layers</span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {activeLayers.length} Active
        </span>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {MAP_LAYERS.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggleLayer(layer.id)}
              className={cn(
                'w-full flex items-center justify-between p-2 rounded-md border text-left transition-all text-xs',
                isActive
                  ? 'bg-primary/10 border-primary/40 text-foreground'
                  : 'bg-background/40 border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <div>
                <div className="font-medium flex items-center gap-1.5">
                  <span>{layer.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {layer.description}
                </div>
              </div>

              <div className="ml-2 shrink-0">
                {isActive ? (
                  <Eye className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
