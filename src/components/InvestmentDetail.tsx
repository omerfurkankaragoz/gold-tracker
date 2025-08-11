// Konum: src/components/InvestmentDetail.tsx (YENİ DOSYA)

import React from 'react';
import { ChevronLeft, Calendar, TrendingUp, TrendingDown, ChevronsRight, Landmark, FileText } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { typeDetails } from './Holdings'; // Holdings'teki varlık tipi detaylarını kullanıyoruz
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';

interface InvestmentDetailProps {
  investmentId: string;
  onBack: () => void;
}

export function InvestmentDetail({ investmentId, onBack }: InvestmentDetailProps) {
  const { investments } = useInvestmentsContext();
  const { prices } = usePrices();

  // Tıklanan varlığı ID'sine göre buluyoruz
  const investment = investments.find(inv => inv.id === investmentId);

  // Eğer bir hata olur da varlık bulunamazsa, kullanıcıya bilgi veriyoruz
  if (!investment) {
    return (
      <div className="text-center p-8">
        <p>Yatırım bulunamadı.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 font-semibold">Geri Dön</button>
      </div>
    );
  }

  // Gerekli hesaplamaları yapıyoruz
  const details = typeDetails[investment.type as Investment['type']];
  const Icon = details.icon;
  const currentPrice = prices[investment.type]?.sellingPrice || 0;
  const currentValue = investment.amount * currentPrice;
  const purchaseValue = investment.amount * investment.purchase_price;
  const gain = currentValue - purchaseValue;
  const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

  // Detay listesi için veri yapısı
  const detailItems = [
    {
      label: 'Alış Tarihi',
      value: format(new Date(investment.purchase_date), 'dd MMMM yyyy, HH:mm', { locale: tr }),
      icon: Calendar,
    },
    {
      label: 'Alış Fiyatı (Birim)',
      value: `₺${investment.purchase_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
      icon: Landmark,
    },
    {
      label: 'Toplam Maliyet',
      value: `₺${purchaseValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FileText,
    },
    {
      label: 'Anlık Fiyat (Birim)',
      value: `₺${currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
      icon: ChevronsRight,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative flex items-center justify-center p-2">
        <button onClick={onBack} className="absolute left-0 p-2 bg-gray-100 rounded-full transition-transform active:scale-90">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Varlık Detayı</h1>
      </div>

      {/* Ana Kart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{details.name}</h2>
            <p className="text-lg text-gray-600">
              {investment.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} {details.unit}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200" />

        {/* Anlık Değer ve Kar/Zarar */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Anlık Değer</p>
            <p className="text-2xl font-bold text-gray-900">
              ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kar / Zarar</p>
            <div className={`text-2xl font-bold flex items-center justify-center space-x-2 ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gain >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className={`text-sm font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({gainPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>
      
      {/* Detaylar Listesi */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <ul className="divide-y divide-gray-100">
          {detailItems.map(item => {
            const ItemIcon = item.icon;
            return (
              <li key={item.label} className="flex justify-between items-center py-3.5">
                <div className="flex items-center">
                  <ItemIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                </div>
                <span className={`text-sm font-semibold text-gray-900 ${item.color || ''}`}>{item.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}