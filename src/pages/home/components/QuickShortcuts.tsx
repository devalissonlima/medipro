import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Layers, LayoutDashboard, Users, UserCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { useAuthStore } from '../../../stores/authStore';

interface QuickShortcutsProps {
  pendingCount?: number;
}

export const QuickShortcuts: React.FC<QuickShortcutsProps> = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'gestor' || user?.role === 'admin';

  const shortcuts = [
    {
      id: 'nova-medicao',
      title: 'Nova Medição',
      description: 'Crie uma nova medição ou orçamento de obra',
      icon: PlusCircle,
      route: '/medicoes/nova',
      isPrimary: true,
      badge: null,
    },
    {
      id: 'servicos',
      title: 'Tabela de Serviços',
      description: 'Gerencie preços por m², metro linear e unidade',
      icon: Layers,
      route: '/servicos',
      isPrimary: false,
      badge: null,
    },
    {
      id: 'dashboard',
      title: 'Dashboard Operacional',
      description: 'Acompanhe fluxo financeiro, pendências e auditoria',
      icon: LayoutDashboard,
      route: '/dashboard',
      isPrimary: false,
      badge: pendingCount > 0 ? `${pendingCount} aguardando` : null,
      badgeVariant: 'warning' as const,
    },
    isManager
      ? {
          id: 'equipe',
          title: 'Minha Equipe',
          description: 'Gerencie colaboradores, convites e licenças ativas',
          icon: Users,
          route: '/equipe',
          isPrimary: false,
          badge: null,
        }
      : {
          id: 'clientes',
          title: 'Meus Clientes',
          description: 'Acesse o mini CRM e histórico de medições',
          icon: UserCheck,
          route: '/clientes',
          isPrimary: false,
          badge: null,
        },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ações Rápidas
        </h2>
        <span className="text-xs text-muted-foreground">Acesso direto com 1 clique</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <button
              key={shortcut.id}
              type="button"
              onClick={() => navigate(shortcut.route)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 text-left transition-all hover:scale-[1.01] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                shortcut.isPrimary
                  ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:border-primary'
                  : 'border-border/70 bg-card hover:border-border hover:bg-accent/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      shortcut.isPrimary
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {shortcut.badge && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
                    >
                      {shortcut.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {shortcut.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {shortcut.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                <span>Acessar</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
