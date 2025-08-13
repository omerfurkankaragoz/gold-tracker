import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Euro, Coins, ChevronsUpDown, ChevronDown, ChevronUp, Gem ,TurkishLira} from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';

export const typeDetails: Record<string, { icon: React.ElementType; name: string; unit: string }> = {
  usd: { icon: DollarSign, name: 'Dolar', unit: '$' },
  eur: { icon: Euro, name: 'Euro', unit: '€' },
  tl: { icon: TurkishLira, name: 'Türk Lirası', unit: '₺' },
  gumus: { icon: Gem, name: 'Gram Gümüş', unit: 'gr' },
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
  onAddInvestment: () => void;
  isBalanceVisible: boolean;
}

export function Holdings({ onSelectInvestment, onAddInvestment, isBalanceVisible }: HoldingsProps) {
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
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
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
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white font-bold shadow-md' 
            : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Varlıklarım</h1>
        <button
          onClick={onAddInvestment}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Henüz varlık eklemediniz</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
              Başlamak için '+' butonuna tıklayarak ilk yatırımınızı girin.
          </p>
        </div>
      ) : (
        <>
          <div className="px-2">
            <div className="flex items-center justify-between space-x-1 p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
              <SortButton sortKey="purchase_date" label="Tarih" />
              <SortButton sortKey="name" label="İsim" />
              <SortButton sortKey="currentValue" label="Değer" />
            </div>
          </div>

          <div className="space-y-3">
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
                  className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{details.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {investment.amount.toLocaleString('tr-TR', {maximumFractionDigits: 4})} {details.unit}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, investment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 ml-2 z-10 relative"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Anlık Değer</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {isBalanceVisible ? `₺${currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '******'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kar/Zarar</p>
                      <div className={`font-semibold flex items-center justify-end space-x-1 mt-1 ${gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isBalanceVisible ? (
                          <>
                            {/* ======================= DEĞİŞİKLİK BURADA ======================= */}
                            <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            <span className='ml-2'>({Math.abs(gainPercent).toFixed(2)}%)</span>
                          </>
                        ) : (
                          <span>******</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}