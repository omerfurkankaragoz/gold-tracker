import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase bağlantısı
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// API'den verileri çek
async function fetchPrices() {
  try {
    const res = await fetch('https://senin-api-url.com/prices');
    if (!res.ok) throw new Error(`API hatası: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API veri çekme hatası:', err);
    return null;
  }
}

// Verileri Supabase'e yaz
async function updatePrices() {
  console.log(`[${new Date().toISOString()}] Güncelleme başlatıldı...`);

  const prices = await fetchPrices();
  if (!prices) return;

  // API verisini Supabase formatına çevir
  const rows = prices.map((p: any) => ({
    asset_type: p.asset_type,
    selling_price: p.selling_price,
    buying_price: p.buying_price,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('current_prices')
    .upsert(rows, { onConflict: 'asset_type' }); // asset_type aynıysa günceller

  if (error) {
    console.error('Supabase güncelleme hatası:', error);
  } else {
    console.log('Fiyatlar güncellendi ✅');
  }
}

// İlk çalıştırma
updatePrices();

// Her 5 dakikada bir tekrar et
setInterval(updatePrices, 5 * 60 * 1000);
