// supabase/functions/update-prices/index.ts
// Bu dosyayı Supabase projenizde oluşturun

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Altın API haritalama
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
}

const parseApiNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numberValue = parseFloat(value.replace(/,/g, '.'));
    return isNaN(numberValue) ? 0 : numberValue;
  }
  return 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fiyat güncelleme başlatıldı...')

    // API'lerden veri çek
    const [currencyResponse, goldResponse] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR'),
      fetch('https://finance.truncgil.com/api/today.json')
    ])

    const priceUpdates: any[] = []

    // TL için varsayılan
    priceUpdates.push({
      asset_type: 'tl',
      selling_price: 1,
      buying_price: 1,
      updated_at: new Date().toISOString()
    })

    // Döviz fiyatları
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json()
      const rates = currencyData.rates

      if (rates && rates.USD) {
        const price = 1 / rates.USD
        priceUpdates.push({
          asset_type: 'usd',
          selling_price: price,
          buying_price: price,
          updated_at: new Date().toISOString()
        })
      }

      if (rates && rates.EUR) {
        const price = 1 / rates.EUR
        priceUpdates.push({
          asset_type: 'eur',
          selling_price: price,
          buying_price: price,
          updated_at: new Date().toISOString()
        })
      }
    }

    // Altın fiyatları
    if (goldResponse.ok) {
      const goldData = await goldResponse.json()
      if (goldData && goldData.Rates) {
        const rates = goldData.Rates
        for (const apiKey in rates) {
          if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
            const goldItem = rates[apiKey]
            const internalGoldType = goldApiMap[apiKey]
            
            priceUpdates.push({
              asset_type: internalGoldType,
              selling_price: parseApiNumber(goldItem.Selling || 0),
              buying_price: parseApiNumber(goldItem.Buying || 0),
              updated_at: new Date().toISOString()
            })
          }
        }
      }
    }

    // Supabase'e kaydet
    const { error } = await supabaseClient
      .from('current_prices')
      .upsert(priceUpdates, { onConflict: 'asset_type' })

    if (error) {
      throw error
    }

    console.log(`${priceUpdates.length} fiyat başarıyla güncellendi`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated_count: priceUpdates.length,
        message: 'Fiyatlar başarıyla güncellendi' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Fiyat güncelleme hatası:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})