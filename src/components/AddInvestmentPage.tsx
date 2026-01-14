import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, DollarSign, Euro, Coins, Plus, Gem, TurkishLira } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';
import { PortfolioSelector } from './PortfolioSelector';

const LAST_PORTFOLIO_KEY = 'last_used_portfolio_id';

interface AddInvestmentPageProps {
  onBack: () => void;
  initialSelectedType?: Investment['type'];
  initialPortfolioId?: string;
  isDirectAdd?: boolean;
}

const investmentTypes = [
  { id: 'tl', name: 'Türk Lirası', symbol: 'TRY', icon: TurkishLira, unit: '₺' },
  { id: 'usd', name: 'Dolar', symbol: 'USD', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', symbol: 'EUR', icon: Euro, unit: '€' },
  { id: 'gumus', name: 'Gram Gümüş', symbol: 'G', icon: Gem, unit: 'gr' },
  { id: 'gold', name: 'Gram Altın', symbol: 'GA', icon: Coins, unit: 'gr' },
  { id: 'quarter_gold', name: 'Çeyrek Altın', symbol: 'CE-K', icon: Coins, unit: 'adet' },
  { id: 'half_gold', name: 'Yarım Altın', symbol: 'YA-K', icon: Coins, unit: 'adet' },
  { id: 'full_gold', 'name': 'Tam Altın', symbol: 'TA-K', icon: Coins, unit: 'adet' },
  { id: 'cumhuriyet_gold', name: 'Cumhuriyet Altını', symbol: 'CMR', icon: Coins, unit: 'adet' },
  { id: 'ata_gold', name: 'Ata Altın', symbol: 'ATA', icon: Coins, unit: 'adet' },
  { id: 'ayar_14_gold', name: '14 Ayar Altın', symbol: '14-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_18_gold', name: '18 Ayar Altın', symbol: '18-K', icon: Coins, unit: 'gr' },
];

export function AddInvestmentPage({ onBack, initialSelectedType, initialPortfolioId, isDirectAdd = false }: AddInvestmentPageProps) {
  const [selectedType, setSelectedType] = useState<Investment['type']>(initialSelectedType || 'gold');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  // Son kullanılan listeyi localStorage'dan yükle
  const getInitialPortfolioId = () => {
    if (initialPortfolioId) return initialPortfolioId;
    try {
      return localStorage.getItem(LAST_PORTFOLIO_KEY) || undefined;
    } catch {
      return undefined;
    }
  };

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>(getInitialPortfolioId);
  const today = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState(today);

  const { addInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const getFractionDigits = (type: Investment['type']) => (type === 'usd' || type === 'eur' ? 2 : 4);

  const updatePurchasePrice = (type: Investment['type']) => {
    if (type === 'tl') {
      setPurchasePrice('1');
      return;
    }
    const price = prices[type]?.sellingPrice;
    setPurchasePrice(price ? price.toFixed(getFractionDigits(type)) : '');
  };

  useEffect(() => {
    const startType = initialSelectedType || 'gold';
    setSelectedType(startType);
    setAmount('');
    setSearchQuery('');
    setPurchaseDate(today);
    updatePurchasePrice(startType);
  }, [initialSelectedType, prices]);

  useEffect(() => {
    if (!isDirectAdd) {
      setPurchaseDate(today);
      updatePurchasePrice(selectedType);
    }
  }, [selectedType]);

  const selectedInvestment = useMemo(() => investmentTypes.find(inv => inv.id === selectedType), [selectedType]);

  const filteredInvestmentTypes = useMemo(() => {
    if (!searchQuery) return investmentTypes;
    return investmentTypes.filter(type =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalCost = (parseFloat(amount) || 0) * (parseFloat(purchasePrice) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purchasePrice || !selectedType || !purchaseDate) return;
    setLoading(true);
    try {
      await addInvestment({
        type: selectedType,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice.replace(',', '.')),
        purchase_date: new Date(purchaseDate).toISOString(),
        portfolio_id: selectedPortfolioId,
      } as Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>);

      // Son kullanılan listeyi kaydet
      if (selectedPortfolioId) {
        localStorage.setItem(LAST_PORTFOLIO_KEY, selectedPortfolioId);
      } else {
        localStorage.removeItem(LAST_PORTFOLIO_KEY);
      }

      onBack();
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in text-apple-light-text-primary dark:text-apple-dark-text-primary px-4 pt-6">
      <div className="relative flex items-center justify-center mb-6">
        <button
          onClick={onBack}
          className="absolute left-0 p-2 bg-gray-200/50 dark:bg-apple-dark-card rounded-full transition-transform active:scale-90"
        >
          <ChevronLeft className="w-6 h-6 text-apple-light-text-primary dark:text-apple-dark-text-primary" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Varlık Ekle</h1>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-8 transition-all duration-300 -mx-4 px-4 ${totalCost > 0 ? 'pb-40' : 'pb-8'} no-scrollbar`}>
        {!isDirectAdd && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-apple-light-text-secondary dark:text-apple-dark-text-secondary tracking-wider ml-1">Varlık Türü</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-apple-light-text-secondary dark:text-apple-dark-text-secondary" />
              <input
                type="text"
                placeholder="Varlık Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-base border-none rounded-2xl bg-gray-100 dark:bg-white/10 placeholder-apple-light-text-secondary dark:placeholder-apple-dark-text-secondary focus:ring-2 focus:ring-apple-blue transition-shadow shadow-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filteredInvestmentTypes.map((type) => {
                const isSelected = selectedType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id as Investment['type'])}
                    className={`p-3 rounded-2xl text-center transition-all flex flex-col items-center justify-center space-y-2 h-28 border ${isSelected
                      ? 'bg-apple-blue text-white border-apple-blue shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-white/5 border-transparent hover:bg-gray-50 dark:hover:bg-white/10'
                      }`}
                  >
                    <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon className={`h-6 w-6 transition-colors ${isSelected ? 'text-white' : 'text-apple-blue'}`} />
                    </div>
                    <span
                      className={`font-semibold text-xs transition-colors line-clamp-2 ${isSelected ? 'text-white' : 'text-apple-light-text-primary dark:text-apple-dark-text-primary'
                        }`}
                    >
                      {type.name.replace(' Altını', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-apple-light-text-secondary dark:text-apple-dark-text-secondary tracking-wider ml-1">İşlem Detayları</h2>
          <div className="glass-card p-2 space-y-1">
            <div className="relative group">
              <label className="absolute left-4 top-2 text-[10px] font-bold text-apple-light-text-tertiary dark:text-apple-dark-text-tertiary uppercase tracking-wider">
                Miktar ({selectedInvestment?.unit})
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pt-6 pb-2 px-4 bg-transparent border-none rounded-xl text-lg font-semibold focus:ring-0 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors"
                placeholder="0"
                required
              />
            </div>
            <div className="h-px bg-gray-100 dark:bg-white/5 mx-4" />
            <div className="relative group">
              <label className="absolute left-4 top-2 text-[10px] font-bold text-apple-light-text-tertiary dark:text-apple-dark-text-tertiary uppercase tracking-wider">
                Alış Fiyatı (₺)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                disabled={selectedType === 'tl'}
                className="w-full pt-6 pb-2 px-4 bg-transparent border-none rounded-xl text-lg font-semibold disabled:opacity-50 focus:ring-0 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
            <div className="h-px bg-gray-100 dark:bg-white/5 mx-4" />
            <div className="relative group">
              <label className="absolute left-4 top-2 text-[10px] font-bold text-apple-light-text-tertiary dark:text-apple-dark-text-tertiary uppercase tracking-wider">Alış Tarihi</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                max={today}
                className="block w-full pt-6 pb-2 px-4 bg-transparent border-none rounded-xl text-lg font-medium text-gray-900 dark:text-gray-100 focus:ring-0 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors appearance-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Portfolio Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-apple-light-text-secondary dark:text-apple-dark-text-secondary tracking-wider ml-1">Liste</h2>
          <PortfolioSelector
            selectedPortfolioId={selectedPortfolioId}
            onSelect={setSelectedPortfolioId}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-apple-light-bg/90 dark:bg-apple-dark-bg/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 pb-8">
        {totalCost > 0 && (
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Toplam Maliyet</span>
            <span className="text-xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary">
              ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !amount || !purchasePrice}
          className="w-full py-4 bg-apple-blue text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:scale-100 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-6 h-6" strokeWidth={3} />
              <span>Varlık Ekle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}