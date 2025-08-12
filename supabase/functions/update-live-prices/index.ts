// Konum: supabase/functions/update-live-prices/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const goldApiMap: { [key: string]: string } = {
  'GRA': 'gold', 'CEYREKALTIN': 'quarter_gold', 'YARIMALTIN': 'half_gold',
  'TAMALTIN': 'full_gold', 'CUMHURIYETALTINI': 'cumhuriyet_gold', 'ATAALTIN': 'ata_gold',
  '14AYARALTIN': 'ayar_14_gold', '18AYARALTIN': 'ayar_18_gold', '22AYARBILEZIK': 'ayar_22_bilezik',
};

const parseApiNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numberValue = parseFloat(value.replace(/,/g, '.'));
    return isNaN(numberValue) ? 0 : numberValue;
  }
  return 0;
};

Deno.serve(async (_req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPA_URL')!,
      Deno.env.get('SUPA_SERVICE_KEY')!
    );

    const priceUpdateRows = [];

    // === 1. DÖVİZ FİYATLARINI ÇEK ===
    const currencyResponse = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      const rates = currencyData.rates;
      if (rates && rates.USD) {
        const price = 1 / rates.USD;
        priceUpdateRows.push({ asset_type: 'usd', selling_price: price, buying_price: price });
      }
      if (rates && rates.EUR) {
        const price = 1 / rates.EUR;
        priceUpdateRows.push({ asset_type: 'eur', selling_price: price, buying_price: price });
      }
    } else {
      console.error('Döviz API hatası:', currencyResponse.statusText);
    }

    // === 2. ALTIN FİYATLARINI ÇEK ===
    const goldResponse = await fetch('https://finance.truncgil.com/api/today.json');
    if (goldResponse.ok) {
      const goldData = await goldResponse.json();
      if (goldData) {
        for (const apiKey in goldData) {
          if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
            const goldItem = goldData[apiKey];
            const internalGoldType = goldApiMap[apiKey];
            // DEĞİŞİKLİK: 'Satis' yerine 'Selling', 'Alis' yerine 'Buying' kullanıyoruz.
            const sellingPrice = parseApiNumber(goldItem.Selling);
            const buyingPrice = parseApiNumber(goldItem.Buying);
            priceUpdateRows.push({ asset_type: internalGoldType, selling_price: sellingPrice, buying_price: buyingPrice });
          }
        }
      }
    } else {
      console.error('Altın API hatası:', goldResponse.statusText);
    }

    // === 3. FİYATLARI VERİTABANINA YAZ ===
    if (priceUpdateRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('current_prices')
        .upsert(priceUpdateRows, { onConflict: 'asset_type' });

      if (error) {
        throw new Error(`Supabase upsert hatası: ${error.message}`);
      }
      
      console.log(`${priceUpdateRows.length} adet fiyat başarıyla güncellendi.`);
      return new Response(JSON.stringify({ message: 'Fiyatlar başarıyla güncellendi.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Güncellenecek fiyat verisi bulunamadı.');

  } catch (error) {
    console.error('Fiyat güncelleme fonksiyonunda hata:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});