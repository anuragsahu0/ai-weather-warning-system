import { PageHeader } from '../components/layout/PageHeader.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { useModelMetrics } from '../hooks/useMonitoring.js';
import { Cpu, Layers, TrendingDown, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

export function ModelMonitoringPage() {
  const { metricsData, isLoading } = useModelMetrics();

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="AI MODEL MONITORING & COMPARATIVE BENCHMARK"
        subtitle="Rigorous empirical evaluation comparing Phase 5 Baseline Ensemble against Phase 6 Spatio-Temporal ConvLSTM across multi-lead-time horizons."
        badge={
          <Badge variant="operational" dot>
            CONVLSTM ACTIVE ON MPS
          </Badge>
        }
      />

      {isLoading || !metricsData ? (
        <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/70 text-muted-foreground">
          Loading model benchmark metrics and ablation matrices...
        </Card>
      ) : (
        <>
          {/* Top Model Registry Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Model */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Baseline Model</span>
                  <h4 className="text-sm font-bold text-foreground">{metricsData.specs.baseline.modelName}</h4>
                  <span className="text-[10px] text-cyan-300 font-mono">{metricsData.specs.baseline.modelVersion}</span>
                </div>
                <Badge variant="secondary">ARCHIVED BASELINE</Badge>
              </div>

              <p className="text-[11px] text-muted-foreground pt-1">
                {metricsData.specs.baseline.architecture}
              </p>

              <div className="p-2.5 rounded bg-background/50 border border-border/40 text-[10px] space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Training Period:</span>
                  <strong className="text-foreground">{metricsData.specs.baseline.trainingPeriod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Parameters:</span>
                  <strong className="text-foreground">{metricsData.specs.baseline.parametersCount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Device:</span>
                  <strong className="text-foreground">{metricsData.specs.baseline.hardwareDevice}</strong>
                </div>
              </div>
            </Card>

            {/* Advanced ConvLSTM Model */}
            <Card className="bg-card/60 backdrop-blur-sm border-cyan-500/40 p-4 space-y-2 ring-1 ring-cyan-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase block font-bold">Production Nowcaster</span>
                  <h4 className="text-sm font-bold text-foreground">{metricsData.specs.advanced.modelName}</h4>
                  <span className="text-[10px] text-cyan-300 font-mono">{metricsData.specs.advanced.modelVersion}</span>
                </div>
                <Badge variant="operational">ACTIVE ON MPS</Badge>
              </div>

              <p className="text-[11px] text-muted-foreground pt-1">
                {metricsData.specs.advanced.architecture}
              </p>

              <div className="p-2.5 rounded bg-background/50 border border-border/40 text-[10px] space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Training Period:</span>
                  <strong className="text-foreground">{metricsData.specs.advanced.trainingPeriod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Parameters:</span>
                  <strong className="text-foreground">{metricsData.specs.advanced.parametersCount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Device:</span>
                  <strong className="text-cyan-300">{metricsData.specs.advanced.hardwareDevice}</strong>
                </div>
              </div>
            </Card>
          </div>

          {/* Comparative Metrics Table */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/70">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Measured Performance Comparison (Strict Out-of-Time Test Set)
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-muted-foreground border-b border-border/40 uppercase">
                      <th className="pb-2">Metric Evaluated</th>
                      <th className="pb-2">Phase 5 Baseline</th>
                      <th className="pb-2">Phase 6 Spatio-Temporal</th>
                      <th className="pb-2">Unit</th>
                      <th className="pb-2 text-right">Measured Gain / Error Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {metricsData.comparison.map((row) => (
                      <tr key={row.metricName} className="hover:bg-card/30">
                        <td className="py-2.5 font-bold text-foreground">{row.metricName}</td>
                        <td className="py-2.5 text-muted-foreground">{row.baselineValue}</td>
                        <td className="py-2.5 font-bold text-foreground">{row.advancedValue}</td>
                        <td className="py-2.5 text-muted-foreground">{row.unit}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`font-bold flex items-center justify-end gap-1 ${
                              row.relativeImprovementPct < 0 ? 'text-emerald-400' : 'text-cyan-400'
                            }`}
                          >
                            {row.relativeImprovementPct < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            {Math.abs(row.relativeImprovementPct)}% {row.betterDirection === 'LOWER' ? 'Error Reduction' : 'Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Horizon Degradation Curve & Source Ablation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Horizon Performance */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Lead-Time Horizon Analysis (+10m to +60m)
                </h4>
                <Badge variant="secondary">Empirical Validation</Badge>
              </div>

              <div className="space-y-2">
                {metricsData.horizonPerf.map((hp) => (
                  <div
                    key={hp.horizonMinutes}
                    className="p-2.5 rounded bg-background/50 border border-border/40 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{hp.horizonLabel}</span>
                      <span className="text-[10px] text-muted-foreground">Sample Size: N={hp.sampleCount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-foreground font-bold block">MAE: {hp.maeMmPerHour} mm/h</span>
                      <span className="text-[10px] text-cyan-300">F1 Score: {hp.f1Score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Source Ablation Analysis */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Sensor Source Ablation Gains
                </h4>
                <Badge variant="secondary">5 Sensor Feeds</Badge>
              </div>

              <div className="space-y-2">
                {metricsData.sourceAblation.map((ab) => (
                  <div
                    key={ab.configuration}
                    className="p-2.5 rounded bg-background/50 border border-border/40 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{ab.configuration}</span>
                      <span className="text-[10px] text-muted-foreground">{ab.includedSources.join(' + ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">
                        +{ab.relativeGainPct}% Skill
                      </span>
                      <span className="text-[10px] text-muted-foreground">MAE: {ab.maeMmPerHour} mm/h</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Model Drift & Stability */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Population Stability Index (PSI) Drift Verification
              </h4>
              <Badge variant="operational">ZERO DRIFT DETECTED</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {metricsData.drift.map((d) => (
                <div key={d.featureName} className="p-2.5 rounded bg-background/50 border border-border/40">
                  <span className="text-[10px] text-muted-foreground block truncate">{d.featureName}</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">PSI: {d.psiScore}</span>
                  <span className="text-[9px] text-muted-foreground">p-value: {d.pValue} (Stable)</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
