// Konum: supabase/functions/update-prices/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS başlıkları, fonksiyonun tarayıcıdan da test edilebilmesini sağlar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

// Altın API'sinden gelen isimleri, bizim tablomuzdaki isimlere çeviren harita
const goldApiMap: { [key: string]: string } = {
  'GRA': 'gold',
  'CEYREKALTIN': 'quarter_gold',
  'YARIMALTIN': 'half_gold',
  'TAMALTIN': 'full_gold',
  'CUMHURIYETALTINI': 'cumhuriyet_gold',
  'ATAALTIN': 'ata_gold',
  '14AYARALTIN': 'ayar_14_gold',
  '18AYARALTIN': 'ayar_18_gold',
  '22AYARBILEZIK': 'ayar_22_bilezik',
};

// API'den gelen string değeri sayıya çeviren yardımcı fonksiyon
const parseApiNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Virgülü noktaya çevirerek ondalıklı sayıya dönüştür
        const numberValue = parseFloat(value.replace(/,/g, '.'));
        return isNaN(numberValue) ? 0 : numberValue;
    }
    return 0;
}

// Ana fonksiyon
serve(async (req) => {
  // OPTIONS isteği (CORS için) gelirse hemen yanıt ver
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fiyat güncelleme fonksiyonu başlatıldı.");

    // Supabase client'ını oluştur.
    // Çevre değişkenlerini Supabase dashboard'dan ayarlamanız GEREKİR.
    // Özellikle SUPABASE_SERVICE_ROLE_KEY, RLS kurallarını atlamak için önemlidir.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // API Adresleri (vite.config.ts dosyanızdan alındı)
    const currencyApiUrl = 'https://api.frankfurter.app/latest?from=TRY&to=USD,EUR';
    const goldApiUrl = 'https://finance.truncgil.com/api/today.json';

    // İki API'ye aynı anda istek at
    const [currencyResponse, goldResponse] = await Promise.all([
      fetch(currencyApiUrl),
      fetch(goldApiUrl)
    ]);
    
    console.log(`Döviz API Durumu: ${currencyResponse.status}, Altın API Durumu: ${goldResponse.status}`);

    if (!currencyResponse.ok && !goldResponse.ok) {
        throw new Error('Her iki API de yanıt vermedi.');
    }

    // Veritabanına eklenecek satırları tutan dizi
    const rowsToUpsert: any[] = [];
    const now = new Date().toISOString();

    // 1. Döviz verilerini işle
    if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates && rates.USD) {
            rowsToUpsert.push({ asset_type: 'usd', selling_price: 1 / rates.USD, buying_price: 1 / rates.USD, updated_at: now });
        }
        if (rates && rates.EUR) {
            rowsToUpsert.push({ asset_type: 'eur', selling_price: 1 / rates.EUR, buying_price: 1 / rates.EUR, updated_at: now });
        }
    } else {
        console.warn("Döviz fiyatları alınamadı.");
    }
    
    // 2. Altın verilerini işle
    if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        const rates = goldData; // Truncgil API'sinde veriler doğrudan ana objede
        for (const apiKey in rates) {
            if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
                const internalGoldType = goldApiMap[apiKey];
                const goldItem = rates[apiKey];
                rowsToUpsert.push({
                    asset_type: internalGoldType,
                    selling_price: parseApiNumber(goldItem.Satis),
                    buying_price: parseApiNumber(goldItem.Alis),
                    updated_at: now
                });
            }
        }
    } else {
        console.warn("Altın fiyatları alınamadı.");
    }
    
    // Her zaman TL verisini ekle
    rowsToUpsert.push({ asset_type: 'tl', selling_price: 1, buying_price: 1, updated_at: now });
    
    console.log(`${rowsToUpsert.length} adet fiyat verisi Supabase'e yazılmak için hazırlanıyor.`);
    console.log(rowsToUpsert);


    // Verileri `current_prices` tablosuna yaz (upsert ile)
    const { error } = await supabase
      .from('current_prices')
      .upsert(rowsToUpsert, { onConflict: 'asset_type' });

    if (error) {
      console.error("Supabase'e yazma hatası:", error);
      throw error;
    }
    
    console.log("Fiyatlar başarıyla güncellendi ✅");

    return new Response(JSON.stringify({ message: "Fiyatlar başarıyla güncellendi!" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Fonksiyonda beklenmedik bir hata oluştu:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});