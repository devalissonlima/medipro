import React from 'react';
import { Calendar } from 'lucide-react';

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
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {greeting}
        </h1>
        <p className="text-sm text-muted-foreground">{contextualSubtitle}</p>
      </div>

      <div className="flex items-center gap-2 self-start rounded-lg border border-border/70 bg-card/90 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs sm:self-auto">
        <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span className="capitalize text-slate-700 font-medium">{formattedDate}</span>
      </div>
    </div>
  );
};
