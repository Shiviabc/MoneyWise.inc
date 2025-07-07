/*
  # Add Income Sources and Bank Accounts Tables

  1. New Tables
    - `income_sources`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, income source name)
      - `amount` (decimal, income amount)
      - `frequency` (text, payment frequency)
      - `source_type` (text, manual/bank/employer)
      - `bank_account_id` (uuid, optional foreign key)
      - `is_active` (boolean, whether source is active)
      - `next_payment_date` (date, optional next payment)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `bank_name` (text, name of bank)
      - `account_name` (text, account nickname)
      - `account_type` (text, checking/savings/credit)
      - `account_number_masked` (text, masked account number)
      - `is_connected` (boolean, connection status)
      - `last_sync` (timestamp, last sync time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access their own data
*/

-- Create income_sources table
CREATE TABLE IF NOT EXISTS public.income_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount decimal(12,2) NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually')),
  source_type text NOT NULL CHECK (source_type IN ('manual', 'bank', 'employer')),
  bank_account_id uuid,
  is_active boolean DEFAULT true,
  next_payment_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit')),
  account_number_masked text NOT NULL,
  is_connected boolean DEFAULT false,
  last_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraint for bank_account_id in income_sources
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'income_sources_bank_account_id_fkey'
  ) THEN
    ALTER TABLE public.income_sources 
    ADD CONSTRAINT income_sources_bank_account_id_fkey 
    FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER handle_income_sources_updated_at
  BEFORE UPDATE ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own income sources"
  ON public.income_sources
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own bank accounts"
  ON public.bank_accounts
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS income_sources_user_id_idx ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS income_sources_frequency_idx ON public.income_sources(frequency);
CREATE INDEX IF NOT EXISTS income_sources_is_active_idx ON public.income_sources(is_active);
CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS bank_accounts_is_connected_idx ON public.bank_accounts(is_connected);