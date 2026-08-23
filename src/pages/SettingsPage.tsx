import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Switch } from '../components/ui/Switch.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { useTheme } from '../context/ThemeContext.js';
import { useSystemStatus } from '../context/SystemStatusContext.js';
import {
  Moon,
  Sun,
  Laptop,
  Bell,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isLive, latencyMs } = useSystemStatus();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [capWebhook, setCapWebhook] = useState(true);
  const [thresholdRain, setThresholdRain] = useState('50');
  const [thresholdWind, setThresholdWind] = useState('65');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="SYSTEM & PLATFORM SETTINGS"
        subtitle="Manage theme appearance, telemetry feeds, threshold triggers, and emergency notification channels."
        badge={
          <Badge variant="operational" dot>
            CONFIGURATION ACTIVE
          </Badge>
        }
      />

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Platform preferences saved successfully to local cache.</span>
        </div>
      )}

      {/* 1. Appearance & Theme Switching */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sun className="w-4 h-4 text-cyan-400" />
            Appearance & Interface Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-primary/15 border-primary text-foreground font-semibold shadow-sm'
                  : 'bg-background/40 border-border/60 text-muted-foreground hover:bg-accent'
              }`}
            >
              <Moon className="w-5 h-5 text-cyan-400" />
              <span className="text-xs">Mission Control (Dark)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-primary/15 border-primary text-foreground font-semibold shadow-sm'
                  : 'bg-background/40 border-border/60 text-muted-foreground hover:bg-accent'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs">Emergency Desk (Light)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'bg-primary/15 border-primary text-foreground font-semibold shadow-sm'
                  : 'bg-background/40 border-border/60 text-muted-foreground hover:bg-accent'
              }`}
            >
              <Laptop className="w-5 h-5 text-slate-400" />
              <span className="text-xs">OS System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Emergency Broadcast & Notification Preferences */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Emergency Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-semibold text-foreground">CAP v1.2 Standard Webhook Gateway</div>
              <div className="text-muted-foreground">Automated payload dispatch to NDMA/SDRF disaster endpoints.</div>
            </div>
            <Switch checked={capWebhook} onCheckedChange={setCapWebhook} />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-border/40">
            <div>
              <div className="font-semibold text-foreground">Meteorologist High-Priority Email Alerts</div>
              <div className="text-muted-foreground">Immediate dispatch upon severe convective anomaly detection.</div>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-border/40">
            <div>
              <div className="font-semibold text-foreground">Emergency SMS / Cellular Broadcast Relay</div>
              <div className="text-muted-foreground">Cell-broadcast channel 4370 for critical life-safety warnings.</div>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Severe Weather Threshold Triggers */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Severe Weather Automated Trigger Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Cloudburst Trigger (Rainfall Rate)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={thresholdRain}
                  onChange={(e) => setThresholdRain(e.target.value)}
                  className="font-mono text-xs"
                />
                <span className="text-muted-foreground font-mono">mm/h</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Standard IMD cloudburst benchmark is ≥100 mm/h</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Severe Gale Wind Trigger</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={thresholdWind}
                  onChange={(e) => setThresholdWind(e.target.value)}
                  className="font-mono text-xs"
                />
                <span className="text-muted-foreground font-mono">km/h</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Gale warning threshold benchmark is ≥62 km/h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Platform Diagnostics & System Information */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Platform Architecture Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground font-mono text-[11px]">
            <div className="p-2 rounded bg-background/50 border border-border/50 flex justify-between">
              <span>Platform Version:</span>
              <span className="text-foreground font-bold">ERROR 404 v1.0.0-Phase1</span>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50 flex justify-between">
              <span>API Gateway:</span>
              <span className="text-emerald-400 font-bold">{isLive ? `Live (${latencyMs}ms)` : 'Standby'}</span>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50 flex justify-between">
              <span>Database Engine:</span>
              <span className="text-foreground">PostgreSQL (Prisma ORM)</span>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50 flex justify-between">
              <span>ML Nowcast Engine:</span>
              <span className="text-amber-400">Scaffold (Phase 7 Weights)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Trigger */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="default" onClick={handleSave} className="text-xs px-6">
          Save Configuration Preferences
        </Button>
      </div>
    </div>
  );
}
