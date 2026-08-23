import { Radio, RadioTower } from 'lucide-react';
import { Card, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';

export function EOCSummaryBanner({ onOpenBroadcastModal }: { onOpenBroadcastModal: () => void }) {
  return (
    <Card className="bg-card/70 border-cyan-500/30 backdrop-blur-md">
      <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <RadioTower className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                EMERGENCY OPERATIONS CENTER (EOC) COMMAND DECK
              </span>
              <Badge variant="operational" dot>
                EOC DISPATCH READY
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              National Disaster Management Authority (NDMA) & State Disaster Response (SDRF) Early Warning Dispatch Protocol.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <Button
            variant="radar"
            onClick={onOpenBroadcastModal}
            className="text-xs font-semibold gap-2 w-full sm:w-auto"
          >
            <Radio className="w-3.5 h-3.5" />
            Trigger CAP Emergency Broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
