import { DataFreshnessLevel } from '@shared/types/index.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../lib/utils.js';

interface DataFreshnessBadgeProps {
  freshness?: DataFreshnessLevel;
  className?: string;
}

export function DataFreshnessBadge({ freshness = 'UNAVAILABLE', className }: DataFreshnessBadgeProps) {
  switch (freshness) {
    case 'FRESH':
      return (
        <Badge variant="operational" dot className={cn('font-mono text-[10px] tracking-wide', className)}>
          ● LIVE DATA
        </Badge>
      );
    case 'RECENT':
      return (
        <Badge variant="radar" dot className={cn('font-mono text-[10px] tracking-wide', className)}>
          ● RECENT DATA
        </Badge>
      );
    case 'STALE':
      return (
        <Badge variant="standby" dot className={cn('font-mono text-[10px] tracking-wide', className)}>
          ● DATA DELAYED
        </Badge>
      );
    case 'EXPIRED':
    case 'UNAVAILABLE':
    default:
      return (
        <Badge variant="awaiting" className={cn('font-mono text-[10px] tracking-wide', className)}>
          ● DATA UNAVAILABLE
        </Badge>
      );
  }
}
