import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useComandaStore } from '@/store/comandaStore';
import { AddItemDialog } from '@/components/comanda/AddItemDialog';
import { CloseTabDialog } from '@/components/comanda/CloseTabDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Clock, User, MapPin, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TabDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const tab = useComandaStore((state) => state.getTab(id || ''));
  const removeItemFromTab = useComandaStore((state) => state.removeItemFromTab);
  const updateItemQuantity = useComandaStore((state) => state.updateItemQuantity);

  if (!tab) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-foreground mb-2">Comanda não encontrada</h2>
          <p className="text-muted-foreground mb-6">A comanda solicitada não existe ou foi removida.</p>
          <Button onClick={() => navigate('/comandas')}>
            Voltar às Comandas
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isOpen = tab.status === 'open';

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItemFromTab(tab.id, itemId);
    toast.success(`${itemName} removido da comanda`);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(tab.id, itemId, newQuantity);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/comandas')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Comanda #{tab.number}
                </h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  isOpen
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isOpen ? 'Aberta' : 'Fechada'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {tab.customer.name}
                </span>
                {tab.customer.table && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Mesa {tab.customer.table}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {format(new Date(tab.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="flex gap-3">
              <AddItemDialog tabId={tab.id} />
              <CloseTabDialog tab={tab} />
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Itens da Comanda
            </h2>
          </div>

          {tab.items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum item adicionado ainda</p>
              {isOpen && <AddItemDialog tabId={tab.id} />}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {tab.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-secondary/30 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      R$ {item.unitPrice.toFixed(2)} / unidade
                    </p>
                    {item.notes && (
                      <p className="text-xs text-primary mt-1 italic">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {isOpen ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">x{item.quantity}</span>
                    )}

                    <span className="font-bold text-foreground min-w-[80px] text-right">
                      R$ {item.totalPrice.toFixed(2)}
                    </span>

                    {isOpen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveItem(item.id, item.productName)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="p-6 bg-secondary/30 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-lg text-muted-foreground">Total</span>
              <span className="font-display font-bold text-3xl gradient-text">
                R$ {tab.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info (for closed tabs) */}
        {!isOpen && tab.paymentMethod && (
          <div className="glass-card p-6 animate-slide-up">
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              Informações de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                <p className="font-medium text-foreground capitalize">
                  {tab.paymentMethod === 'pix' ? 'PIX' : tab.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pago</p>
                <p className="font-medium text-foreground">
                  R$ {tab.amountPaid?.toFixed(2)}
                </p>
              </div>
              {tab.change && tab.change > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Troco</p>
                  <p className="font-medium text-success">
                    R$ {tab.change.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Fechada em</p>
                <p className="font-medium text-foreground">
                  {format(new Date(tab.closedAt!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
