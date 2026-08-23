import { SeverityLevel } from '@shared/types/index.js';
import { Button } from '../ui/Button.js';
import { cn } from '../../lib/utils.js';

interface SeverityFilterProps {
  selectedSeverity: SeverityLevel | 'ALL';
  onSelectSeverity: (severity: SeverityLevel | 'ALL') => void;
}

export function SeverityFilter({ selectedSeverity, onSelectSeverity }: SeverityFilterProps) {
  const options: { label: string; value: SeverityLevel | 'ALL' }[] = [
    { label: 'All Alerts', value: 'ALL' },
    { label: 'Severe', value: 'SEVERE' },
    { label: 'High', value: 'HIGH' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Low', value: 'LOW' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      {options.map((opt) => {
        const isSelected = selectedSeverity === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectSeverity(opt.value)}
            className={cn(
              'text-xs font-medium h-8',
              isSelected ? 'font-semibold' : 'text-muted-foreground'
            )}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
