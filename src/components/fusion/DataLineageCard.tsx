import { GitFork, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useFusedWeather } from '../../hooks/useFusedWeather.js';

export function DataLineageCard() {
  const { fusedData, isLoading } = useFusedWeather();

  if (isLoading || !fusedData) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 text-center text-xs font-mono text-muted-foreground">
        Loading multi-sensor data fusion lineage...
      </Card>
    );
  }

  const { fusedState, lineages } = fusedData;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Multi-Source Data Lineage & Weighted Sensor Fusion (Grid {fusedState.gridId})
          </CardTitle>
        </div>
        <Badge variant="radar" className="font-mono text-xs">
          {fusedState.fusionVersion}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lineages.map((lin) => (
            <div
              key={lin.id}
              className="p-3 rounded-lg bg-card/40 border border-border/40 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
                <span className="font-bold text-foreground capitalize">
                  Variable: <span className="text-cyan-300">{lin.variableName}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Primary: {lin.selectedSourceId.split('_')[1]}
                </span>
              </div>

              {/* Contributing Sources Table */}
              <div className="space-y-1">
                {lin.contributingSources.map((cs) => (
                  <div
                    key={cs.sourceId}
                    className="flex items-center justify-between text-[10px] p-1 rounded bg-muted/20"
                  >
                    <span className="text-muted-foreground">{cs.provider}:</span>
                    <span className="font-bold text-foreground">
                      {cs.rawValue} (Weight: {Math.round(cs.weight * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {lin.conflictResolutionReason && (
                <div className="text-[9px] text-muted-foreground flex items-start gap-1 pt-1">
                  <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{lin.conflictResolutionReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
