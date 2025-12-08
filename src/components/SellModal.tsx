import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Investment } from '../lib/supabase';
import { typeDetails } from './Holdings';
import { usePrices } from '../hooks/usePrices';

interface SellModalProps {
    investment: Investment | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number, amount: number, date: string) => Promise<void>;
}

export function SellModal({ investment, isOpen, onClose, onConfirm }: SellModalProps) {
    const [sellPrice, setSellPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]); // Varsayılan: Bugün
    const [loading, setLoading] = useState(false);
    const { prices } = usePrices();

    useEffect(() => {
        if (investment && isOpen) {
            setAmount(investment.amount.toString());
            const currentPrice = prices[investment.type]?.buyingPrice;
            setSellPrice(currentPrice ? currentPrice.toString() : '');
            setSaleDate(new Date().toISOString().split('T')[0]);
        }
    }, [investment, isOpen, prices]);

    if (!isOpen || !investment) return null;

    const details = typeDetails[investment.type];
    const totalValue = (parseFloat(amount) || 0) * (parseFloat(sellPrice) || 0);
    const profit = totalValue - ((parseFloat(amount) || 0) * investment.purchase_price);

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(parseFloat(sellPrice), parseFloat(amount), saleDate);
        setLoading(false);
        onClose();
    };

    return (
        // Z-INDEX GÜNCELLENDİ: z-[60] yapılarak navigasyonun (z-50) üzerine çıkması sağlandı
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-apple-light-bg dark:bg-apple-dark-card rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">Varlık Satışı</h2>
                    <button onClick={onClose} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="p-6 space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Satılan Varlık</p>
                        <p className="text-2xl font-bold text-apple-blue">{details.name}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-1">
                                Satılacak Miktar ({details.unit})
                            </label>
                            <input
                                type="number"
                                step="any"
                                max={investment.amount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-apple-blue outline-none text-apple-light-text-primary dark:text-apple-dark-text-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-1">
                                Birim Satış Fiyatı (₺)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-apple-blue outline-none text-apple-light-text-primary dark:text-apple-dark-text-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-1">
                                Satış Tarihi
                            </label>
                            <input
                                type="date"
                                value={saleDate}
                                onChange={(e) => setSaleDate(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl text-base focus:ring-2 focus:ring-apple-blue outline-none text-apple-light-text-primary dark:text-apple-dark-text-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Toplam Tutar:</span>
                            <span className="font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                ₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tahmini Kâr/Zarar:</span>
                            <span className={`font-bold ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                                {profit >= 0 ? '+' : ''}₺{profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-apple-blue text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                    >
                        {loading ? <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent" /> : <><span>Satışı Onayla</span><Check className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}