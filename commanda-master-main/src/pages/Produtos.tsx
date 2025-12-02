import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useComandaStore } from '@/store/comandaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
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

const categoryColors: Record<ProductCategory, string> = {
  drinks: 'bg-blue-500/10 text-blue-400',
  essences: 'bg-purple-500/10 text-purple-400',
  accessories: 'bg-orange-500/10 text-orange-400',
  food: 'bg-green-500/10 text-green-400',
  other: 'bg-gray-500/10 text-gray-400',
};

export default function Produtos() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const products = useComandaStore((state) => state.products);
  const addProduct = useComandaStore((state) => state.addProduct);
  const updateProduct = useComandaStore((state) => state.updateProduct);
  const removeProduct = useComandaStore((state) => state.removeProduct);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'drinks' as ProductCategory,
    available: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'drinks',
      available: true,
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        available: product.available,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Preço inválido');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        price,
        category: formData.category,
        available: formData.available,
      });
      toast.success('Produto atualizado!');
    } else {
      addProduct({
        name: formData.name.trim(),
        price,
        category: formData.category,
        available: formData.available,
      });
      toast.success('Produto criado!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    removeProduct(product.id);
    toast.success(`${product.name} removido`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Produtos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o catálogo de produtos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="lg" className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-5 h-5" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Cerveja Heineken"
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ProductCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoryLabels) as ProductCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Disponível para venda</Label>
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gold" className="flex-1">
                    {editingProduct ? 'Salvar' : 'Criar Produto'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
            className={cn(activeCategory === 'all' && "bg-primary")}
          >
            Todos ({products.length})
          </Button>
          {(Object.keys(categoryLabels) as ProductCategory[]).map((category) => {
            const count = products.filter((p) => p.category === category).length;
            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className={cn(activeCategory === category && "bg-primary")}
              >
                {categoryLabels[category]} ({count})
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "glass-card p-5 transition-all duration-200 hover:scale-[1.02]",
                !product.available && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  categoryColors[product.category]
                )}>
                  {categoryLabels[product.category]}
                </span>
                {!product.available && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                    Indisponível
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground flex-1">{product.name}</h3>
              </div>

              <p className="font-display font-bold text-2xl gradient-text mb-4">
                R$ {product.price.toFixed(2)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleOpenDialog(product)}
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(product)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
