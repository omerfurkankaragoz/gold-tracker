// Konum: src/components/PriceCard.tsx

import React from 'react';
import { Price } from '../hooks/usePrices';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
}

export function PriceCard({ price, icon }: PriceCardProps) {
  // Para birimi türüne göre kaç ondalık basamak gösterileceğini belirleyelim
  const isCurrency = price.symbol === 'USD' || price.symbol === 'EUR';
  const fractionDigits = isCurrency ? 2 : 4;

  // Fiyattaki değişime göre renk ve ikon belirleyelim
  const change = price.change || 0;
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-between w-full">
      {/* Sol Taraf: İkon ve İsim/Sembol */}
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="bg-gray-100 p-3 rounded-full">
            {icon}
          </div>
        )}
        {/* ======================= GÜNCELLENEN BÖLÜM ======================= */}
        {/* Bu div'e "text-left" sınıfı ekleyerek içindeki her şeyin sola hizalanmasını sağlıyoruz */}
        <div className="text-left">
          <h3 className="font-bold text-gray-800 text-md">{price.name}</h3>
          <p className="text-sm text-gray-500">{price.symbol}</p>
        </div>
        {/* ==================================================================== */}
      </div>

      {/* Sağ Taraf: Fiyatlar ve Değişim */}
      <div className="text-right">
        <p className="font-semibold text-gray-900 text-md">
          ₺{price.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
        </p>
        <div className={`flex items-center justify-end space-x-1 text-sm font-medium ${changeColor}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>%{Math.abs(change).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}