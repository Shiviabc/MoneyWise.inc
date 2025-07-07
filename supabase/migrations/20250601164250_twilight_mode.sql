-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  currency text default 'USD',
  date_format text default 'MM/DD/YYYY',
  theme text default 'light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  amount decimal(12,2) not null,
  description text not null,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create budgets table
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  amount decimal(12,2) not null,
  period text not null check (period in ('weekly', 'monthly')),
  start_date date not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create functions for automatic timestamp updates
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for automatic timestamp updates
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.handle_updated_at();

create trigger handle_budgets_updated_at
  before update on public.budgets
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Create RLS policies
create policy "Users can only access their own profile"
  on public.users
  for all
  using (auth.uid() = id);

create policy "Users can only access their own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id);

create policy "Users can only access their own budgets"
  on public.budgets
  for all
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);
create index transactions_type_idx on public.transactions(type);
create index budgets_user_id_idx on public.budgets(user_id);
create index budgets_start_date_idx on public.budgets(start_date);