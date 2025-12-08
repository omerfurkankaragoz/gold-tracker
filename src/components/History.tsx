import React, { useEffect } from 'react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TrendingUp, TrendingDown, History as HistoryIcon, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface HistoryProps {
    onSelectSale: (id: string) => void;
}

export function History({ onSelectSale }: HistoryProps) {
    const { sales, fetchSales } = useInvestmentsContext();

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

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
        <div className="pt-6 pb-24 px-4 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary px-2">Geçmiş İşlemler</h1>

            <div className="space-y-3">
                {sales.map((sale) => {
                    const details = typeDetails[sale.type];
                    const totalSale = sale.amount * sale.sell_price;
                    const totalCost = sale.amount * sale.buy_price;
                    const profit = totalSale - totalCost;
                    const profitPercent = (profit / totalCost) * 100;

                    return (
                        <div
                            key={sale.id}
                            onClick={() => onSelectSale(sale.id)}
                            className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        {details.icon && <details.icon className="w-5 h-5 text-apple-blue" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(sale.sold_at), 'dd MMM yyyy', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center">
                                    <div className="mr-2">
                                        <p className="font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                            ₺{totalSale.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className={`text-xs font-semibold flex items-center justify-end ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                                            {profit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            %{Math.abs(profitPercent).toFixed(1)}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-gray-500 text-xs">Miktar</p>
                                    <p className="font-medium text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                        {sale.amount} {details.unit}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs">Gerçekleşen Kâr/Zarar</p>
                                    <p className={`font-medium ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                                        {profit >= 0 ? '+' : ''}₺{profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}