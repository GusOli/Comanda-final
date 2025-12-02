export type PaymentMethod = 'pix' | 'card' | 'cash';

export type TabStatus = 'open' | 'closed';

export type ProductCategory = 'drinks' | 'essences' | 'accessories' | 'food' | 'other';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description?: string;
  available: boolean;
}

export interface TabItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  addedAt: Date;
}

export interface Customer {
  name: string;
  identity?: string;
  table?: string;
}

export interface Tab {
  id: string;
  number: number;
  customer: Customer;
  items: TabItem[];
  status: TabStatus;
  total: number;
  createdAt: Date;
  closedAt?: Date;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  change?: number;
}

export interface DailyReport {
  date: Date;
  totalTabs: number;
  closedTabs: number;
  openTabs: number;
  totalRevenue: number;
  paymentBreakdown: {
    pix: number;
    card: number;
    cash: number;
  };
}
