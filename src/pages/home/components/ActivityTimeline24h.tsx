import React from 'react';
import { History, CheckCheck, Inbox } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ActivityEvent, ActivityTab } from '../../../types/activity';
import { ActivityItem } from './ActivityItem';

interface ActivityTimeline24hProps {
  events: ActivityEvent[];
  activeTab: ActivityTab;
  tabCounts: Record<ActivityTab, number>;
  onTabChange: (tab: ActivityTab) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const ActivityTimeline24h: React.FC<ActivityTimeline24hProps> = ({
  events,
  activeTab,
  tabCounts,
  onTabChange,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const tabs: { id: ActivityTab; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'measurements', label: 'Medições' },
    { id: 'team', label: 'Equipe' },
  ];

  const hasUnread = events.some((e) => !e.isRead);

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Histórico Operacional (Últimas 24h)
            </h2>
            <p className="text-xs text-muted-foreground">
              Acompanhamento cronológico de medições e movimentações
            </p>
          </div>
        </div>

        {hasUnread && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-8 gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
          >
            <CheckCheck className="h-3.5 w-3.5 text-primary" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events List or Empty State */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Nenhuma atividade registrada nas últimas 24 horas
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Novas medições criadas, aprovações, revisões e membros adicionados à equipe
            aparecerão automaticamente nesta linha do tempo.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => (
            <ActivityItem
              key={event.id}
              event={event}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
