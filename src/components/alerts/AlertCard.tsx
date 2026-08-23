import { useState } from 'react';
import { Clock, MapPin, FileCode, CheckCircle2 } from 'lucide-react';
import { WeatherAlert } from '@shared/types/index.js';
import { Card, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { formatDateTime, getSeverityConfig } from '../../lib/utils.js';
import { CAPPayloadViewer } from './CAPPayloadViewer.js';

export function AlertCard({ alert }: { alert: WeatherAlert }) {
  const [showCapModal, setShowCapModal] = useState(false);
  const config = getSeverityConfig(alert.severity);

  return (
    <>
      <Card className={`border ${config.borderClass} ${config.bgClass} backdrop-blur-sm transition-all shadow-sm`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={alert.severity === 'SEVERE' ? 'severe' : 'high'} dot>
                {alert.severity} • {alert.hazardType.replace('_', ' ')}
              </Badge>
              {alert.verified && (
                <Badge variant="operational" className="text-[10px] gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDateTime(alert.sentAt)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground leading-snug">{alert.headline}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
          </div>

          {alert.instruction && (
            <div className="p-2.5 rounded bg-background/60 border border-border/50 text-xs">
              <span className="font-semibold text-foreground mr-1.5">Action Directive:</span>
              <span className="text-muted-foreground">{alert.instruction}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">
                {alert.affectedAreas.map((a) => a.areaDesc).join(', ')}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCapModal(true)}
              className="h-7 text-[11px] gap-1 shrink-0"
            >
              <FileCode className="w-3 h-3" />
              Inspect CAP XML
            </Button>
          </div>
        </CardContent>
      </Card>

      <CAPPayloadViewer
        alert={alert}
        open={showCapModal}
        onOpenChange={setShowCapModal}
      />
    </>
  );
}
