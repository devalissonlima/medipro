import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  CheckCircle2,
  RotateCcw,
  UserPlus,
  UserMinus,
  ChevronRight,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { ActivityEvent } from '../../../types/activity';
import { formatRelativeTime } from '../../../utils/dateUtils';
import { formatCurrency } from '@/utils/calculations';

interface ActivityItemProps {
  event: ActivityEvent;
  onMarkAsRead: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ event, onMarkAsRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkAsRead(event.id);
    if (event.targetRoute) {
      navigate(event.targetRoute);
    }
  };

  const getEventConfig = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'measurement_created':
        return {
          icon: FilePlus,
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          badgeText: 'Nova Medição',
          badgeClass: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
        };
      case 'measurement_approved':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          badgeText: 'Aprovada',
          badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        };
      case 'measurement_rejected':
        return {
          icon: RotateCcw,
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          badgeText: 'Revisão Solicitada',
          badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        };
      case 'team_member_joined':
        return {
          icon: UserPlus,
          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          badgeText: 'Membro Ingressou',
          badgeClass: 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300',
        };
      case 'team_member_left':
        return {
          icon: UserMinus,
          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          badgeText: 'Acesso Removido',
          badgeClass: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
        };
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-muted text-muted-foreground',
          badgeText: 'Atividade',
          badgeClass: 'border-border bg-muted text-muted-foreground',
        };
    }
  };

  const config = getEventConfig(event.type);
  const Icon = config.icon;

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-3.5 rounded-lg border p-3.5 transition-all hover:border-primary/40 hover:bg-accent/40 ${
        event.isRead
          ? 'border-border/60 bg-background/50 opacity-80 hover:opacity-100'
          : 'border-border/90 bg-card shadow-xs'
      }`}
    >
      {/* Unread indicator dot */}
      {!event.isRead && (
        <span
          className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-primary"
          title="Não lido"
        />
      )}

      {/* Event Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg} ${
          !event.isRead ? 'ring-2 ring-primary/20' : ''
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {event.actorName}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${config.badgeClass}`}
          >
            {config.badgeText}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>

        <p className="text-sm font-medium text-foreground truncate">
          {event.targetTitle}
        </p>

        {/* Reason when rejected / sent back for rework */}
        {event.reason && (
          <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Motivo:</span> {event.reason}
          </p>
        )}

        {/* Financial amount tag */}
        {event.amount !== undefined && (
          <div className="text-xs font-semibold text-primary">
            {formatCurrency(event.amount)}
          </div>
        )}
      </div>

      {/* Navigation chevron */}
      <div className="self-center pl-1 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};
