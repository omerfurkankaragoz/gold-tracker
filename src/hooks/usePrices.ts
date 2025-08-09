import { useState, useEffect } from 'react';

export type Price = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, Price>>({
    gold: {
      symbol: 'XAU',
      name: 'Gram Altın',
      price: 2493.99,
      change: 45.30,
      changePercent: 1.85,
    },
    usd: {
      symbol: 'USD',
      name: 'Amerikan Doları',
      price: 33.34,
      change: -0.12,
      changePercent: -0.36,
    },
    eur: {
      symbol: 'EUR',
      name: 'Euro',
      price: 36.20,
      change: 0.25,
      changePercent: 0.70,
    },
  });
  const [loading, setLoading] = useState(false);

  // Simulated price updates (in real app, this would fetch from actual APIs)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        
        Object.keys(newPrices).forEach(key => {
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          const newPrice = newPrices[key].price * (1 + variation);
          const change = newPrice - newPrices[key].price;
          const changePercent = (change / newPrices[key].price) * 100;
          
          newPrices[key] = {
            ...newPrices[key],
            price: Number(newPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
          };
        });
        
        return newPrices;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
}