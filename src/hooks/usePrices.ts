import { useState, useEffect, useCallback } from 'react';

export type Price = {
  symbol: string;
  name: string;
  sellingPrice: number;
  buyingPrice: number;
  change: number;
  changePercent: number;
};

const initialPrices: Record<string, Price> = {
  usd: { symbol: 'USD', name: 'Dolar', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  eur: { symbol: 'EUR', name: 'Euro', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  tl: { symbol: 'TRY', name: 'Türk Lirası', sellingPrice: 1, buyingPrice: 1, change: 0, changePercent: 0 },
  gumus: { symbol: 'G', name: 'Gram Gümüş', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 }, // GÜMÜŞ EKLENDİ
  gold: { symbol: 'GA', name: 'Gram Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  quarter_gold: { symbol: 'C', name: 'Çeyrek Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  half_gold: { symbol: 'Y', name: 'Yarım Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  full_gold: { symbol: 'T', name: 'Tam Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  cumhuriyet_gold: { symbol: 'CUM', name: 'Cumhuriyet Altını', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  ata_gold: { symbol: 'ATA', name: 'Ata Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  ayar_14_gold: { symbol: '14A', name: '14 Ayar Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  ayar_18_gold: { symbol: '18A', name: '18 Ayar Altın', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
  ayar_22_bilezik: { symbol: '22A', name: '22 Ayar Bilezik', sellingPrice: 0, buyingPrice: 0, change: 0, changePercent: 0 },
};

const goldApiMap: { [key: string]: keyof typeof initialPrices } = {
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

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, Price>>(initialPrices);
  const [loading, setLoading] = useState(true);
  // ==================================================================
  // DEĞİŞİKLİK 1: Son güncelleme zamanını tutacak state
  // ==================================================================
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    // İlk yükleme dışında arkaplanda sessizce güncellesin diye setLoading'i kaldırdık
    try {
      const [currencyResponse, goldResponse] = await Promise.all([
        fetch('/api/currency'),
        fetch('/api/gold')
      ]);

      const newPrices = JSON.parse(JSON.stringify(initialPrices));
      let isUpdateSuccessful = false;

      if (currencyResponse.ok) {
        isUpdateSuccessful = true;
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates && rates.USD) {
            const price = 1 / rates.USD;
            newPrices.usd.sellingPrice = price;
            newPrices.usd.buyingPrice = price;
        }
        if (rates && rates.EUR) {
            const price = 1 / rates.EUR;
            newPrices.eur.sellingPrice = price;
            newPrices.eur.buyingPrice = price;
        }
      }

      if (goldResponse.ok) {
        isUpdateSuccessful = true;
        const goldData = await goldResponse.json();
        if (goldData && goldData.Rates) {
          const rates = goldData.Rates;
          for (const apiKey in rates) {
            if (Object.prototype.hasOwnProperty.call(goldApiMap, apiKey)) {
              const goldItem = rates[apiKey];
              const internalGoldType = goldApiMap[apiKey];
              if (goldItem && (typeof goldItem.Selling === 'number' || typeof goldItem.Selling === 'string')) {
                newPrices[internalGoldType].sellingPrice = parseApiNumber(goldItem.Selling);
              }
              if (goldItem && (typeof goldItem.Buying === 'number' || typeof goldItem.Buying === 'string')) {
                newPrices[internalGoldType].buyingPrice = parseApiNumber(goldItem.Buying);
              }
            }
          }
        }
      }
      
      // Sadece en az bir API'den başarılı veri çekildiyse zamanı güncelle
      if (isUpdateSuccessful) {
        setPrices(newPrices);
        // ==================================================================
        // DEĞİŞİKLİK 2: Fiyatlar güncellendiğinde zamanı kaydet
        // ==================================================================
        setLastUpdated(new Date());
      }

    } catch (error)      {
      console.error('Fiyatları alırken genel bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Verileri her 5 dakikada bir çeker (300000 milisaniye)
    const interval = setInterval(fetchPrices, 300000); 
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // ==================================================================
  // DEĞİŞİKLİK 3: Yeni state'i dışarıya aktar
  // ==================================================================
  return { prices, loading, lastUpdated };
}