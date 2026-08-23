import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader.js';
import { EmptyState } from '../components/feedback/EmptyState.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { History, Search, Calendar } from 'lucide-react';

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const historicalEvents: any[] = [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="HISTORICAL SEVERE WEATHER EVENT ARCHIVE"
        subtitle="Catalog of verified severe convective episodes, cloudburst events, cyclonic surges, and post-incident AI nowcast evaluations."
        badge={
          <Badge variant="operational" dot>
            ARCHIVE READY
          </Badge>
        }
      />

      {/* Search & Filter Dock */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-card/60 border border-border/70 backdrop-blur-sm">
        <div className="w-full sm:max-w-xs">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by district, event type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono self-end sm:self-center">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Historical Retention: 365 Days</span>
        </div>
      </div>

      {/* Historical Records Table Container */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Verified Event Log
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical ground-truth verification registry
            </p>
          </div>
          <Badge variant="standby">0 Recorded Events</Badge>
        </CardHeader>

        <CardContent>
          {historicalEvents.length === 0 ? (
            <EmptyState
              icon={History}
              title="NO HISTORICAL SEVERE WEATHER EVENTS LOGGED"
              description="Historical convective episodes, rainfall extremes, and model validation records will be archived here as severe weather occurs."
              badge="EMPTY DATABASE REPOSITORY"
              className="py-12"
            />
          ) : (
            <div className="overflow-x-auto">
              {/* Table rendering for populated state in future phases */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
