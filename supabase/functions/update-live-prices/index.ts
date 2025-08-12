// Konum: supabase/functions/update-live-prices/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// DEĞİŞİKLİK: 'goldApiMap' objesinin anahtarları, API'den gelen gerçek Türkçe isimlerle değiştirildi.
const goldApiMap: { [key: string]: string } = {
  'Gram Altın': 'gold',
  'Çeyrek Altın': 'quarter_gold',
  'Yarım Altın': 'half_gold',
  'Tam Altın': 'full_gold',
  'Cumhuriyet Altını': 'cumhuriyet_gold',
  'Ata Altın': 'ata_gold',
  '14 Ayar Altın': 'ayar_14_gold',
  '18 Ayar Altın': 'ayar_18_gold',
  '22 Ayar Bilezik': 'ayar_22_bilezik',
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

    // Döviz Fiyatları (Bu kısım doğru çalışıyor)
    const currencyResponse = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      const rates = currencyData.rates;
      if (rates && rates.USD) priceUpdateRows.push({ asset_type: 'usd', selling_price: 1 / rates.USD, buying_price: 1 / rates.USD });
      if (rates && rates.EUR) priceUpdateRows.push({ asset_type: 'eur', selling_price: 1 / rates.EUR, buying_price: 1 / rates.EUR });
    } else {
      console.error('Döviz API hatası:', currencyResponse.statusText);
    }

    // Altın Fiyatları (Bu kısım artık doğru çalışacak)
    const goldResponse = await fetch('https://finance.truncgil.com/api/today.json');
    if (goldResponse.ok) {
      const goldData = await goldResponse.json();
      if (goldData) {
        for (const apiKey in goldData) {
          if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
            const goldItem = goldData[apiKey];
            const internalGoldType = goldApiMap[apiKey];
            const sellingPrice = parseApiNumber(goldItem.Selling);
            const buyingPrice = parseApiNumber(goldItem.Buying);
            priceUpdateRows.push({ asset_type: internalGoldType, selling_price: sellingPrice, buying_price: buyingPrice });
          }
        }
      }
    } else {
      console.error('Altın API hatası:', goldResponse.statusText);
    }

    // Fiyatları Veritabanına Yazma
    if (priceUpdateRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('current_prices')
        .upsert(priceUpdateRows, { onConflict: 'asset_type' });

      if (error) throw new Error(`Supabase upsert hatası: ${error.message}`);
      
      console.log(`${priceUpdateRows.length} adet fiyat başarıyla güncellendi.`);
      return new Response(JSON.stringify({ message: `${priceUpdateRows.length} adet fiyat başarıyla güncellendi.` }), {
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