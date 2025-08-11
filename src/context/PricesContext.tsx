// Konum: src/context/PricesContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Price, initialPrices, goldApiMap, parseApiNumber } from '../hooks/usePrices'; // Gerekli tipleri ve fonksiyonları usePrices'tan alıyoruz

// Context'in tutacağı verilerin tipini tanımlıyoruz
interface IPricesContext {
  prices: Record<string, Price>;
  loading: boolean;
  lastUpdated: Date | null;
}

const PricesContext = createContext<IPricesContext | undefined>(undefined);

// Uygulamamızı sarmalayacak olan Provider component'i
export const PricesProvider = ({ children }: { children: ReactNode }) => {
  const [prices, setPrices] = useState<Record<string, Price>>(initialPrices);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
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
      
      if (isUpdateSuccessful) {
        setPrices(newPrices);
        setLastUpdated(new Date());
      }

    } catch (error) {
      console.error('Fiyatları alırken genel bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000); // 5 dakika
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const value = { prices, loading, lastUpdated };

  return (
    <PricesContext.Provider value={value}>
      {children}
    </PricesContext.Provider>
  );
};

// Bu custom hook, component'lerden context'e kolayca erişmemizi sağlayacak
export const usePricesContext = () => {
  const context = useContext(PricesContext);
  if (context === undefined) {
    throw new Error('usePricesContext must be used within a PricesProvider');
  }
  return context;
};