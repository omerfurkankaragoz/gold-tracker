import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Investment = {
  id: string;
  user_id: string;
  type: 'gold' | 'usd' | 'eur';
  amount: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
};