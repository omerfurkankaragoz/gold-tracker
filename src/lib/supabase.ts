import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Investment tipine 'gumus' ekleniyor.
export type Investment = {
  id: string;
  type: 'gold' | 'usd' | 'eur' | 'tl' | 'gumus' | 'quarter_gold' | 'half_gold' | 'full_gold' | 'cumhuriyet_gold' | 'ata_gold' | 'ayar_14_gold' | 'ayar_18_gold' | 'ayar_22_bilezik';
  amount: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
};