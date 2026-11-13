import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { DailyPulseSummary } from '../../../types/activity';
import { formatCurrency } from '@/utils/calculations';

interface DailyPulseCardsProps {
  summary: DailyPulseSummary;
}

export const DailyPulseCards: React.FC<DailyPulseCardsProps> = ({ summary }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Resumo das Últimas 24h
        </h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          Atualizado em tempo real
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Medições Geradas nas últimas 24h */}
        <Card className="border-border/70 bg-card shadow-xs transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Geradas (24h)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.createdCount24h}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.createdCount24h === 1 ? 'medição' : 'medições'}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.createdAmount24h)} acumulados
            </p>
          </CardContent>
        </Card>

        {/* Medições Aprovadas nas últimas 24h */}
        <Card className="border-border/70 bg-card shadow-xs transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Aprovadas (24h)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.approvedCount24h}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.approvedCount24h === 1 ? 'aprovada' : 'aprovadas'}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.approvedAmount24h)} liquidados
            </p>
          </CardContent>
        </Card>

        {/* Atenção / Ajustes */}
        <Card
          className={`border-border/70 bg-card shadow-xs transition-shadow hover:shadow-md ${
            summary.attentionCount > 0 ? 'border-amber-500/40 bg-amber-500/[0.02]' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Atenção / Ajustes</span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  summary.attentionCount > 0
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  summary.attentionCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {summary.attentionCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.attentionCount === 1 ? 'pendência' : 'pendências'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.attentionCount > 0
                ? 'Necessitam revisão ou ajuste de campo'
                : 'Nenhum ajuste pendente'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
