import { useState } from 'react';
import { Bell, ShieldCheck, MapPin, Moon, X, Check } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useLocation } from '../../context/LocationContext.js';
import { useSubscriptions } from '../../hooks/useSubscriptions.js';
import { HazardType, RiskLevel, NotificationChannel } from '@shared/types/index.js';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPreferencesModal({
  isOpen,
  onClose,
}: NotificationPreferencesModalProps) {
  const { currentLocation } = useLocation();
  const { createSubscription } = useSubscriptions();

  const [channel, setChannel] = useState<NotificationChannel>('IN_APP');
  const [endpoint, setEndpoint] = useState('inapp-browser-session');
  const [radiusKm, setRadiusKm] = useState(5.0);
  const [selectedHazards, setSelectedHazards] = useState<HazardType[]>([
    'HEAVY_RAIN',
    'THUNDERSTORM',
  ]);
  const [minRiskLevel, setMinRiskLevel] = useState<RiskLevel>('HIGH');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [bypassQuietHours, setBypassQuietHours] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleHazard = (h: HazardType) => {
    if (selectedHazards.includes(h)) {
      if (selectedHazards.length > 1) {
        setSelectedHazards(selectedHazards.filter((item) => item !== h));
      }
    } else {
      setSelectedHazards([...selectedHazards, h]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await createSubscription({
        userId: 'ANONYMOUS',
        userName: 'Local Operator',
        channel,
        endpoint,
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        radiusKm,
        gridId: currentLocation.gridId,
        hazardPreferences: selectedHazards,
        minimumRiskLevel: minRiskLevel,
        quietHoursEnabled,
        quietHoursStart: quietHoursEnabled ? quietHoursStart : null,
        quietHoursEnd: quietHoursEnabled ? quietHoursEnd : null,
        bypassQuietHoursForSevere: bypassQuietHours,
        enabled: true,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch {
      // Standby catch
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-card border border-border/80 shadow-2xl space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Early-Warning Notification Subscriptions
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Phase 9 Modular Delivery Channel Configuration
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Channel Selection */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase text-muted-foreground font-bold block">
            1. Delivery Channel:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['IN_APP', 'WEB_PUSH', 'EMAIL'] as NotificationChannel[]).map((ch) => (
              <Button
                key={ch}
                variant={channel === ch ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs font-mono"
                onClick={() => {
                  setChannel(ch);
                  if (ch === 'EMAIL') setEndpoint('operator@error404.local');
                  else if (ch === 'WEB_PUSH') setEndpoint('webpush-endpoint-token');
                  else setEndpoint('inapp-browser-session');
                }}
              >
                {ch.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Location & Radius */}
        <div className="space-y-1.5 p-3 rounded-lg bg-card/40 border border-border/40">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Active Sector: {currentLocation.name}
            </span>
            <span className="text-cyan-300">{currentLocation.gridId}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-muted-foreground">Notification Radius:</span>
            <div className="flex items-center gap-1.5">
              {[2.5, 5.0, 10.0, 25.0].map((r) => (
                <Button
                  key={r}
                  variant={radiusKm === r ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 px-2 text-[10px] font-mono"
                  onClick={() => setRadiusKm(r)}
                >
                  {r} km
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Hazard Preferences */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase text-muted-foreground font-bold block">
            2. Monitored Hazard Types:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'HEAVY_RAIN',
                'THUNDERSTORM',
                'STRONG_WIND',
                'EXTREME_RAINFALL',
              ] as HazardType[]
            ).map((h) => {
              const active = selectedHazards.includes(h);
              return (
                <Button
                  key={h}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 justify-start text-[11px] font-mono gap-2"
                  onClick={() => toggleHazard(h)}
                >
                  <div className={`w-2 h-2 rounded-full ${active ? 'bg-mission-950' : 'bg-cyan-400'}`} />
                  {h.replace(/_/g, ' ')}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Minimum Risk Level */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase text-muted-foreground font-bold block">
            3. Minimum Risk Level Trigger:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['ELEVATED', 'HIGH', 'SEVERE'] as RiskLevel[]).map((lvl) => (
              <Button
                key={lvl}
                variant={minRiskLevel === lvl ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs font-mono"
                onClick={() => setMinRiskLevel(lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="p-3 rounded-lg bg-card/40 border border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              Quiet Hours Schedule
            </span>
            <Button
              variant={quietHoursEnabled ? 'default' : 'outline'}
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            >
              {quietHoursEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {quietHoursEnabled && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-muted-foreground block">From:</span>
                  <input
                    type="text"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full h-7 px-2 rounded bg-background border border-border text-xs font-mono"
                    placeholder="23:00"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground block">To:</span>
                  <input
                    type="text"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full h-7 px-2 rounded bg-background border border-border text-xs font-mono"
                    placeholder="07:00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">Bypass for SEVERE Alerts:</span>
                <Button
                  variant={bypassQuietHours ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => setBypassQuietHours(!bypassQuietHours)}
                >
                  {bypassQuietHours ? 'Yes' : 'No'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Assurance */}
        <div className="flex items-start gap-2 p-2.5 rounded bg-muted/20 border border-border/30 text-[10px] text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>LOCATION PRIVACY:</strong> Your subscription is bound to the discrete 1.1km grid cell identifier. We never track continuous background GPS telemetry.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || savedSuccess}
            className="gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
              </>
            ) : isSubmitting ? (
              'Saving...'
            ) : (
              'Save Subscription'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
