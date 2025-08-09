import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Investment tipine yeni altın türlerini ekliyoruz.
export type Investment = {
  id: string;
  type: 'gold' | 'usd' | 'eur' | 'quarter_gold' | 'half_gold' | 'full_gold';
  amount: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
};