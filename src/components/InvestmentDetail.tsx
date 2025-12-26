import React from 'react';
import { ChevronLeft, Calendar, TrendingUp, TrendingDown, ChevronsRight, Landmark, FileText } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface InvestmentDetailProps {
  investmentId: string;
  onBack: () => void;
}

export function InvestmentDetail({ investmentId, onBack }: InvestmentDetailProps) {
  const { investments } = useInvestmentsContext();
  const { prices } = usePrices();

  const investment = investments.find(inv => inv.id === investmentId);

  if (!investment) {
    return (
      <div className="text-center p-8">
        <p className="text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Yatırım bulunamadı.</p>
        <button onClick={onBack} className="mt-4 text-apple-blue font-semibold">Geri Dön</button>
      </div>
    );
  }

  const details = typeDetails[investment.type];
  const Icon = details.icon;
  const currentPrice = prices[investment.type]?.sellingPrice || 0;
  const currentValue = investment.amount * currentPrice;
  const purchaseValue = investment.amount * investment.purchase_price;
  const gain = currentValue - purchaseValue;
  const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

  const detailItems = [
    { label: 'Alış Tarihi', value: format(new Date(investment.purchase_date), 'dd MMMM yyyy, HH:mm', { locale: tr }), icon: Calendar },
    { label: 'Alış Fiyatı (Birim)', value: `₺${investment.purchase_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, icon: Landmark },
    { label: 'Toplam Maliyet', value: `₺${purchaseValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FileText },
    { label: 'Anlık Fiyat (Birim)', value: `₺${currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, icon: ChevronsRight, color: 'text-apple-blue' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pt-6">
      <div className="relative flex items-center justify-center p-2">
        <button onClick={onBack} className="absolute left-0 p-2 bg-gray-200/50 dark:bg-apple-dark-card rounded-full transition-transform active:scale-90">
          <ChevronLeft className="w-6 h-6 text-apple-light-text-primary dark:text-apple-dark-text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">Varlık Detayı</h1>
      </div>

      <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full flex-shrink-0">
            <Icon className="h-6 w-6 text-apple-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</h2>
            <p className="text-lg text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
              {investment.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} {details.unit}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
          <p className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Anlık Değer</p>
          <p className="text-2xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
            ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
          <p className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Kar / Zarar</p>
          <div className={`mt-1 flex items-center space-x-2 text-2xl font-bold ${gain >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
            {gain >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <p className={`text-base font-semibold mt-1 ${gain >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
            ({Math.abs(gainPercent).toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl">
        <ul className="divide-y divide-gray-200/50 dark:divide-gray-700">
          {detailItems.map(item => {
            const ItemIcon = item.icon;
            return (
              <li key={item.label} className="flex justify-between items-center p-4">
                <div className="flex items-center">
                  <ItemIcon className="w-5 h-5 text-apple-light-text-secondary dark:text-apple-dark-text-secondary mr-4" />
                  <span className="text-base font-medium text-apple-light-text-primary dark:text-apple-dark-text-primary">{item.label}</span>
                </div>
                <span className={`text-base font-semibold text-apple-light-text-secondary dark:text-apple-dark-text-secondary ${item.color || ''}`}>{item.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}