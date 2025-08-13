// Konum: supabase/functions/update-prices/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

// Bu harita, API'deki "Rates" objesinin içindeki anahtarları veritabanına çevirir.
const goldApiMap: { [key: string]: string } = {
  'GUMUS': 'gumus', // GÜMÜŞ EŞLEŞTİRMESİ EKLENDİ
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

const parseApiNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numberValue = parseFloat(value.replace(/,/g, '.'));
        return isNaN(numberValue) ? 0 : numberValue;
    }
    return 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fiyat güncelleme fonksiyonu başlatıldı.");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const currencyApiUrl = 'https://api.frankfurter.app/latest?from=TRY&to=USD,EUR';
    const goldApiUrl = 'https://finance.truncgil.com/api/today.json';

    const [currencyResponse, goldResponse] = await Promise.all([
      fetch(currencyApiUrl),
      fetch(goldApiUrl)
    ]);
    
    const rowsToUpsert: any[] = [];
    const now = new Date().toISOString();

    // 1. Döviz verilerini hazırla (Bu bölüm zaten doğru çalışıyor)
    if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates?.USD) rowsToUpsert.push({ asset_type: 'usd', selling_price: 1 / rates.USD, buying_price: 1 / rates.USD, updated_at: now });
        if (rates?.EUR) rowsToUpsert.push({ asset_type: 'eur', selling_price: 1 / rates.EUR, buying_price: 1 / rates.EUR, updated_at: now });
    }
    
    // 2. Altın verilerini işle (NİHAİ VE DOĞRU MANTIK)
    if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        
        // ÖNEMLİ DÜZELTME: Verinin içindeki "Rates" objesine erişiyoruz
        if (goldData && goldData.Rates) {
            const rates = goldData.Rates;
            
            // "Rates" objesinin içindeki her bir anahtar için döngüye giriyoruz
            for (const apiKey in rates) {
                // Anahtarın bizim altın haritamızda olup olmadığını kontrol et
                if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
                    const internalGoldType = goldApiMap[apiKey];
                    const item = rates[apiKey];
                    
                    if (item && typeof item.Selling !== 'undefined' && typeof item.Buying !== 'undefined') {
                        rowsToUpsert.push({
                            asset_type: internalGoldType,
                            selling_price: parseApiNumber(item.Selling),
                            buying_price: parseApiNumber(item.Buying),
                            updated_at: now
                        });
                    }
                }
            }
        }
    }
    
    rowsToUpsert.push({ asset_type: 'tl', selling_price: 1, buying_price: 1, updated_at: now });
    
    // 3. Tüm verileri TEK SEFERDE veritabanına yaz
    if (rowsToUpsert.length > 2) {
        console.log(`${rowsToUpsert.length} adet fiyat verisi güncelleniyor...`);
        const { error } = await supabase.from('current_prices').upsert(rowsToUpsert, { onConflict: 'asset_type' });
        if (error) throw error;
        console.log("Tüm fiyatlar başarıyla güncellendi ✅");
    } else {
        console.warn("Güncellenecek yeterli fiyat verisi bulunamadı.");
    }

    return new Response(JSON.stringify({ message: "İşlem tamamlandı." }), {
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