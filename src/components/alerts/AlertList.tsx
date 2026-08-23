import { WeatherAlert } from '@shared/types/index.js';
import { AlertCard } from './AlertCard.js';
import { EmptyState } from '../feedback/EmptyState.js';
import { ShieldCheck } from 'lucide-react';

interface AlertListProps {
  alerts: WeatherAlert[];
  isLoading?: boolean;
}

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="NO ACTIVE WEATHER ALERTS"
        description="Waiting for verified alert data from meteorological Doppler radars and National Disaster Management Authority."
        badge="ZERO ACTIVE HAZARDS"
      />
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
