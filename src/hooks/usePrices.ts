import { useState, useEffect, useCallback } from 'react';

export type Price = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

const initialPrices: Record<string, Price> = {
  usd: { symbol: 'USD', name: 'Amerikan Doları', price: 0, change: 0, changePercent: 0 },
  eur: { symbol: 'EUR', name: 'Euro', price: 0, change: 0, changePercent: 0 },
  tl: { symbol: 'TRY', name: 'Türk Lirası', price: 1, change: 0, changePercent: 0 }, // TL eklendi
  gold: { symbol: 'GA', name: 'Gram Altın', price: 0, change: 0, changePercent: 0 },
  quarter_gold: { symbol: 'C', name: 'Çeyrek Altın', price: 0, change: 0, changePercent: 0 },
  half_gold: { symbol: 'Y', name: 'Yarım Altın', price: 0, change: 0, changePercent: 0 },
  full_gold: { symbol: 'T', name: 'Tam Altın', price: 0, change: 0, changePercent: 0 },
  cumhuriyet_gold: { symbol: 'CUM', name: 'Cumhuriyet Altını', price: 0, change: 0, changePercent: 0 },
  ata_gold: { symbol: 'ATA', name: 'Ata Altın', price: 0, change: 0, changePercent: 0 },
  ayar_14_gold: { symbol: '14A', name: '14 Ayar Altın', price: 0, change: 0, changePercent: 0 },
  ayar_18_gold: { symbol: '18A', name: '18 Ayar Altın', price: 0, change: 0, changePercent: 0 },
  ayar_22_bilezik: { symbol: '22A', name: '22 Ayar Bilezik', price: 0, change: 0, changePercent: 0 },
};


// API'nin "GRA", "CEY" gibi kısaltmalarını bizim tiplerimizle eşleştiriyoruz.
const goldApiMap: { [key: string]: keyof typeof initialPrices } = {
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

// API'den gelen değeri güvenli bir şekilde sayıya çeviren yardımcı fonksiyon.
const parseApiNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numberValue = parseFloat(value.replace(/,/g, '.'));
        return isNaN(numberValue) ? 0 : numberValue;
    }
    return 0;
}

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, Price>>(initialPrices);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    console.log("Fiyatlar çekilmeye başlanıyor (Son Düzeltme ile)...");

    try {
      const [currencyResponse, goldResponse] = await Promise.all([
        fetch('/api_currency/latest?from=TRY&to=USD,EUR'),
        fetch('/api_gold/today.json')
      ]);

      const newPrices = JSON.parse(JSON.stringify(initialPrices));

      // Döviz verilerini işle
      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates.USD) newPrices.usd.price = 1 / rates.USD;
        if (rates.EUR) newPrices.eur.price = 1 / rates.EUR;
      } else {
        console.error('Döviz API isteği başarısız oldu.', currencyResponse);
      }

      // Altın verilerini işle (KESİN ÇÖZÜM)
      if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        console.log("API'den Gelen Ham Veri:", goldData);

        // DÜZELTME: Verilerin 'Rates' nesnesi içinde olduğunu kontrol ediyoruz.
        if (goldData && goldData.Rates) {
          const rates = goldData.Rates;
          // 'Rates' nesnesinin kendi anahtarları (GRA, CEY vb.) üzerinde döngü kuruyoruz.
          for (const apiKey in rates) {
            if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
              const goldItem = rates[apiKey];
              
              if (goldItem && (typeof goldItem.Selling === 'number' || typeof goldItem.Selling === 'string')) {
                const internalGoldType = goldApiMap[apiKey];
                const priceAsNumber = parseApiNumber(goldItem.Selling);
                
                newPrices[internalGoldType].price = priceAsNumber;
                const displayName = goldItem.Name || apiKey;
                console.log(`[OK] ${displayName} fiyatı işlendi: ${goldItem.Selling} -> ${priceAsNumber}`);
              } else {
                console.warn(`[UYARI] '${apiKey}' için 'Selling' alanı bulunamadı veya formatı yanlış.`);
              }
            }
          }
        } else {
          console.error("[HATA] API yanıtında beklenen 'Rates' nesnesi bulunamadı.");
        }
      } else {
         console.error('Altın API isteği başarısız oldu.', goldResponse);
      }
      
      setPrices(newPrices);
      console.log("Fiyatlar başarıyla güncellendi.", newPrices);

    } catch (error)      {
      console.error('Fiyatları alırken genel bir hata oluştu:', error);
      setPrices(initialPrices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading };
}
