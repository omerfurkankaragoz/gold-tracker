import React from 'react';
import { Price } from '../hooks/usePrices';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
}

export function PriceCard({ price, icon }: PriceCardProps) {
  // Para birimi türüne göre kaç ondalık basamak gösterileceğini belirliyoruz
  const isDoviz = price.symbol === 'USD' || price.symbol === 'EUR';
  const fractionDigits = isDoviz ? 2 : 4;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <h3 className="font-semibold text-gray-800 text-sm min-h-[40px] flex items-center">{price.name}</h3>
        </div>
        <span className="text-xs font-medium text-gray-500">{price.symbol}</span>
      </div>
      
      <div className="space-y-2 text-center">
        <div>
          <span className="text-xs text-gray-500">Alış</span>
          <p className="font-bold text-gray-900 text-md">
            {/* toLocaleString ile doğru formatlamayı yapıyoruz */}
            ₺{price.buyingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Satış</span>
          <p className="font-bold text-gray-900 text-md">
            {/* toLocaleString ile doğru formatlamayı yapıyoruz */}
            ₺{price.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
          </p>
        </div>
      </div>
    </div>
  );
}