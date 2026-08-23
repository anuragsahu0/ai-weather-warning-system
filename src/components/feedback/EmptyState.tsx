import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/Button.js';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  badge?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
  badge,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/80 bg-card/30 backdrop-blur-sm transition-all',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3 border border-border/50">
        <Icon className="h-6 w-6" />
      </div>

      {badge && (
        <span className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
          {badge}
        </span>
      )}

      <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-md leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4 text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
