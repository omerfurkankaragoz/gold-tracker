// Konum: supabase/functions/update-live-prices/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Virgüllü sayısal string'i güvenli bir şekilde sayıya çevirir.
const parseApiNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numberValue = parseFloat(value.replace(/,/g, '.'));
    return isNaN(numberValue) ? 0 : numberValue;
  }
  return 0;
};

// API'den gelen Türkçe isimleri, sizin istediğiniz kısaltmalara çevirir.
const nameToShortCodeMap: { [key: string]: string } = {
  'Gram Altın': 'GRA',
  'Çeyrek Altın': 'CEYREKALTIN',
  'Yarım Altın': 'YARIMALTIN',
  'Tam Altın': 'TAMALTIN',
  'Cumhuriyet Altını': 'CUMHURIYETALTINI',
  'Ata Altın': 'ATAALTIN',
  '14 Ayar Altın': '14AYARALTIN',
  '18 Ayar Altın': '18AYARALTIN',
  '22 Ayar Bilezik': '22AYARBILEZIK',
};

Deno.serve(async (_req) => {
  try {
    // Supabase istemcisini yönetici haklarıyla başlat.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const priceUpdateRows = [];

    // --- Döviz Fiyatlarını Çek ---
    const currencyResponse = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      const rates = currencyData.rates;
      if (rates && rates.USD) priceUpdateRows.push({ asset_type: 'usd', selling_price: 1 / rates.USD, buying_price: 1 / rates.USD });
      if (rates && rates.EUR) priceUpdateRows.push({ asset_type: 'eur', selling_price: 1 / rates.EUR, buying_price: 1 / rates.EUR });
    } else {
      console.error('Döviz API hatası:', currencyResponse.statusText);
    }

    // --- Altın Fiyatlarını Çek ve Dönüştür ---
    const goldResponse = await fetch('https://finance.truncgil.com/api/today.json');
    let transformedGoldData: { Rates: { [key: string]: { Selling: number, Buying: number } } } | null = null;

    if (goldResponse.ok) {
      const originalGoldData = await goldResponse.json();
      transformedGoldData = { Rates: {} };

      // Gelen veriyi sizin istediğiniz formata dönüştür.
      for (const fullName in originalGoldData) {
        if (Object.prototype.hasOwnProperty.call(nameToShortCodeMap, fullName)) {
          const shortCode = nameToShortCodeMap[fullName];
          const item = originalGoldData[fullName];
          transformedGoldData.Rates[shortCode] = {
            Selling: parseApiNumber(item['Satış']),
            Buying: parseApiNumber(item['Alış'])
          };
        }
      }
    } else {
      console.error('Altın API hatası:', goldResponse.statusText);
    }

    // --- DÖNÜŞTÜRÜLMÜŞ VERİYİ KULLANARAK FİYATLARI İŞLE ---
    // Bu bölüm, sizin sağladığınız usePrices.ts dosyasındaki mantıkla BİREBİR AYNIDIR.
    if (transformedGoldData && transformedGoldData.Rates) {
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

      const rates = transformedGoldData.Rates;
      for (const apiKey in rates) { // apiKey: 'GRA', 'CEYREKALTIN', vs.
        if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
          const goldItem = rates[apiKey]; // goldItem: { Selling: ..., Buying: ... }
          const internalGoldType = goldApiMap[apiKey];
          
          priceUpdateRows.push({
            asset_type: internalGoldType,
            selling_price: goldItem.Selling, // Artık 'Selling' anahtarı sorunsuz çalışacak
            buying_price: goldItem.Buying   // Artık 'Buying' anahtarı sorunsuz çalışacak
          });
        }
      }
    }

    // --- Veritabanını Güncelle ---
    if (priceUpdateRows.length === 0) {
      throw new Error('Güncellenecek fiyat verisi bulunamadı.');
    }
    
    const { error } = await supabaseAdmin
      .from('current_prices')
      .upsert(priceUpdateRows, { onConflict: 'asset_type' });

    if (error) {
      throw new Error(`Supabase upsert hatası: ${error.message}`);
    }
    
    const successMessage = `${priceUpdateRows.length} adet fiyat başarıyla güncellendi.`;
    console.log(successMessage);
    
    return new Response(JSON.stringify({ message: successMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Fiyat güncelleme fonksiyonunda genel hata:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});