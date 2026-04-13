-- Sellers
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null default '',
  address text not null default '',
  tel text not null default '',
  fax text not null default '',
  representative text not null default '',
  bank_name text not null default '',
  bank_swift text not null default '',
  account_no text not null default '',
  accountee text not null default '',
  bank_address text not null default '',
  bank_tel text not null default '',
  bank_fax text not null default '',
  created_at timestamptz not null default now()
);

alter table sellers enable row level security;
create policy "Users can manage own sellers" on sellers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Buyers
create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null default '',
  address text not null default '',
  tel text not null default '',
  contact_person text not null default '',
  created_at timestamptz not null default now()
);

alter table buyers enable row level security;
create policy "Users can manage own buyers" on buyers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  description text not null default '',
  hs_code text not null default '',
  unit text not null default 'PCS',
  unit_price numeric not null default 0,
  remarks text not null default '',
  created_at timestamptz not null default now()
);

alter table products enable row level security;
create policy "Users can manage own products" on products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  invoice_no text not null default '',
  ref_no text not null default '',
  order_no text not null default '',
  date date,
  validity date,
  seller_company_name text not null default '',
  seller_address text not null default '',
  seller_tel text not null default '',
  seller_fax text not null default '',
  seller_representative text not null default '',
  buyer_snapshot jsonb not null default '{}',
  commodity text not null default '',
  currency text not null default 'USD',
  payment_terms text not null default '',
  incoterms text not null default 'FOB',
  delivery text not null default '',
  packing text not null default '',
  remarks text not null default '',
  items jsonb not null default '[]',
  additional_charges jsonb not null default '[]',
  total_amount numeric not null default 0,
  bank_info jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
create policy "Users can manage own invoices" on invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
