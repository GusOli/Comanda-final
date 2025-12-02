import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Package } from 'lucide-react';
import { useComandaStore } from '@/store/comandaStore';
import { Product, ProductCategory } from '@/types/comanda';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryLabels: Record<ProductCategory, string> = {
  drinks: 'Bebidas',
  essences: 'Essências',
  accessories: 'Acessórios',
  food: 'Comidas',
  other: 'Outros',
};

interface AddItemDialogProps {
  tabId: string;
  trigger?: React.ReactNode;
}

export function AddItemDialog({ tabId, trigger }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('drinks');

  const products = useComandaStore((state) => state.products);
  const addItemToTab = useComandaStore((state) => state.addItemToTab);

  const filteredProducts = products.filter(
    (p) => p.category === activeCategory && p.available
  );

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    addItemToTab(tabId, selectedProduct.id, quantity, notes || undefined);
    toast.success(`${quantity}x ${selectedProduct.name} adicionado!`);

    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) handleReset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="gold" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Adicionar Item</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(Object.keys(categoryLabels) as ProductCategory[]).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0",
                  activeCategory === category && "bg-primary"
                )}
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200 text-left",
                    selectedProduct?.id === product.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border/50 bg-secondary/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {categoryLabels[product.category]}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {product.name}
                  </h4>
                  <span className="text-primary font-bold">
                    R$ {product.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{selectedProduct.name}</h4>
                  <span className="text-primary font-bold">
                    R$ {selectedProduct.price.toFixed(2)} / unidade
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-display font-bold text-xl w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sem gelo, bem gelado..."
                  className="bg-input border-border/50 resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-display font-bold text-2xl gradient-text">
                  R$ {(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleAddItem}
            disabled={!selectedProduct}
          >
            Adicionar à Comanda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
