import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { EOCSummaryBanner } from '../components/authority/EOCSummaryBanner.js';
import { SevereZoneList } from '../components/authority/SevereZoneList.js';
import { BroadcastTriggerShell } from '../components/authority/BroadcastTriggerShell.js';
import { IncidentTimeline } from '../components/authority/IncidentTimeline.js';
import { LiveMapContainer } from '../components/map/LiveMapContainer.js';
import { Badge } from '../components/ui/Badge.js';
import { Card } from '../components/ui/Card.js';
import {
  ShieldAlert,
  RadioTower,
  Activity,
  Building2,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';

export function AuthorityPage() {
  const { currentLocation } = useLocation();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AUTHORITY COMMAND & DISPATCH CENTER"
        subtitle="Dedicated Emergency Operations Center (EOC) interface for National/State Disaster Management Authorities (NDMA / SDMA)."
        badge={
          <Badge variant="severe" dot>
            EOC AUTHORIZED ACCESS
          </Badge>
        }
      />

      {/* 1. EOC Command Banner & Emergency Trigger */}
      <EOCSummaryBanner onOpenBroadcastModal={() => setShowBroadcastModal(true)} />

      {/* 2. Authority Telemetry Key Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Jurisdiction Area</span>
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-semibold text-foreground text-sm truncate font-mono">
            {currentLocation.district}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">Sector: {currentLocation.gridId}</span>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Active EOC Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-semibold text-foreground text-sm font-mono">0 ACTIVE</div>
          <span className="text-[10px] text-emerald-400">Baseline Normal</span>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Dispatched CAPs (24h)</span>
            <RadioTower className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-semibold text-foreground text-sm font-mono">0</div>
          <span className="text-[10px] text-muted-foreground">All Broadcasts Logged</span>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>SDRF Readiness Index</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-semibold text-foreground text-sm font-mono">STANDBY</div>
          <span className="text-[10px] text-muted-foreground">Protocols Verified</span>
        </Card>
      </div>

      {/* 3. GIS Tactical Surveillance Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-foreground">Tactical GIS Surveillance & Evacuation Overlay</span>
          <Badge variant="radar" className="font-mono text-[9px]">RADAR OVERLAY</Badge>
        </div>
        <LiveMapContainer className="h-[360px]" showTimeline={false} />
      </div>

      {/* 4. Severe Zones Watchlist & Incident Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SevereZoneList />
        <IncidentTimeline />
      </div>

      {/* Emergency Broadcast Trigger Modal */}
      <BroadcastTriggerShell
        open={showBroadcastModal}
        onOpenChange={setShowBroadcastModal}
      />
    </div>
  );
}
