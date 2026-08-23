import { useState } from 'react';
import { LiveMapContainer } from '../components/map/LiveMapContainer.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { DataSourcesPanel } from '../components/fusion/DataSourcesPanel.js';
import { DataLineageCard } from '../components/fusion/DataLineageCard.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import {
  Compass,
  Layers,
  MapPin,
  Grid as GridIcon,
  HelpCircle,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { useCurrentWeather } from '../hooks/useCurrentWeather.js';
import { DataFreshnessBadge } from '../components/weather/DataFreshnessBadge.js';
import { AttributionFooter } from '../components/weather/AttributionFooter.js';

export function LiveMapPage() {
  const { currentLocation } = useLocation();
  const { weather } = useCurrentWeather();
  const [showGridGuide, setShowGridGuide] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="GIS RADAR & MULTI-SOURCE FUSION WORKSPACE"
        subtitle="Geospatial weather intelligence workstation: Doppler radar reflectivity, satellite IR, lightning strokes, and deterministic 1.1km surface grid analysis."
        badge={
          <div className="flex items-center gap-2">
            <DataFreshnessBadge freshness={weather?.dataFreshness} />
            <Badge variant="radar" className="font-mono text-[10px]">
              {currentLocation.district.toUpperCase()} SECTOR
            </Badge>
          </div>
        }
      />

      {/* 2. Multi-Source Stream Health Panel (Phase 7) */}
      <DataSourcesPanel />

      {/* 3. Interactive Map Workspace Hero */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight font-mono">
              Hyper-Local Multi-Sensor Grid Canvas (~1.1km Standard)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 font-mono"
              onClick={() => setShowGridGuide(!showGridGuide)}
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Grid Guide
            </Button>
            <Badge variant="secondary" className="font-mono text-xs hidden sm:inline-flex">
              {currentLocation.coordinates.latitude.toFixed(4)}°N, {currentLocation.coordinates.longitude.toFixed(4)}°E
            </Badge>
          </div>
        </div>

        {/* Informational Banner on Grid Resolution */}
        {showGridGuide && (
          <div className="p-3 rounded-lg bg-card/90 border border-cyan-500/30 text-xs font-mono space-y-1 backdrop-blur-md animate-in fade-in-0 duration-150">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <GridIcon className="w-3.5 h-3.5" />
              Hyper-Local Geospatial Grid Architecture
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Every geographic coordinate deterministically maps to a discrete spatial cell. You can toggle between <strong>1.1km (Hyper-Local Core)</strong>, <strong>5.5km (Meso-Scale)</strong>, and <strong>11km (Regional Synoptic)</strong> grid resolutions. Click any grid cell on the map to inspect its unique grid ID, boundaries, observation age, and surface parameters.
            </p>
          </div>
        )}

        <LiveMapContainer className="h-[520px] md:h-[620px]" />
      </div>

      {/* 4. Multi-Source Data Lineage & Weighted Fusion Card (Phase 7) */}
      <DataLineageCard />

      {/* 5. Operational Grid Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sector Metadata Card */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Operational Sector Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 font-mono">
            <div className="text-lg font-bold text-foreground">
              {currentLocation.name}
            </div>
            <div className="text-xs text-muted-foreground">
              District: {currentLocation.district}, {currentLocation.state}
            </div>
            <div className="text-[11px] text-cyan-400/90 pt-1">
              Ref Grid: {currentLocation.gridId}
            </div>
          </CardContent>
        </Card>

        {/* Spatial Resolution Card */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <GridIcon className="w-3.5 h-3.5 text-cyan-400" />
              Grid Binning & Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 font-mono">
            <div className="text-lg font-bold text-foreground">
              0.01° (~1.1 km)
            </div>
            <div className="text-xs text-muted-foreground">
              WGS84 EPSG:4326 Coordinate Projection
            </div>
            <div className="text-[11px] text-muted-foreground pt-1">
              Supports 0.01° / 0.05° / 0.10° Multi-Scale
            </div>
          </CardContent>
        </Card>

        {/* Doppler Feed Status Card */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Source Sensor Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 font-mono">
            <div className="text-lg font-bold text-cyan-300">
              5 Streams Ingested
            </div>
            <div className="text-xs text-muted-foreground">
              Doppler Radar: RainViewer Mosaic
            </div>
            <div className="text-[11px] text-muted-foreground pt-1">
              Deterministic Weighted Lineage Active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Attribution Footer */}
      <AttributionFooter
        providerName={weather?.attribution?.providerName || 'Open-Meteo Weather API'}
        sourceUrl={weather?.attribution?.sourceUrl || 'https://open-meteo.com/'}
        license={weather?.attribution?.license || 'WMO & National Weather Services Open Meteorological Data'}
      />
    </div>
  );
}
