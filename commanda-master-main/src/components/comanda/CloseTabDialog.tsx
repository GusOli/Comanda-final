import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import { useComandaStore } from '@/store/comandaStore';
import { PaymentMethod, Tab } from '@/types/comanda';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const paymentMethods: { method: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { method: 'pix', label: 'PIX', icon: Smartphone },
  { method: 'card', label: 'Cartão', icon: CreditCard },
  { method: 'cash', label: 'Dinheiro', icon: Banknote },
];

interface CloseTabDialogProps {
  tab: Tab;
  trigger?: React.ReactNode;
}

export function CloseTabDialog({ tab, trigger }: CloseTabDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [amountPaid, setAmountPaid] = useState(tab.total.toFixed(2));
  const navigate = useNavigate();

  const closeTab = useComandaStore((state) => state.closeTab);

  const paidValue = parseFloat(amountPaid) || 0;
  const change = paidValue - tab.total;

  // Sync amountPaid when tab.total changes or dialog opens


  useEffect(() => {
    if (open) {
      setAmountPaid(tab.total.toFixed(2));
    }
  }, [open, tab.total]);

  const handleClose = () => {
    // Validation removed as per user request (just marking as closed)
    // if (paidValue < tab.total) { ... }

    closeTab(tab.id, selectedMethod, paidValue);
    toast.success(`Comanda #${tab.number} fechada com sucesso!`);
    setOpen(false);
    navigate('/comandas');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="success" size="lg" className="gap-2">
            <CheckCircle className="w-5 h-5" />
            Fechar Conta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Fechar Comanda #{tab.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Total */}
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total da Comanda</p>
            <p className="font-display font-bold text-4xl gradient-text">
              R$ {tab.total.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                    selectedMethod === method
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border/50 bg-secondary/50 hover:border-primary/50"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6",
                    selectedMethod === method ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    selectedMethod === method ? "text-primary" : "text-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid (only for cash) */}
          {selectedMethod === 'cash' && (
            <div className="space-y-2 animate-slide-up">
              <Label htmlFor="amount">Valor Recebido</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={tab.total}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="bg-input border-border/50 text-lg font-bold"
              />
              {change > 0 && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-success font-medium">Troco:</span>
                  <span className="text-success font-bold text-lg">
                    R$ {change.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={handleClose}
              disabled={false}
            >
              Fechar Comanda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
