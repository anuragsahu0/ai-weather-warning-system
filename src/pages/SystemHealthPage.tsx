import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { useSystemHealth } from '../hooks/useMonitoring.js';
import { Activity, RotateCw, Server, Database, Cpu, ShieldAlert, Bell, HardDrive, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function SystemHealthPage() {
  const { health, isLoading, refetch } = useSystemHealth();

  const getStatusBadge = (status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE') => {
    if (status === 'HEALTHY') {
      return (
        <Badge variant="operational" className="font-mono text-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY
        </Badge>
      );
    }
    if (status === 'DEGRADED') {
      return (
        <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1 text-amber-400">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> DEGRADED
        </Badge>
      );
    }
    return (
      <Badge variant="high" className="font-mono text-xs flex items-center gap-1">
        <XCircle className="w-3 h-3 text-rose-400" /> UNAVAILABLE
      </Badge>
    );
  };

  const getServiceIcon = (key: string) => {
    switch (key) {
      case 'database':
        return Database;
      case 'weatherIngestion':
        return Server;
      case 'nowcastingEngine':
        return Cpu;
      case 'riskEngine':
        return ShieldAlert;
      case 'notificationWorker':
        return Bell;
      default:
        return HardDrive;
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="PRODUCTION SYSTEM HEALTH & TELEMETRY"
        subtitle="Real-time subsystem health probes, service latencies, hardware execution status, and operational uptime."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="operational" dot>
              LIVE PROBES ACTIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RotateCw className={`w-3 h-3 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Probes
            </Button>
          </div>
        }
      />

      {isLoading || !health ? (
        <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/70 text-muted-foreground">
          Executing live health probes across all microservice layers...
        </Card>
      ) : (
        <>
          {/* Top Level Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase">Overall Platform State</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1">
                {health.overallStatus}
              </span>
              <span className="text-[9px] text-muted-foreground">Automated Cluster Health</span>
            </Card>

            <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase">System Uptime</span>
              <span className="text-xl font-bold text-foreground block mt-1">
                {Math.floor(health.uptimeSeconds / 60)}m {health.uptimeSeconds % 60}s
              </span>
              <span className="text-[9px] text-muted-foreground">Continuous Operation</span>
            </Card>

            <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase">Hardware Engine</span>
              <span className="text-xl font-bold text-cyan-300 block mt-1">
                Apple MPS / PyTorch
              </span>
              <span className="text-[9px] text-muted-foreground">Hardware Accelerated</span>
            </Card>

            <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase">Environment Mode</span>
              <span className="text-xl font-bold text-foreground block mt-1">
                {health.environment.toUpperCase()}
              </span>
              <span className="text-[9px] text-muted-foreground">Port 5001 + 8000 Mesh</span>
            </Card>
          </div>

          {/* Subsystems Health Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Individual Subsystem Health Probes ({Object.keys(health.services).length} Subsystems)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(health.services).map(([key, s]) => {
                const Icon = getServiceIcon(key);
                return (
                  <Card key={key} className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <h4 className="font-bold text-foreground text-xs">{s.name}</h4>
                          <span className="text-[10px] text-muted-foreground">
                            Latency: <strong className="text-foreground">{s.latencyMs}ms</strong> • Errors: {s.errorCount}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(s.status)}
                    </div>

                    {s.details && (
                      <div className="p-2 rounded bg-background/50 border border-border/40 text-[10px] space-y-0.5 text-muted-foreground">
                        {Object.entries(s.details).map(([dk, dv]) => (
                          <div key={dk} className="flex items-center justify-between">
                            <span className="uppercase text-[9px]">{dk}:</span>
                            <span className="font-bold text-foreground">
                              {Array.isArray(dv) ? dv.join(', ') : String(dv)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
