import React, { useEffect } from 'react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TrendingUp, TrendingDown, History as HistoryIcon, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { SwipeableItem } from './SwipeableItem';

interface HistoryProps {
    onSelectSale: (id: string) => void;
    isBalanceVisible: boolean;
}

export function History({ onSelectSale, isBalanceVisible }: HistoryProps) {
    const { sales, fetchSales, deleteSale } = useInvestmentsContext();

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu satış kaydını silmek istediğinizden emin misiniz?')) {
            await deleteSale(id);
        }
    };

    if (sales.length === 0) {
        return (
            <div className="pt-6 px-4">
                <EmptyState
                    icon={HistoryIcon}
                    title="İşlem Geçmişi Yok"
                    description="Henüz herhangi bir varlık satışı yapmadınız."
                />
            </div>
        );
    }

    return (
        <div className="pt-6">
            {/* BAŞLIK KISMI - Varlıklarım sayfasıyla uyumlu hale getirildi */}
            <div className="sticky top-0 z-20 bg-apple-light-bg dark:bg-apple-dark-bg space-y-4 py-4 pt-safe">
                <div className="flex items-center justify-between px-2">
                    <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Satışlarım</h1>
                </div>
            </div>

            {/* LİSTE KISMI */}
            <div className="pt-2 space-y-3">
                {sales.map((sale) => {
                    const details = typeDetails[sale.type];
                    const totalSale = sale.amount * sale.sell_price;
                    const totalCost = sale.amount * sale.buy_price;
                    const profit = totalSale - totalCost;
                    const profitPercent = (profit / totalCost) * 100;

                    return (
                        <div key={sale.id} className="mb-3">
                            <SwipeableItem
                                onDelete={() => handleDelete(sale.id)}
                                onClick={() => onSelectSale(sale.id)}
                            >
                                {/* KART İÇERİĞİ - Boyutlar ve boşluklar Varlıklarım kartıyla eşitlendi */}
                                <div className="w-full text-left p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full flex-shrink-0">
                                                {details.icon && <details.icon className="h-6 w-6 text-apple-blue" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-base text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</p>
                                                <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                                                    {format(new Date(sale.sold_at), 'dd MMM yyyy', { locale: tr })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-right">
                                            <div className="mr-3">
                                                <p className="font-semibold text-base text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                                    {isBalanceVisible ? `₺${totalSale.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '******'}
                                                </p>
                                                <div className={`text-sm font-medium flex items-center justify-end ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                                                    {isBalanceVisible ? (
                                                        <>
                                                            {profit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                            %{Math.abs(profitPercent).toFixed(1)}
                                                        </>
                                                    ) : (
                                                        <span>******</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-left">
                                            <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Miktar</p>
                                            <p className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
                                                {sale.amount} {details.unit}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Gerçekleşen Kâr/Zarar</p>
                                            <div className={`font-semibold mt-1 ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                                                {isBalanceVisible ? (
                                                    <>
                                                        {profit >= 0 ? '+' : ''}₺{profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                    </>
                                                ) : (
                                                    '******'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwipeableItem>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}