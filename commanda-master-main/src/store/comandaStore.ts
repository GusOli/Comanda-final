import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Tab, Product, TabItem, PaymentMethod, ProductCategory } from '@/types/comanda';
import { toast } from 'sonner';

interface ComandaStore {
  tabs: Tab[];
  products: Product[];
  isLoading: boolean;

  // Inicialização
  fetchInitialData: () => Promise<void>;

  // Tab actions
  createTab: (customer: { name: string; identity?: string; table?: string }) => Promise<Tab | null>;
  closeTab: (tabId: string, paymentMethod: PaymentMethod, amountPaid: number) => Promise<void>;
  getTab: (tabId: string) => Tab | undefined;
  getOpenTabs: () => Tab[];
  getClosedTabs: () => Tab[];

  // Item actions
  addItemToTab: (tabId: string, productId: string, quantity: number, notes?: string) => Promise<void>;
  removeItemFromTab: (tabId: string, itemId: string) => Promise<void>;
  updateItemQuantity: (tabId: string, itemId: string, quantity: number) => Promise<void>;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  getProductsByCategory: (category: ProductCategory) => Product[];
}

export const useComandaStore = create<ComandaStore>((set, get) => ({
  tabs: [],
  products: [],
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      const formattedProducts: Product[] = productsData.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category as ProductCategory,
        description: p.description,
        available: p.available
      }));

      // Fetch Tabs with Items
      const { data: tabsData, error: tabsError } = await supabase
        .from('tabs')
        .select(`
          *,
          tab_items (*)
        `)
        .order('created_at', { ascending: false });

      if (tabsError) throw tabsError;

      const formattedTabs: Tab[] = tabsData.map(t => ({
        id: t.id,
        number: t.number,
        customer: {
          name: t.customer_name,
          identity: t.customer_identity,
          table: t.customer_table
        },
        status: t.status as 'open' | 'closed',
        total: Number(t.total),
        createdAt: new Date(t.created_at),
        closedAt: t.closed_at ? new Date(t.closed_at) : undefined,
        paymentMethod: t.payment_method as PaymentMethod,
        amountPaid: t.amount_paid ? Number(t.amount_paid) : undefined,
        change: t.change ? Number(t.change) : undefined,
        items: t.tab_items.map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          productName: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          totalPrice: Number(i.total_price),
          notes: i.notes,
          addedAt: new Date(i.added_at)
        }))
      }));

      set({ products: formattedProducts, tabs: formattedTabs });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      set({ isLoading: false });
    }
  },

  createTab: async (customer) => {
    try {
      const { data, error } = await supabase
        .from('tabs')
        .insert({
          customer_name: customer.name,
          customer_identity: customer.identity,
          customer_table: customer.table,
          status: 'open',
          total: 0
        })
        .select()
        .single();

      if (error) throw error;

      const newTab: Tab = {
        id: data.id,
        number: data.number,
        customer: {
          name: data.customer_name,
          identity: data.customer_identity,
          table: data.customer_table
        },
        status: 'open',
        total: 0,
        createdAt: new Date(data.created_at),
        items: []
      };

      set(state => ({ tabs: [newTab, ...state.tabs] }));
      return newTab;
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      toast.error('Erro ao criar comanda');
      return null;
    }
  },

  closeTab: async (tabId, paymentMethod, amountPaid) => {
    try {
      const tab = get().tabs.find(t => t.id === tabId);
      if (!tab) return;

      const change = amountPaid - tab.total;
      const closedAt = new Date().toISOString();

      const { error } = await supabase
        .from('tabs')
        .update({
          status: 'closed',
          payment_method: paymentMethod,
          amount_paid: amountPaid,
          change: change,
          closed_at: closedAt
        })
        .eq('id', tabId);

      if (error) throw error;

      set(state => ({
        tabs: state.tabs.map(t =>
          t.id === tabId
            ? {
              ...t,
              status: 'closed',
              paymentMethod,
              amountPaid,
              change,
              closedAt: new Date(closedAt)
            }
            : t
        )
      }));
      toast.success('Comanda fechada com sucesso!');
    } catch (error) {
      console.error('Erro ao fechar comanda:', error);
      toast.error('Erro ao fechar comanda');
    }
  },

  getTab: (tabId) => get().tabs.find((tab) => tab.id === tabId),

  getOpenTabs: () => get().tabs.filter((tab) => tab.status === 'open'),

  getClosedTabs: () => get().tabs.filter((tab) => tab.status === 'closed'),

  addItemToTab: async (tabId, productId, quantity, notes) => {
    try {
      const product = get().products.find(p => p.id === productId);
      if (!product) return;

      const unitPrice = product.price;
      const totalPrice = unitPrice * quantity;

      // Inserir item
      const { data: itemData, error: itemError } = await supabase
        .from('tab_items')
        .insert({
          tab_id: tabId,
          product_id: productId,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          notes
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Atualizar total da comanda no banco
      const tab = get().tabs.find(t => t.id === tabId);
      const newTotal = (tab?.total || 0) + totalPrice;

      const { error: tabError } = await supabase
        .from('tabs')
        .update({ total: newTotal })
        .eq('id', tabId);

      if (tabError) throw tabError;

      const newItem: TabItem = {
        id: itemData.id,
        productId,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice,
        notes,
        addedAt: new Date(itemData.added_at)
      };

      set(state => ({
        tabs: state.tabs.map(t =>
          t.id === tabId
            ? {
              ...t,
              items: [...t.items, newItem],
              total: newTotal
            }
            : t
        )
      }));
      toast.success('Item adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  },

  removeItemFromTab: async (tabId, itemId) => {
    try {
      const tab = get().tabs.find(t => t.id === tabId);
      const item = tab?.items.find(i => i.id === itemId);
      if (!tab || !item) return;

      const { error } = await supabase
        .from('tab_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      const newTotal = tab.total - item.totalPrice;

      await supabase
        .from('tabs')
        .update({ total: newTotal })
        .eq('id', tabId);

      set(state => ({
        tabs: state.tabs.map(t =>
          t.id === tabId
            ? {
              ...t,
              items: t.items.filter(i => i.id !== itemId),
              total: newTotal
            }
            : t
        )
      }));
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  },

  updateItemQuantity: async (tabId, itemId, quantity) => {
    try {
      const tab = get().tabs.find(t => t.id === tabId);
      const item = tab?.items.find(i => i.id === itemId);
      if (!tab || !item) return;

      const newTotalPrice = item.unitPrice * quantity;
      const diff = newTotalPrice - item.totalPrice;
      const newTabTotal = tab.total + diff;

      const { error } = await supabase
        .from('tab_items')
        .update({
          quantity,
          total_price: newTotalPrice
        })
        .eq('id', itemId);

      if (error) throw error;

      await supabase
        .from('tabs')
        .update({ total: newTabTotal })
        .eq('id', tabId);

      set(state => ({
        tabs: state.tabs.map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            total: newTabTotal,
            items: t.items.map(i =>
              i.id === itemId
                ? { ...i, quantity, totalPrice: newTotalPrice }
                : i
            )
          };
        })
      }));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro ao atualizar quantidade');
    }
  },

  addProduct: async (product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          available: product.available
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        category: data.category as ProductCategory,
        description: data.description,
        available: data.available
      };

      set(state => ({ products: [...state.products, newProduct] }));
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  },

  updateProduct: async (productId, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.available !== undefined) dbUpdates.available = updates.available;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', productId);

      if (error) throw error;

      set(state => ({
        products: state.products.map(p =>
          p.id === productId ? { ...p, ...updates } : p
        )
      }));
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  },

  removeProduct: async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      set(state => ({
        products: state.products.filter(p => p.id !== productId)
      }));
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover produto');
    }
  },

  getProductsByCategory: (category) =>
    get().products.filter((product) => product.category === category),
}));
