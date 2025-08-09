import React, { useState } from 'react';
import { X, Plus, DollarSign, Euro, Coins } from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';
import { usePrices } from '../hooks/usePrices';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const investmentTypes = [
  { id: 'gold', name: 'Gram Altın', icon: Coins, unit: 'gr' },
  { id: 'usd', name: 'Amerikan Doları', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', icon: Euro, unit: '€' },
] as const;

export function AddInvestmentModal({ isOpen, onClose }: AddInvestmentModalProps) {
  const [selectedType, setSelectedType] = useState<'gold' | 'usd' | 'eur'>('gold');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const { addInvestment } = useInvestments();
  const { prices } = usePrices();

  const selectedInvestment = investmentTypes.find(inv => inv.id === selectedType)!;
  const currentPrice = prices[selectedType]?.price || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purchasePrice) return;

    setLoading(true);
    try {
      const { error } = await addInvestment({
        type: selectedType,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice),
        purchase_date: new Date(purchaseDate).toISOString(),
      });

      if (!error) {
        setAmount('');
        setPurchasePrice('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        onClose();
      }
    } catch (error) {
      console.error('Error adding investment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Yatırım Ekle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yatırım Türü
            </label>
            <div className="grid grid-cols-3 gap-3">
              {investmentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miktar ({selectedInvestment.unit})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Miktar girin"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alış Fiyatı (₺)
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Mevcut: ₺${currentPrice.toFixed(2)}`}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alış Tarihi
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Ekle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}