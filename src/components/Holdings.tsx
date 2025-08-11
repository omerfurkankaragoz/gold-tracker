// Konum: src/components/Holdings.tsx

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Euro, Coins, ChevronsUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
// AddInvestmentModal import'u kaldırıldı.
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';

export const typeDetails: Record<string, { icon: React.ElementType; name: string; unit: string }> = {
  usd: { icon: DollarSign, name: 'Dolar', unit: '$' },
  eur: { icon: Euro, name: 'Euro', unit: '€' },
  tl: { icon: () => <>₺</>, name: 'Türk Lirası', unit: '₺' },
  gold: { icon: Coins, name: 'Gram Altın', unit: 'gr' },
  quarter_gold: { icon: Coins, name: 'Çeyrek Altın', unit: 'adet' },
  half_gold: { icon: Coins, name: 'Yarım Altın', unit: 'adet' },
  full_gold: { icon: Coins, name: 'Tam Altın', unit: 'adet' },
  cumhuriyet_gold: { icon: Coins, name: 'Cumhuriyet A.', unit: 'adet' },
  ata_gold: { icon: Coins, name: 'Ata Altın', unit: 'adet' },
  ayar_14_gold: { icon: Coins, name: '14 Ayar Altın', unit: 'gr' },
  ayar_18_gold: { icon: Coins, name: '18 Ayar Altın', unit: 'gr' },
  ayar_22_bilezik: { icon: Coins, name: '22 Ayar Bilezik', unit: 'gr' },
};

type SortKey = 'purchase_date' | 'name' | 'currentValue';

interface HoldingsProps {
  onSelectInvestment: (id: string) => void;
  onAddInvestment: () => void; // YENİ: Ekleme sayfasını açacak fonksiyon prop'u
}

export function Holdings({ onSelectInvestment, onAddInvestment }: HoldingsProps) {
  // isModalOpen state'i kaldırıldı.
  const { investments, deleteInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'purchase_date',
    direction: 'descending',
  });

  const sortedInvestments = useMemo(() => {
    let sortableItems = [...investments];
    
    sortableItems.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      if (sortConfig.key === 'name') {
        aValue = typeDetails[a.type].name;
        bValue = typeDetails[b.type].name;
      } else if (sortConfig.key === 'currentValue') {
        aValue = a.amount * (prices[a.type]?.sellingPrice || 0);
        bValue = b.amount * (prices[b.type]?.sellingPrice || 0);
      } else {
        aValue = new Date(a.purchase_date).getTime();
        bValue = new Date(b.purchase_date).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableItems;
  }, [investments, prices, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bu yatırımı silmek istediğinizden emin misiniz?')) {
      await deleteInvestment(id);
    }
  };

  const SortButton = ({ sortKey, label }: { sortKey: SortKey; label: string }) => {
    const isActive = sortConfig.key === sortKey;
    const Icon = isActive 
      ? (sortConfig.direction === 'ascending' ? ChevronUp : ChevronDown) 
      : ChevronsUpDown;
    
    return (
      <button 
        onClick={() => requestSort(sortKey)}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-white text-blue-600 font-bold shadow-md' 
            : 'bg-transparent text-gray-500 hover:text-gray-900'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Varlıklarım</h1>
        {/* YENİ: Buton artık onAddInvestment prop'unu çağırıyor */}
        <button
          onClick={onAddInvestment}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ekle</span>
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Henüz varlık eklemediniz</h3>
          <p className="text-sm text-gray-500">
              Başlamak için 'Ekle' butonuna tıklayarak ilk yatırımınızı girin.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between space-x-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
            <SortButton sortKey="purchase_date" label="Tarih" />
            <SortButton sortKey="name" label="İsim" />
            <SortButton sortKey="currentValue" label="Değer" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {sortedInvestments.map((investment) => {
                const details = typeDetails[investment.type as Investment['type']];
                const Icon = details.icon;
                const currentPrice = prices[investment.type]?.sellingPrice || 0;
                const currentValue = investment.amount * currentPrice;
                const purchaseValue = investment.amount * investment.purchase_price;
                const gain = currentValue - purchaseValue;
                const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

                return (
                  <button
                    key={investment.id}
                    onClick={() => onSelectInvestment(investment.id)}
                    className="w-full text-left p-4 transition-colors hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{details.name}</p>
                          <p className="text-sm text-gray-500">
                            {investment.amount.toLocaleString('tr-TR', {maximumFractionDigits: 4})} {details.unit}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(investment.purchase_date), 'dd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, investment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2 z-10 relative"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Anlık Değer</p>
                        <p className="font-semibold text-gray-900 break-words">
                          ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500 break-words">
                          ₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 4 })} / {details.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Kar/Zarar</p>
                        <div className={`font-semibold flex items-center space-x-1 break-words ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <p className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* AddInvestmentModal tamamen kaldırıldı */}
    </div>
  );
}