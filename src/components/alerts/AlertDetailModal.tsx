import { ShieldAlert, AlertCircle, Clock, MapPin, X, Layers } from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { AlertEvent } from '@shared/types/index.js';

interface AlertDetailModalProps {
  alert: AlertEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AlertDetailModal({ alert, isOpen, onClose }: AlertDetailModalProps) {
  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-xl p-6 rounded-2xl bg-card border border-border/80 shadow-2xl space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {alert.title}
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Alert ID: {alert.alertId} • Origin: <strong className="text-cyan-300">{alert.origin}</strong>
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status & Risk Metric Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Risk Level</span>
            <span className="text-sm font-bold text-rose-400 block">{alert.riskLevel}</span>
            <span className="text-[9px] text-muted-foreground">Score: {alert.riskScore}/100</span>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Model Prob</span>
            <span className="text-sm font-bold text-foreground block">{Math.round(alert.probability * 100)}%</span>
            <span className="text-[9px] text-muted-foreground">ConvLSTM</span>
          </div>

          <div className="p-2.5 rounded-lg bg-mission-950/60 border border-border/50">
            <span className="text-[9px] uppercase text-muted-foreground block">Status</span>
            <Badge variant="high" className="text-[9px] px-1.5 py-0 mt-0.5">
              {alert.status}
            </Badge>
          </div>
        </div>

        {/* Description & Narrative */}
        <div className="p-3 rounded-lg bg-card/40 border border-border/40 space-y-1.5 text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground block text-[11px]">Overview:</span>
          <p>{alert.description}</p>
          {alert.explanationSummary && (
            <p className="text-[11px] text-foreground/90 pt-1 border-t border-border/30">
              <strong>Atmospheric Driver:</strong> {alert.explanationSummary}
            </p>
          )}
        </div>

        {/* Geospatial & Validity Bounds */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sector Grid: <strong>{alert.gridId}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Valid Until: <strong>{new Date(alert.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</strong></span>
          </div>
        </div>

        {/* Contributing Sources */}
        {alert.contributingSources && alert.contributingSources.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Contributing Factors:
            </span>
            <div className="flex flex-wrap gap-1">
              {alert.contributingSources.map((src) => (
                <Badge key={src} variant="secondary" className="text-[9px] font-mono">
                  {src}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Scientific Legal Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/40 text-[10px] text-amber-300/90">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>SCIENTIFIC DISCLAIMER:</strong> This is an automated AI/model-based early warning assessment generated by ERROR 404. It does <em>not</em> represent an official government emergency warning or legal evacuation directive.
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
