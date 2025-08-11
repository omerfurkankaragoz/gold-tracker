// Konum: supabase/functions/record-portfolio-value/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Fiyatları ve toplam değeri hesaplayan yardımcı fonksiyonlar (değişiklik yok)
const parseApiNumber = (v: any) => v && !isNaN(parseFloat(v.toString().replace(',','.'))) ? parseFloat(v.toString().replace(',','.')) : 0;

async function getPrices() {
    const [currencyResponse, goldResponse] = await Promise.all([
        fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR').catch(e => null),
        fetch('https://finance.truncgil.com/api/today.json').catch(e => null)
    ]);
    let prices: { [key: string]: number } = {};
    if (currencyResponse?.ok) {
        const d = await currencyResponse.json();
        if(d.rates) { prices['usd'] = 1 / d.rates.USD; prices['eur'] = 1 / d.rates.EUR; }
    }
    if (goldResponse?.ok) {
        const d = await goldResponse.json();
        const gm = {'GRA':'gold','CEYREKALTIN':'quarter_gold','YARIMALTIN':'half_gold','TAMALTIN':'full_gold','CUMHURIYETALTINI':'cumhuriyet_gold','ATAALTIN':'ata_gold','14AYARALTIN':'ayar_14_gold','18AYARALTIN':'ayar_18_gold','22AYARBILEZIK':'ayar_22_bilezik'};
        for (const k in gm) if(d[k]?.Satis) prices[gm[k]] = parseApiNumber(d[k].Satis);
    }
    return prices;
}

// Ana fonksiyon
Deno.serve(async (req) => {
  try {
    const supabase = createClient(Deno.env.get('VITE_SUPABASE_URL')!, Deno.env.get('VITE_SUPABASE_ANON_KEY')!);
    const { data: investments } = await supabase.from('investments').select('*');
    if (!investments?.length) return new Response(JSON.stringify({ message: "Yatırım bulunamadı." }), { status: 200 });

    const prices = await getPrices();
    if (!Object.keys(prices).length) throw new Error("Fiyatlar alınamadı.");

    const totalValue = investments.reduce((acc, inv) => acc + (inv.amount * (prices[inv.type] || 0)), 0);
    if (totalValue <= 0) return new Response(JSON.stringify({ message: "Hesaplanacak değer bulunamadı." }), { status: 200 });

    // Bir önceki günün tarihini oluştur (fonksiyon gece 12'den sonra çalışacağı için)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { error } = await supabase.from('portfolio_history').insert({ value: totalValue, recorded_at: yesterday.toISOString() });
    if (error) throw error;

    return new Response(JSON.stringify({ message: "Önceki günün kapanış değeri kaydedildi.", value: totalValue }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});