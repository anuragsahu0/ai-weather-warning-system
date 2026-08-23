import { Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { ModelCard } from '@shared/types/index.js';

interface ModelComparisonTableProps {
  models: ModelCard[];
}

export function ModelComparisonTable({ models }: ModelComparisonTableProps) {
  if (!models || models.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-6 text-center text-xs font-mono text-muted-foreground">
        No baseline ML models evaluated yet. Run training pipeline to generate benchmark skill scores.
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Baseline Model Benchmark Skill Scores (Evaluated on Chronological Test Split)
          </CardTitle>
        </div>
        <Badge variant="operational" className="font-mono text-xs">
          {models.length} Models Registered
        </Badge>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground uppercase">
            <tr>
              <th className="p-2.5">Task / Horizon</th>
              <th className="p-2.5">Algorithm</th>
              <th className="p-2.5">Version</th>
              <th className="p-2.5">Precision</th>
              <th className="p-2.5">Recall</th>
              <th className="p-2.5">F1-Score</th>
              <th className="p-2.5">PR-AUC</th>
              <th className="p-2.5">Brier Score</th>
              <th className="p-2.5">Threshold</th>
              <th className="p-2.5">Confusion (TP/FP/TN/FN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {models.map((m) => {
              const cm = m.metrics.confusionMatrix;
              return (
                <tr key={m.modelId} className="hover:bg-muted/20 transition-colors">
                  <td className="p-2.5 font-bold text-foreground">
                    {m.task.replace(/_/g, ' ')} ({m.horizonMinutes}m)
                  </td>
                  <td className="p-2.5 text-cyan-300">{m.algorithm}</td>
                  <td className="p-2.5 text-muted-foreground">{m.modelVersion}</td>
                  <td className="p-2.5 text-foreground font-bold">{m.metrics.precision.toFixed(2)}</td>
                  <td className="p-2.5 text-foreground font-bold">{m.metrics.recall.toFixed(2)}</td>
                  <td className="p-2.5 text-emerald-400 font-bold">{m.metrics.f1Score.toFixed(2)}</td>
                  <td className="p-2.5 text-muted-foreground">{m.metrics.prAuc ? m.metrics.prAuc.toFixed(2) : '--'}</td>
                  <td className="p-2.5 text-muted-foreground">{m.metrics.brierScore.toFixed(3)}</td>
                  <td className="p-2.5 text-cyan-400">{m.metrics.decisionThreshold.toFixed(2)}</td>
                  <td className="p-2.5 text-muted-foreground">
                    {cm.truePositives} / {cm.falsePositives} / {cm.trueNegatives} / {cm.falseNegatives}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
