import { ShieldAlert, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { RiskLevel } from '@shared/types/index.js';
import { cn } from '../../lib/utils.js';

interface RiskScoreMeterProps {
  riskScore: number;
  riskLevel: RiskLevel;
  modelProbability: number;
  uncertaintyScore: number;
  hazardType: string;
}

export function RiskScoreMeter({
  riskScore,
  riskLevel,
  modelProbability,
  uncertaintyScore,
  hazardType,
}: RiskScoreMeterProps) {
  const probPct = Math.round(modelProbability * 100);
  const uncPenalty = Math.round(uncertaintyScore * 10);

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Hyper-Local Hazard Risk Index ({hazardType.replace(/_/g, ' ')})
          </CardTitle>
        </div>
        <Badge
          variant={
            riskLevel === 'SEVERE' || riskLevel === 'HIGH'
              ? 'high'
              : riskLevel === 'ELEVATED'
              ? 'standby'
              : 'operational'
          }
          className="font-mono text-xs font-bold"
        >
          {riskLevel} RISK
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono text-xs">
        {/* Core Risk Score & Probability Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {/* 1. Application Risk Score */}
          <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Application Risk Score
            </span>
            <span
              className={cn(
                'text-3xl font-bold block',
                riskScore >= 60
                  ? 'text-rose-400'
                  : riskScore >= 40
                  ? 'text-amber-400'
                  : 'text-cyan-300'
              )}
            >
              {riskScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
            </span>
            <span className="text-[9px] text-muted-foreground">Threshold: 61+ High</span>
          </div>

          {/* 2. Model Probability */}
          <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Model Probability ($P$)
            </span>
            <span className="text-3xl font-bold text-foreground block">
              {probPct}%
            </span>
            <span className="text-[9px] text-muted-foreground">Calibrated ConvLSTM Output</span>
          </div>

          {/* 3. Uncertainty Penalty */}
          <div className="p-3 rounded-lg bg-mission-950/60 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Uncertainty Penalty
            </span>
            <span className="text-3xl font-bold text-amber-400 block">
              -{uncPenalty} pts
            </span>
            <span className="text-[9px] text-muted-foreground">Monte Carlo Dispersion</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>NORMAL (0-20)</span>
            <span>WATCH (21-40)</span>
            <span>ELEVATED (41-60)</span>
            <span>HIGH (61-80)</span>
            <span>SEVERE (81-100)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted/40 border border-border/40 overflow-hidden relative">
            <div
              style={{ width: `${riskScore}%` }}
              className={cn(
                'h-full transition-all',
                riskScore >= 80
                  ? 'bg-rose-600'
                  : riskScore >= 60
                  ? 'bg-rose-500'
                  : riskScore >= 40
                  ? 'bg-amber-500'
                  : riskScore >= 20
                  ? 'bg-cyan-500'
                  : 'bg-emerald-500'
              )}
            />
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/40 text-[10px] text-amber-300/90">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>SCIENTIFIC DISCLAIMER:</strong> This risk score is an automated application index synthesized from multi-source data and AI nowcasting models. It does <em>not</em> represent an official government emergency warning.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
