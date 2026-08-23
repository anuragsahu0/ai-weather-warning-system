import { Activity, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useNotificationMetrics } from '../../hooks/useNotifications.js';

export function AdminNotificationMetrics() {
  const { metrics, isLoading } = useNotificationMetrics();

  if (isLoading || !metrics) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 text-center text-xs font-mono text-muted-foreground">
        Loading notification queue & channel telemetry metrics...
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Notification Queue & Delivery Channel Telemetry (Phase 9)
          </CardTitle>
        </div>
        <Badge variant="operational" className="font-mono text-xs">
          Queue Depth: {metrics.queueDepth}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono text-xs">
        {/* Core Queue Pipeline Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Alerts Triggered</span>
            <span className="text-2xl font-bold text-cyan-300 block">{metrics.alertsCreated}</span>
            <span className="text-[9px] text-muted-foreground">{metrics.alertsActive} Active</span>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Queued Dispatches</span>
            <span className="text-2xl font-bold text-foreground block">{metrics.notificationsQueued}</span>
            <span className="text-[9px] text-muted-foreground">Async Queue</span>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Delivered</span>
            <span className="text-2xl font-bold text-emerald-400 block">{metrics.notificationsDelivered}</span>
            <span className="text-[9px] text-muted-foreground">{metrics.notificationsSent} Sent</span>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Dead Letter / Failed</span>
            <span className="text-2xl font-bold text-rose-400 block">{metrics.deadLetterCount}</span>
            <span className="text-[9px] text-muted-foreground">{metrics.notificationsSkipped} Policy Skipped</span>
          </div>
        </div>

        {/* Channel Provider Status Badges */}
        <div className="space-y-1.5 border-t border-border/30 pt-3">
          <span className="text-[10px] uppercase text-muted-foreground font-bold block">
            Channel Provider Health Status:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(metrics.providersStatus).map(([ch, st]) => (
              <div
                key={ch}
                className="p-2 rounded bg-card/40 border border-border/40 flex items-center justify-between text-[10px]"
              >
                <span className="font-bold text-foreground">{ch.replace(/_/g, ' ')}</span>
                <Badge
                  variant={st === 'AVAILABLE' ? 'operational' : 'secondary'}
                  className="text-[9px] px-1.5 py-0"
                >
                  {st}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            Active Subscriptions: {metrics.activeSubscriptionsCount} Registered
          </span>
          <span className="text-cyan-400">Zero Duplication Guaranteed (SHA-256 Keys)</span>
        </div>
      </CardContent>
    </Card>
  );
}
