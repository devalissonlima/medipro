import React from 'react';
import { Calendar, BellRing } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

interface WelcomeHeaderProps {
  greeting: string;
  formattedDate: string;
  contextualSubtitle: string;
  pendingCount?: number;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  greeting,
  formattedDate,
  contextualSubtitle,
  pendingCount = 0,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}
          </h1>
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-400"
            >
              <BellRing className="h-3 w-3 animate-pulse" />
              {pendingCount} {pendingCount === 1 ? 'pendência' : 'pendências'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{contextualSubtitle}</p>
      </div>

      <div className="flex items-center gap-2 self-start rounded-lg border border-border/60 bg-background/80 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-xs sm:self-auto">
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <span className="capitalize">{formattedDate}</span>
      </div>
    </div>
  );
};
