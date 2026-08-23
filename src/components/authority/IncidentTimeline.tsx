import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

export function IncidentTimeline() {
  const events: any[] = [];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          EOC Incident & Dispatch Timeline
        </CardTitle>
        <Badge variant="standby">Standby Log</Badge>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="p-6 text-center rounded-lg border border-dashed border-border/60 text-muted-foreground">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-60" />
            <span className="text-xs font-semibold text-foreground block">No Critical Incident Logs</span>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
              Automated trigger logs from Doppler radars, AI nowcasts, and authority dispatches will record chronologically here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">{/* Future events */}</div>
        )}
      </CardContent>
    </Card>
  );
}
