import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { RiskScoreMeter } from '../components/risk/RiskScoreMeter.js';
import { RiskTimelinePanel } from '../components/risk/RiskTimelinePanel.js';
import { RiskHotspotOverlay } from '../components/risk/RiskHotspotOverlay.js';
import { GridRiskDetailDrawer } from '../components/risk/GridRiskDetailDrawer.js';
import { AdminNotificationMetrics } from '../components/notifications/AdminNotificationMetrics.js';
import { NotificationPreferencesModal } from '../components/notifications/NotificationPreferencesModal.js';
import { AlertDetailModal } from '../components/alerts/AlertDetailModal.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs.js';
import { HazardType, AlertEvent } from '@shared/types/index.js';
import { Radio, MapPin, SlidersHorizontal, BellPlus, ShieldAlert, Clock, Eye } from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { useRiskAssessment } from '../hooks/useRiskAssessment.js';
import { useAlertEvents } from '../hooks/useAlertEvents.js';

export function AlertsPage() {
  const { currentLocation } = useLocation();
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('HEAVY_RAIN');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'risk' | 'alerts' | 'hotspots' | 'queue' | 'cap'>('risk');

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<AlertEvent | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const { assessment, isLoading } = useRiskAssessment(selectedHazard, selectedHorizon);
  const { alerts } = useAlertEvents();

  const handleOpenAlertDetail = (a: AlertEvent) => {
    setSelectedAlertForDetail(a);
    setShowAlertModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="EARLY WARNING & RISK INTELLIGENCE CENTER"
        subtitle="Deterministic hazard risk scoring, spatial hotspot clustering, and automated multi-channel early warning delivery infrastructure."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="operational" dot>
              EARLY WARNING ACTIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] font-mono gap-1"
              onClick={() => setShowPreferencesModal(true)}
            >
              <BellPlus className="w-3 h-3 text-cyan-400" />
              Subscribe
            </Button>
          </div>
        }
      />

      {/* Hazard Selector Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card/70 border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-foreground">
            Hazard Type:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['HEAVY_RAIN', 'THUNDERSTORM', 'STRONG_WIND', 'EXTREME_RAINFALL'] as HazardType[]).map((h) => (
              <Button
                key={h}
                variant={selectedHazard === h ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs font-mono"
                onClick={() => setSelectedHazard(h)}
              >
                {h.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sector: {currentLocation.name} ({currentLocation.gridId})</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="risk" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="risk" className="text-xs">Risk Assessment & Timeline</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Active Alert Events ({alerts.length})</TabsTrigger>
          <TabsTrigger value="hotspots" className="text-xs">Contiguous Hotspots</TabsTrigger>
          <TabsTrigger value="queue" className="text-xs">Delivery Queue Telemetry</TabsTrigger>
          <TabsTrigger value="cap" className="text-xs">CAP Protocol Specification</TabsTrigger>
        </TabsList>

        {/* Tab 1: Risk Assessment */}
        <TabsContent value="risk" className="mt-4 space-y-5">
          {isLoading || !assessment ? (
            <Card className="p-8 text-center text-xs font-mono text-muted-foreground">
              Synthesizing multi-sensor inputs & evaluating hazard strategies...
            </Card>
          ) : (
            <>
              {/* 1. Risk Score Gauge & Probability Separation */}
              <RiskScoreMeter
                riskScore={assessment.riskScore}
                riskLevel={assessment.riskLevel}
                modelProbability={assessment.modelProbability}
                uncertaintyScore={assessment.uncertaintyScore}
                hazardType={assessment.hazardType}
              />

              {/* 2. Multi-Horizon Risk Timeline */}
              <RiskTimelinePanel
                timeline={assessment.timeline}
                selectedHorizon={selectedHorizon}
                onSelectHorizon={setSelectedHorizon}
              />

              {/* 3. Detailed Attribution Drawer */}
              <GridRiskDetailDrawer assessment={assessment} />
            </>
          )}
        </TabsContent>

        {/* Tab 2: Active System Alerts */}
        <TabsContent value="alerts" className="mt-4 space-y-4 font-mono text-xs">
          {alerts.length === 0 ? (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
              <ShieldAlert className="w-10 h-10 text-emerald-400/60 mx-auto" />
              <div className="text-sm font-bold text-emerald-400">NO ACTIVE SEVERE WEATHER ALERTS</div>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                No grid cells exceed the threshold for emergency alert activation. Monitored atmospheric variables remain in baseline envelope.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((a) => (
                <div
                  key={a.alertId}
                  className="p-4 rounded-xl bg-card/60 border border-border/70 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{a.title}</span>
                      <Badge variant="high" className="text-[9px] px-1.5 py-0 font-bold">
                        {a.riskLevel}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {a.origin}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{a.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                      <span>Sector: <strong>{a.gridId}</strong></span>
                      <span>Prob: <strong>{Math.round(a.probability * 100)}%</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Valid Until: {new Date(a.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-mono gap-1 shrink-0"
                    onClick={() => handleOpenAlertDetail(a)}
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> View Detail
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Hotspots */}
        <TabsContent value="hotspots" className="mt-4 space-y-4">
          <RiskHotspotOverlay hazard={selectedHazard} horizon={selectedHorizon} />
        </TabsContent>

        {/* Tab 4: Delivery Queue Telemetry */}
        <TabsContent value="queue" className="mt-4 space-y-4">
          <AdminNotificationMetrics />
        </TabsContent>

        {/* Tab 5: CAP Protocol Specification */}
        <TabsContent value="cap" className="mt-4">
          <Card className="bg-card/60 backdrop-blur-sm border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                ITU-T X.1303 / OASIS CAP v1.2 Standard Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed font-mono">
              <p>
                ERROR 404 implements the standard Common Alerting Protocol (CAP) schema, ensuring interoperability with the National Disaster Management Authority (NDMA) Sachet portal, IMD early warning feeds, and state Emergency Operation Centers (EOCs).
              </p>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-[11px] space-y-1">
                <div>• XML/JSON schema validation via Zod contract validation</div>
                <div>• Geographic polygon encoding with WGS84 coordinates</div>
                <div>• Multi-tier priority flags: IMMEDIATE, EXPECTED, FUTURE</div>
                <div>• Automated multi-lingual broadcast message templating</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlertForDetail}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}
