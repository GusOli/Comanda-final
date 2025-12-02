import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, CreditCard, MapPin } from 'lucide-react';
import { useComandaStore } from '@/store/comandaStore';
import { toast } from 'sonner';

interface NewTabDialogProps {
  onTabCreated?: (tabId: string) => void;
}

export function NewTabDialog({ onTabCreated }: NewTabDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [identity, setIdentity] = useState('');
  const [table, setTable] = useState('');

  const createTab = useComandaStore((state) => state.createTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const tab = await createTab({
      name: name.trim(),
      identity: identity.trim() || undefined,
      table: table.trim() || undefined,
    });

    if (tab) {
      toast.success(`Comanda #${tab.number} criada com sucesso!`);

      setName('');
      setIdentity('');
      setTable('');
      setOpen(false);

      onTabCreated?.(tab.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Nova Comanda
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Nova Comanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Nome do Cliente *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome"
              className="bg-input border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identity" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Documento (opcional)
            </Label>
            <Input
              id="identity"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="RG ou CPF"
              className="bg-input border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Mesa (opcional)
            </Label>
            <Input
              id="table"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="Número da mesa"
              className="bg-input border-border/50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gold" className="flex-1">
              Criar Comanda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
