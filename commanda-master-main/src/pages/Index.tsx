import { MainLayout } from '@/components/layout/MainLayout';
import { useComandaStore } from '@/store/comandaStore';
import { NewTabDialog } from '@/components/comanda/NewTabDialog';
import { TabCard } from '@/components/comanda/TabCard';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const tabs = useComandaStore((state) => state.tabs);
  const getOpenTabs = useComandaStore((state) => state.getOpenTabs);
  const getClosedTabs = useComandaStore((state) => state.getClosedTabs);
  
  const openTabs = getOpenTabs();
  const closedTabs = getClosedTabs();

  const todayRevenue = closedTabs
    .filter((tab) => {
      const today = new Date();
      const tabDate = tab.closedAt ? new Date(tab.closedAt) : null;
      return tabDate && tabDate.toDateString() === today.toDateString();
    })
    .reduce((sum, tab) => sum + tab.total, 0);

  const stats = [
    {
      label: 'Comandas Abertas',
      value: openTabs.length,
      icon: ClipboardList,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Receita do Dia',
      value: `R$ ${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Comandas',
      value: tabs.length,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Clientes Hoje',
      value: closedTabs.filter((tab) => {
        const today = new Date();
        const tabDate = tab.closedAt ? new Date(tab.closedAt) : null;
        return tabDate && tabDate.toDateString() === today.toDateString();
      }).length,
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do seu estabelecimento
            </p>
          </div>
          <NewTabDialog onTabCreated={(id) => navigate(`/comandas/${id}`)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-5 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display font-bold text-2xl text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Open Tabs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Comandas Abertas
            </h2>
            {openTabs.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {openTabs.length} comanda{openTabs.length !== 1 && 's'}
              </span>
            )}
          </div>

          {openTabs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Nenhuma comanda aberta
              </h3>
              <p className="text-muted-foreground mb-6">
                Crie uma nova comanda para começar a registrar pedidos
              </p>
              <NewTabDialog onTabCreated={(id) => navigate(`/comandas/${id}`)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openTabs.map((tab) => (
                <TabCard
                  key={tab.id}
                  tab={tab}
                  onClick={() => navigate(`/comandas/${tab.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
