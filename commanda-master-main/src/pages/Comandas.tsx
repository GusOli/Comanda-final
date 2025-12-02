import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useComandaStore } from '@/store/comandaStore';
import { NewTabDialog } from '@/components/comanda/NewTabDialog';
import { TabCard } from '@/components/comanda/TabCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'open' | 'closed';

export default function Comandas() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  
  const tabs = useComandaStore((state) => state.tabs);
  const openTabs = tabs.filter((tab) => tab.status === 'open');
  const closedTabs = tabs.filter((tab) => tab.status === 'closed');

  const filteredTabs = filter === 'all' 
    ? tabs 
    : filter === 'open' 
      ? openTabs 
      : closedTabs;

  const sortedTabs = [...filteredTabs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Comandas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as comandas do estabelecimento
            </p>
          </div>
          <NewTabDialog onTabCreated={(id) => navigate(`/comandas/${id}`)} />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Todas', count: tabs.length },
            { key: 'open', label: 'Abertas', count: openTabs.length },
            { key: 'closed', label: 'Fechadas', count: closedTabs.length },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key as FilterType)}
              className={cn(
                "gap-2",
                filter === key && "bg-primary"
              )}
            >
              {label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                filter === key 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </Button>
          ))}
        </div>

        {/* Tabs Grid */}
        {sortedTabs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h3 className="font-semibold text-foreground mb-2">
              Nenhuma comanda encontrada
            </h3>
            <p className="text-muted-foreground">
              {filter === 'open' 
                ? 'Não há comandas abertas no momento' 
                : filter === 'closed'
                  ? 'Não há comandas fechadas'
                  : 'Crie sua primeira comanda para começar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTabs.map((tab) => (
              <TabCard
                key={tab.id}
                tab={tab}
                onClick={() => navigate(`/comandas/${tab.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
