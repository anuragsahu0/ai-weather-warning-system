import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../feedback/EmptyState.js';

interface ChartContainerProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  hasData?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  hasData = false,
  emptyTitle = 'Awaiting Historical Weather Data',
  emptyDescription = 'Visualization series will populate as meteorological observations and model runs accumulate.',
}: ChartContainerProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <Badge variant="awaiting">Awaiting data</Badge>
      </CardHeader>

      <CardContent className="pt-2">
        {hasData ? (
          children
        ) : (
          <EmptyState
            icon={BarChart3}
            title={emptyTitle}
            description={emptyDescription}
            className="min-h-[220px] bg-transparent border-border/40"
          />
        )}
      </CardContent>
    </Card>
  );
}
