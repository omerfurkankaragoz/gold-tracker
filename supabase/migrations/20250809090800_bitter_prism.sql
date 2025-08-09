/*
  # Yatırım Takip Uygulaması Veritabanı Şeması

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, Supabase auth referansı)
      - `type` (text) - 'gold', 'usd', 'eur'
      - `amount` (numeric) - miktar
      - `purchase_price` (numeric) - alış fiyatı
      - `purchase_date` (timestamp) - alış tarihi
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `investments` table
    - Add policies for authenticated users to manage their own investments
*/

CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('gold', 'usd', 'eur')),
  amount numeric NOT NULL CHECK (amount > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price > 0),
  purchase_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON investments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_purchase_date ON investments(purchase_date);