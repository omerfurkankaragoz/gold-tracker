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
  tl: { symbol: 'TRY', name: 'Türk Lirası', price: 1, change: 0, changePercent: 0 },
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
    try {
      // İstekleri her zaman Vercel ve local ile uyumlu adreslere yapıyoruz
      const [currencyResponse, goldResponse] = await Promise.all([
        fetch('/api/currency'),
        fetch('/api/gold')
      ]);

      const newPrices = JSON.parse(JSON.stringify(initialPrices));

      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates && rates.USD) newPrices.usd.price = 1 / rates.USD;
        if (rates && rates.EUR) newPrices.eur.price = 1 / rates.EUR;
      } else {
        console.error('Döviz API isteği başarısız oldu.', await currencyResponse.json());
      }

      if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        if (goldData && goldData.Rates) {
          const rates = goldData.Rates;
          for (const apiKey in rates) {
            if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
              const goldItem = rates[apiKey];
              if (goldItem && (typeof goldItem.Selling === 'number' || typeof goldItem.Selling === 'string')) {
                const internalGoldType = goldApiMap[apiKey];
                const priceAsNumber = parseApiNumber(goldItem.Selling);
                newPrices[internalGoldType].price = priceAsNumber;
              }
            }
          }
        }
      } else {
         console.error('Altın API isteği başarısız oldu.', await goldResponse.json());
      }
      
      setPrices(newPrices);

    } catch (error)      {
      console.error('Fiyatları alırken genel bir hata oluştu:', error);
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