import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// API'den fiyatları çek
async function fetchPrices() {
  const res = await fetch('https://senin-api-url.com/prices');
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return await res.json();
}

// Main function
Deno.serve(async (_req) => {
  try {
    console.log('💹 Fiyat güncelleme başlatıldı...');
    const prices = await fetchPrices();

    const rows = prices.map((p: any) => ({
      asset_type: p.asset_type,
      selling_price: p.selling_price,
      buying_price: p.buying_price,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('current_prices')
      .upsert(rows, { onConflict: 'asset_type' });

    if (error) {
      console.error('❌ Supabase güncelleme hatası:', error);
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    console.log('✅ Fiyatlar güncellendi.');
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('❌ Hata:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
