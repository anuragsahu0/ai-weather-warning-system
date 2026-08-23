import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { EmptyState } from '../feedback/EmptyState.js';

export function SevereZoneList() {
  const zones: any[] = [];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">High-Risk Vulnerability Cells</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Geographic bounding sectors under active watch
          </p>
        </div>
        <Badge variant="operational">0 Severe Zones</Badge>
      </CardHeader>

      <CardContent>
        {zones.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="NO HIGH-RISK CONVECTIVE ZONES"
            description="All monitored administrative districts and radar sectors are currently within baseline thresholds."
            badge="ALL SECTORS NORMAL"
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {/* Populated in later phases */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
