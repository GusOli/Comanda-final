-- Tabela de Produtos
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price decimal(10,2) not null,
  category text not null,
  description text,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Comandas (Tabs)
create table tabs (
  id uuid default gen_random_uuid() primary key,
  number serial, -- Auto-incremento simples. Para resetar diariamente precisaria de lógica extra, mas isso serve por enquanto.
  customer_name text not null,
  customer_identity text,
  customer_table text,
  status text default 'open', -- 'open' ou 'closed'
  total decimal(10,2) default 0,
  payment_method text,
  amount_paid decimal(10,2),
  change decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- Tabela de Itens da Comanda
create table tab_items (
  id uuid default gen_random_uuid() primary key,
  tab_id uuid references tabs(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null, -- Copia o nome para histórico caso o produto mude
  quantity integer not null default 1,
  unit_price decimal(10,2) not null, -- Copia o preço para histórico
  total_price decimal(10,2) not null,
  notes text,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserir dados iniciais (opcional, baseados no seu código atual)
insert into products (name, price, category, available) values
('Cerveja Heineken', 12.00, 'drinks', true),
('Cerveja Budweiser', 10.00, 'drinks', true),
('Red Bull', 18.00, 'drinks', true),
('Água Mineral', 5.00, 'drinks', true),
('Refrigerante', 7.00, 'drinks', true),
('Essência Zomo', 25.00, 'essences', true),
('Essência Adalya', 30.00, 'essences', true),
('Essência Tangiers', 45.00, 'essences', true),
('Carvão (Caixa)', 15.00, 'accessories', true),
('Piteira Descartável', 3.00, 'accessories', true),
('Porção Batata Frita', 28.00, 'food', true),
('Porção Calabresa', 32.00, 'food', true);
