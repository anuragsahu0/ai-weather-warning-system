import { useState } from 'react';
import { RadioTower, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Select } from '../ui/Select.js';
import { useLocation } from '../../context/LocationContext.js';

export function BroadcastTriggerShell({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentLocation } = useLocation();
  const [hazardType, setHazardType] = useState('CLOUDBURST');
  const [severity, setSeverity] = useState('SEVERE');
  const [dispatched, setDispatched] = useState(false);

  const handleSimulateDispatch = () => {
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      onOpenChange(false);
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-500">
          <RadioTower className="w-5 h-5 animate-pulse" />
          Emergency Alert Broadcast Terminal
        </DialogTitle>
        <DialogDescription>
          Authority gateway for dispatching Common Alerting Protocol (CAP) messages to public warning channels and SDRF units.
        </DialogDescription>
      </DialogHeader>

      {dispatched ? (
        <div className="p-6 text-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-foreground">CAP Broadcast Payload Validated</h4>
          <p className="text-xs text-muted-foreground">
            Phase 1 Authority Broadcast pipeline verified in test harness mode.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-2">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              <strong>Authority Command Mode:</strong> Dispatches adhere strictly to the ITU-T X.1303 CAP v1.2 specification.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Target Jurisdiction Sector</label>
            <Input
              value={`${currentLocation.district}, ${currentLocation.state} (${currentLocation.gridId})`}
              readOnly
              className="bg-muted font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Hazard Type</label>
              <Select value={hazardType} onChange={(e) => setHazardType(e.target.value)}>
                <option value="CLOUDBURST">Cloudburst / Extreme Rain</option>
                <option value="FLASH_FLOOD">Flash Flood Rapid Inundation</option>
                <option value="THUNDERSTORM">Severe Convective Thunderstorm</option>
                <option value="CYCLONIC_GUST">Cyclonic Gust & Gale Winds</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Severity Level</label>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="SEVERE">SEVERE (Immediate Danger)</option>
                <option value="HIGH">HIGH (Warning)</option>
                <option value="MODERATE">MODERATE (Watch)</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Emergency Headline</label>
            <Input placeholder="e.g. FLASH FLOOD WARNING: Evacuate low-lying riverbeds immediately" />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="severe"
              size="sm"
              onClick={handleSimulateDispatch}
              className="gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Verify & Dispatch CAP Broadcast
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
