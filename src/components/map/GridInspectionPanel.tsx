import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Cloud,
  Database,
  Layers,
} from 'lucide-react';
import { WeatherGridCell } from '@shared/types/index.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { DataFreshnessBadge } from '../weather/DataFreshnessBadge.js';
import { formatRelativeTime } from '../../hooks/useCurrentWeather.js';
import { cn } from '../../lib/utils.js';

interface GridInspectionPanelProps {
  cell: WeatherGridCell | null;
  onClose: () => void;
  className?: string;
}

export function GridInspectionPanel({ cell, onClose, className }: GridInspectionPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!cell) return null;

  const weather = cell.currentWeather;
  const hasWeather = weather !== null && weather !== undefined;
  const observationTimeLabel = hasWeather ? formatRelativeTime(weather.timestamp) : 'Awaiting sensor ingest';

  const copyGridId = () => {
    navigator.clipboard.writeText(cell.gridCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all',
        className
      )}
    >
      {/* 1. Panel Header */}
      <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider uppercase font-mono text-foreground">
            Grid Cell Inspection
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
        {/* 2. Grid Identifier Block */}
        <div className="space-y-1.5 p-3 rounded-lg bg-mission-950/60 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground">
              Unique Grid Code
            </span>
            <Badge variant="radar" className="text-[9px] px-1.5 py-0 font-mono">
              ~{cell.resolutionKm}km Cell
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold text-cyan-300 tracking-tight select-all">
              {cell.gridCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-cyan-400"
              onClick={copyGridId}
              title="Copy Grid ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>
              Center: {cell.center.latitude.toFixed(4)}°N, {cell.center.longitude.toFixed(4)}°E
            </span>
          </div>

          {cell.regionName && (
            <div className="text-[10px] font-mono text-muted-foreground/80 pl-4">
              Region: {cell.regionName}
            </div>
          )}
        </div>

        {/* 3. Freshness & Quality State HUD */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-foreground">{observationTimeLabel}</span>
          </div>
          <DataFreshnessBadge freshness={weather?.dataFreshness} />
        </div>

        {/* 4. Meteorological Telemetry Attributes */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-muted-foreground">
            Surface Meteorological Parameters
          </span>

          {hasWeather ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Temperature */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Temperature</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.temperature !== null ? `${weather.temperature} °C` : 'Unavailable'}
                </div>
                {weather.feelsLike !== null && (
                  <div className="text-[10px] font-mono text-muted-foreground">
                    Feels {weather.feelsLike} °C
                  </div>
                )}
              </div>

              {/* Humidity */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Humidity</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.humidity !== null ? `${weather.humidity} %` : 'Unavailable'}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Hygrometer</div>
              </div>

              {/* Wind Speed & Azimuth */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  <span>Wind Velocity</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.windSpeed !== null ? `${weather.windSpeed} km/h` : 'Unavailable'}
                </div>
                {weather.windDirection !== null && (
                  <div className="text-[10px] font-mono text-muted-foreground">
                    Heading {weather.windDirection}°
                  </div>
                )}
              </div>

              {/* Barometric Pressure */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pressure</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.pressure !== null ? `${weather.pressure} hPa` : 'Unavailable'}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Surface QNH</div>
              </div>

              {/* Precipitation Rate */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Precipitation</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.precipitationRate !== null ? `${weather.precipitationRate} mm/h` : '0.0 mm/h'}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Rain Inundation</div>
              </div>

              {/* Cloud Cover */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cloud Cover</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {weather.cloudCover !== null ? `${weather.cloudCover} %` : 'Unavailable'}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Satellite IR</div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/20 border border-border/40 text-center space-y-1.5">
              <Database className="w-6 h-6 text-muted-foreground/40 mx-auto" />
              <div className="text-xs font-mono font-semibold text-muted-foreground">
                DATA UNAVAILABLE FOR THIS CELL
              </div>
              <div className="text-[10px] text-muted-foreground/70">
                Waiting for localized surface sensor ingest or Doppler radar beam calibration.
              </div>
            </div>
          )}
        </div>

        {/* 5. Provenance & Aggregation Source Metadata */}
        {hasWeather && (
          <div className="p-2.5 rounded-lg bg-mission-950/40 border border-border/40 text-[10px] font-mono space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Aggregation Method:</span>
              <span className="text-foreground">{weather.aggregationMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Reporting Stations:</span>
              <span className="text-foreground">{weather.sourceCount} Source</span>
            </div>
            <div className="flex justify-between">
              <span>Data Quality Grade:</span>
              <span className="text-cyan-300 font-semibold">{weather.dataQuality}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
