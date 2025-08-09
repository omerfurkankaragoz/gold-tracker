import { useState, useEffect, useCallback } from 'react';

export type Price = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

// Başlangıç verilerine Altın'ı geri ekliyoruz
const initialPrices: Record<string, Price> = {
  gold: { symbol: 'XAU', name: 'Gram Altın', price: 0, change: 0, changePercent: 0 },
  usd: { symbol: 'USD', name: 'Amerikan Doları', price: 0, change: 0, changePercent: 0 },
  eur: { symbol: 'EUR', name: 'Euro', price: 0, change: 0, changePercent: 0 },
};

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, Price>>(initialPrices);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      // Promise.all ile iki API isteğini aynı anda yapıyoruz
      const [currencyResponse, goldResponse] = await Promise.all([
        fetch('/api_currency/latest?from=TRY&to=USD,EUR'),
        fetch('/api_gold/today.json')
      ]);

      const newPrices = { ...initialPrices };

      // Döviz verilerini işle
      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        const rates = currencyData.rates;
        if (rates.USD) newPrices.usd = { ...newPrices.usd, price: 1 / rates.USD };
        if (rates.EUR) newPrices.eur = { ...newPrices.eur, price: 1 / rates.EUR };
      } else {
        console.error('Döviz API isteği başarısız');
      }

      // Altın verilerini işle
      if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        // Sizin gönderdiğiniz JSON'a göre doğru anahtarları kullanıyoruz: gram_altin ve Selling
        const gramAltinData = goldData.gram_altin;
        if (gramAltinData && gramAltinData.Selling) {
          // Bu API değişim oranı vermediği için change değerlerini 0 olarak bırakıyoruz
          newPrices.gold = {
            ...newPrices.gold,
            price: parseFloat(gramAltinData.Selling.replace(',', '.'))
          };
        }
      } else {
         console.error('Altın API isteği başarısız');
      }
      
      setPrices(newPrices);

    } catch (error) {
      console.error('Fiyatları çekerken hata:', error);
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