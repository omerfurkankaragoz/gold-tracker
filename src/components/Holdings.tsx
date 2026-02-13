import React, { useState, useMemo, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp, ChevronsUpDown, DollarSign, Euro, Coins, Gem, TurkishLiraIcon, Wallet } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';
import { ListSkeleton } from './Skeleton';
import { SwipeableItem } from './SwipeableItem';
import { EmptyState } from './EmptyState';
import { SellModal } from './SellModal';

export const typeDetails: Record<string, { icon: React.ElementType; name: string; unit: string }> = {
  usd: { icon: DollarSign, name: 'Dolar', unit: '$' },
  eur: { icon: Euro, name: 'Euro', unit: '€' },
  tl: { icon: TurkishLiraIcon, name: 'Türk Lirası', unit: '₺' },
  gumus: { icon: Gem, name: 'Gram Gümüş', unit: 'gr' },
  gold: { icon: Coins, name: 'Gram Altın', unit: 'gr' },
  quarter_gold: { icon: Coins, name: 'Çeyrek Altın', unit: 'adet' },
  half_gold: { icon: Coins, name: 'Yarım Altın', unit: 'adet' },
  full_gold: { icon: Coins, name: 'Tam Altın', unit: 'adet' },
  cumhuriyet_gold: { icon: Coins, name: 'Cumhuriyet A.', unit: 'adet' },
  ata_gold: { icon: Coins, name: 'Ata Altın', unit: 'adet' },
  ayar_14_gold: { icon: Coins, name: '14 Ayar Altın', unit: 'gr' },
  ayar_18_gold: { icon: Coins, name: '18 Ayar Altın', unit: 'gr' },
};

type SortKey = 'purchase_date' | 'name' | 'currentValue';

interface HoldingsProps {
  onSelectInvestment: (id: string) => void;
  onAddInvestment: () => void;
  isBalanceVisible: boolean;
}

export function Holdings({ onSelectInvestment, onAddInvestment, isBalanceVisible }: HoldingsProps) {
  const { investments, deleteInvestment, sellInvestment, loading } = useInvestmentsContext();
  const { prices } = usePrices();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'purchase_date',
    direction: 'descending',
  });
  const [sellingInvestment, setSellingInvestment] = useState<Investment | null>(null);

  const sortedInvestments = useMemo(() => {
    const sortableItems = [...investments];
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

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig(prevConfig => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (prevConfig.key === key && prevConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { key, direction };
    });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Bu yatırımı silmek istediğinizden emin misiniz?')) {
      await deleteInvestment(id);
    }
  }, [deleteInvestment]);

  const handleSellClick = useCallback((investment: Investment) => {
    setSellingInvestment(investment);
  }, []);

  const handleConfirmSell = useCallback(async (price: number, amount: number, date: string) => {
    if (sellingInvestment) {
      await sellInvestment(sellingInvestment.id, price, amount, date);
      setSellingInvestment(null);
    }
  }, [sellingInvestment, sellInvestment]);

  const InvestmentCard = useCallback(({ investment }: { investment: Investment }) => {
    const details = typeDetails[investment.type as Investment['type']];
    const Icon = details.icon;
    const currentPrice = prices[investment.type]?.sellingPrice || 0;
    const currentValue = investment.amount * currentPrice;
    const purchaseValue = investment.amount * investment.purchase_price;
    const gain = currentValue - purchaseValue;
    const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

    return (
      <div key={investment.id} className="mb-3">
        <SwipeableItem
          onDelete={() => handleDelete(investment.id)}
          onSell={() => handleSellClick(investment)}
          onClick={() => onSelectInvestment(investment.id)}
        >
          <div className="w-full text-left p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full flex-shrink-0">
                  <Icon className="h-6 w-6 text-apple-blue" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</p>
                  <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                    {investment.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} {details.unit}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Anlık Değer</p>
                <p className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
                  {isBalanceVisible ? `₺${currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '******'}
                </p>
                <p className="text-xs text-apple-light-text-secondary/70 dark:text-apple-dark-text-secondary/70 mt-2">
                  {format(new Date(investment.purchase_date), 'dd MMM yyyy', { locale: tr })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Kar/Zarar</p>
                <div className={`font-semibold flex items-center justify-end space-x-1 mt-1 ${gain >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                  {isBalanceVisible ? (
                    <>
                      <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      <span className='ml-2'>({Math.abs(gainPercent).toFixed(2)}%)</span>
                    </>
                  ) : (
                    <span>******</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SwipeableItem>
      </div>
    );
  }, [prices, isBalanceVisible, handleDelete, handleSellClick, onSelectInvestment]);

  const SortButton = ({ sortKey, label }: { sortKey: SortKey; label: string }) => {
    const isActive = sortConfig.key === sortKey;
    const Icon = isActive ? (sortConfig.direction === 'ascending' ? ChevronUp : ChevronDown) : ChevronsUpDown;
    return (
      <button
        onClick={() => requestSort(sortKey)}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-full transition-all duration-300 ${isActive
          ? 'bg-apple-light-card dark:bg-gray-700 text-apple-blue font-bold shadow-md'
          : 'bg-transparent text-apple-light-text-secondary dark:text-apple-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700/50'
          }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="pt-6">
      <div className="sticky top-0 z-20 bg-apple-light-bg dark:bg-apple-dark-bg space-y-4 py-4 pt-safe">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Varlıklarım</h1>
          <button
            onClick={onAddInvestment}
            className="bg-apple-blue text-white p-2 rounded-full hover:opacity-90 transition-opacity"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {investments.length > 0 && (
          <div className="px-2">
            <div className="flex items-center justify-between space-x-1 p-1 bg-gray-200/50 dark:bg-apple-dark-card rounded-full">
              <SortButton sortKey="purchase_date" label="Tarih" />
              <SortButton sortKey="name" label="İsim" />
              <SortButton sortKey="currentValue" label="Değer" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        {loading ? (
          <ListSkeleton />
        ) : investments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Henüz varlık eklemediniz"
            description="Portföyünüzü oluşturmaya başlamak için ilk yatırımınızı ekleyin."
            action={{
              label: "Yatırım Ekle",
              onClick: onAddInvestment
            }}
          />
        ) : (
          <div className="space-y-3">
            {sortedInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        )}
      </div>

      <SellModal
        isOpen={!!sellingInvestment}
        investment={sellingInvestment}
        onClose={() => setSellingInvestment(null)}
        onConfirm={handleConfirmSell}
      />
    </div>
  );
}