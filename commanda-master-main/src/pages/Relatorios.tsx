import { MainLayout } from '@/components/layout/MainLayout';
import { useComandaStore } from '@/store/comandaStore';
import { format, startOfDay, isToday, isYesterday, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, ClipboardList, CreditCard, Smartphone, Banknote, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function Relatorios() {
  const tabs = useComandaStore((state) => state.tabs);
  const closedTabs = tabs.filter((tab) => tab.status === 'closed');

  // Group closed tabs by date
  const tabsByDate = closedTabs.reduce((acc, tab) => {
    const dateKey = startOfDay(new Date(tab.closedAt!)).toISOString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(tab);
    return acc;
  }, {} as Record<string, typeof closedTabs>);

  // Sort dates descending
  const sortedDates = Object.keys(tabsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate stats
  const today = new Date();
  const todayTabs = closedTabs.filter((tab) => 
    isToday(new Date(tab.closedAt!))
  );
  const yesterdayTabs = closedTabs.filter((tab) => 
    isYesterday(new Date(tab.closedAt!))
  );
  const last7DaysTabs = closedTabs.filter((tab) => 
    new Date(tab.closedAt!) >= subDays(today, 7)
  );

  const todayRevenue = todayTabs.reduce((sum, tab) => sum + tab.total, 0);
  const yesterdayRevenue = yesterdayTabs.reduce((sum, tab) => sum + tab.total, 0);
  const last7DaysRevenue = last7DaysTabs.reduce((sum, tab) => sum + tab.total, 0);

  const revenueChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : 0;

  const paymentStats = {
    pix: closedTabs.filter((t) => t.paymentMethod === 'pix').reduce((sum, t) => sum + t.total, 0),
    card: closedTabs.filter((t) => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0),
    cash: closedTabs.filter((t) => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
  };

  const totalRevenue = paymentStats.pix + paymentStats.card + paymentStats.cash;

  // Chart data for daily revenue (last 7 days)
  const dailyRevenueData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = startOfDay(date).toISOString();
      const dayTabs = tabsByDate[dateKey] || [];
      const revenue = dayTabs.reduce((sum, tab) => sum + tab.total, 0);
      days.push({
        day: format(date, 'EEE', { locale: ptBR }),
        fullDate: format(date, 'dd/MM'),
        revenue,
      });
    }
    return days;
  }, [tabsByDate, today]);

  // Chart data for payment methods
  const paymentChartData = useMemo(() => [
    { name: 'PIX', value: paymentStats.pix, fill: 'hsl(var(--chart-1))' },
    { name: 'Cartão', value: paymentStats.card, fill: 'hsl(var(--chart-2))' },
    { name: 'Dinheiro', value: paymentStats.cash, fill: 'hsl(var(--chart-3))' },
  ].filter(item => item.value > 0), [paymentStats]);

  const chartConfig = {
    revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
    pix: { label: 'PIX', color: 'hsl(var(--chart-1))' },
    card: { label: 'Cartão', color: 'hsl(var(--chart-2))' },
    cash: { label: 'Dinheiro', color: 'hsl(var(--chart-3))' },
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho do seu estabelecimento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Hoje</p>
                <p className="font-display font-bold text-2xl text-foreground">
                  R$ {todayRevenue.toFixed(2)}
                </p>
              </div>
            </div>
            {Number(revenueChange) !== 0 && (
              <div className={cn(
                "mt-3 text-sm flex items-center gap-1",
                Number(revenueChange) > 0 ? "text-success" : "text-destructive"
              )}>
                <TrendingUp className={cn(
                  "w-4 h-4",
                  Number(revenueChange) < 0 && "rotate-180"
                )} />
                {revenueChange}% em relação a ontem
              </div>
            )}
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comandas Hoje</p>
                <p className="font-display font-bold text-2xl text-foreground">
                  {todayTabs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
                <p className="font-display font-bold text-2xl text-foreground">
                  R$ {last7DaysRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="font-display font-bold text-2xl text-foreground">
                  R$ {totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Revenue Chart */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-xl text-foreground mb-6">
              Receita por Dia (Últimos 7 dias)
            </h2>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                    />
                  } 
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-xl text-foreground mb-6">
              Receita por Forma de Pagamento
            </h2>
            {paymentChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
                      />
                    } 
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
            {/* Legend */}
            {paymentChartData.length > 0 && (
              <div className="flex justify-center gap-6 mt-4">
                {paymentChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-xl text-foreground mb-6">
            Detalhes por Forma de Pagamento
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="font-medium text-foreground">PIX</span>
              </div>
              <p className="font-display font-bold text-2xl text-foreground">
                R$ {paymentStats.pix.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {closedTabs.filter((t) => t.paymentMethod === 'pix').length} transações
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>
                <span className="font-medium text-foreground">Cartão</span>
              </div>
              <p className="font-display font-bold text-2xl text-foreground">
                R$ {paymentStats.card.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {closedTabs.filter((t) => t.paymentMethod === 'card').length} transações
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-green-400" />
                </div>
                <span className="font-medium text-foreground">Dinheiro</span>
              </div>
              <p className="font-display font-bold text-2xl text-foreground">
                R$ {paymentStats.cash.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {closedTabs.filter((t) => t.paymentMethod === 'cash').length} transações
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-xl text-foreground mb-6">
            Histórico de Comandas
          </h2>

          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma comanda fechada ainda</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateStr) => {
                const dayTabs = tabsByDate[dateStr];
                const dayTotal = dayTabs.reduce((sum, tab) => sum + tab.total, 0);

                return (
                  <div key={dateStr}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground capitalize">
                        {getDateLabel(dateStr)}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {dayTabs.length} comanda{dayTabs.length !== 1 && 's'} • 
                        <span className="text-primary font-medium ml-1">
                          R$ {dayTotal.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dayTabs.map((tab) => (
                        <div
                          key={tab.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                              #{tab.number}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {tab.customer.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(tab.closedAt!), 'HH:mm')} • 
                                {tab.paymentMethod === 'pix' ? ' PIX' : tab.paymentMethod === 'card' ? ' Cartão' : ' Dinheiro'}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-foreground">
                            R$ {tab.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
