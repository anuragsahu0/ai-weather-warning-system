import { Cpu, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { ModelBenchmarkComparison } from '@shared/types/index.js';

interface BenchmarkComparisonCardProps {
  comparison?: ModelBenchmarkComparison;
  isLoading?: boolean;
}

export function BenchmarkComparisonCard({
  comparison,
  isLoading,
}: BenchmarkComparisonCardProps) {
  if (isLoading || !comparison) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-6 text-center text-xs font-mono text-muted-foreground">
        Loading model benchmark comparison...
      </Card>
    );
  }

  const { baselineModel, advancedModel, performanceDelta } = comparison;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Phase 5 Baseline vs. Phase 6 Spatio-Temporal Model Benchmark (Test Split)
          </CardTitle>
        </div>
        <Badge variant="operational" className="font-mono text-xs">
          Unbiased Test Evaluation
        </Badge>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase">
            <tr>
              <th className="p-2.5">Model Architecture</th>
              <th className="p-2.5">Version</th>
              <th className="p-2.5">Rain MAE</th>
              <th className="p-2.5">Rain RMSE</th>
              <th className="p-2.5">Precision</th>
              <th className="p-2.5">Recall</th>
              <th className="p-2.5">F1-Score</th>
              <th className="p-2.5">PR-AUC</th>
              <th className="p-2.5">Brier Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {/* Phase 5 Baseline */}
            <tr className="hover:bg-muted/20">
              <td className="p-2.5 font-bold text-foreground">{baselineModel.name}</td>
              <td className="p-2.5 text-muted-foreground">{baselineModel.version}</td>
              <td className="p-2.5 text-muted-foreground">N/A (Binary)</td>
              <td className="p-2.5 text-muted-foreground">N/A (Binary)</td>
              <td className="p-2.5 text-foreground">{baselineModel.precision.toFixed(2)}</td>
              <td className="p-2.5 text-foreground">{baselineModel.recall.toFixed(2)}</td>
              <td className="p-2.5 text-cyan-300 font-bold">{baselineModel.f1Score.toFixed(2)}</td>
              <td className="p-2.5 text-muted-foreground">{baselineModel.prAuc.toFixed(2)}</td>
              <td className="p-2.5 text-foreground">{baselineModel.brierScore.toFixed(3)}</td>
            </tr>

            {/* Phase 6 Advanced ConvLSTM */}
            <tr className="bg-cyan-950/20 hover:bg-cyan-950/30">
              <td className="p-2.5 font-bold text-cyan-400">{advancedModel.name}</td>
              <td className="p-2.5 text-muted-foreground">{advancedModel.version}</td>
              <td className="p-2.5 text-cyan-300 font-bold">{advancedModel.mae.toFixed(2)} mm/h</td>
              <td className="p-2.5 text-cyan-300 font-bold">{advancedModel.rmse.toFixed(2)} mm/h</td>
              <td className="p-2.5 text-foreground">{advancedModel.precision.toFixed(2)}</td>
              <td className="p-2.5 text-foreground">{advancedModel.recall.toFixed(2)}</td>
              <td className="p-2.5 text-emerald-400 font-bold">{advancedModel.f1Score.toFixed(2)}</td>
              <td className="p-2.5 text-muted-foreground">{advancedModel.prAuc.toFixed(2)}</td>
              <td className="p-2.5 text-foreground">{advancedModel.brierScore.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>

        {/* Scientific Evaluation Narrative */}
        <div className="p-3 bg-muted/20 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>{performanceDelta.summary}</span>
        </div>
      </CardContent>
    </Card>
  );
}
