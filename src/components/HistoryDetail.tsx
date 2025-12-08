import React from 'react';
import { ChevronLeft, Calendar, TrendingUp, TrendingDown, ArrowRightLeft, Landmark, FileText, Banknote } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HistoryDetailProps {
    saleId: string;
    onBack: () => void;
}

export function HistoryDetail({ saleId, onBack }: HistoryDetailProps) {
    const { sales } = useInvestmentsContext();
    const sale = sales.find(s => s.id === saleId);

    if (!sale) {
        return (
            <div className="text-center p-8">
                <p className="text-apple-light-text-secondary dark:text-apple-dark-text-secondary">İşlem detayı bulunamadı.</p>
                <button onClick={onBack} className="mt-4 text-apple-blue font-semibold">Geri Dön</button>
            </div>
        );
    }

    const details = typeDetails[sale.type];
    const Icon = details.icon;

    const totalSaleValue = sale.amount * sale.sell_price;
    const totalCostValue = sale.amount * sale.buy_price;
    const profit = totalSaleValue - totalCostValue;
    const profitPercent = (profit / totalCostValue) * 100;

    // Alım tarihi null gelirse (eski kayıtlarda olabilir) güvenli bir gösterim yap
    const purchaseDateDisplay = sale.purchase_date
        ? format(new Date(sale.purchase_date), 'dd MMMM yyyy', { locale: tr })
        : 'Bilinmiyor';

    const detailItems = [
        { label: 'Alış Tarihi', value: purchaseDateDisplay, icon: Calendar },
        { label: 'Satış Tarihi', value: format(new Date(sale.sold_at), 'dd MMMM yyyy, HH:mm', { locale: tr }), icon: Calendar },
        { label: 'Alış Fiyatı (Birim)', value: `₺${sale.buy_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, icon: Landmark },
        { label: 'Satış Fiyatı (Birim)', value: `₺${sale.sell_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, icon: Banknote, color: 'text-apple-blue' },
        { label: 'Toplam Maliyet', value: `₺${totalCostValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-24 pt-4">
            <div className="relative flex items-center justify-center p-2">
                <button onClick={onBack} className="absolute left-0 p-2 bg-gray-200/50 dark:bg-apple-dark-card rounded-full transition-transform active:scale-90">
                    <ChevronLeft className="w-6 h-6 text-apple-light-text-primary dark:text-apple-dark-text-primary" />
                </button>
                <h1 className="text-xl font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">İşlem Detayı</h1>
            </div>

            {/* Başlık Kartı */}
            <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full flex-shrink-0">
                        <Icon className="h-6 w-6 text-apple-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</h2>
                        <p className="text-lg text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                            Satılan: {sale.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} {details.unit}
                        </p>
                    </div>
                </div>
            </div>

            {/* Finansal Özet */}
            <div className="space-y-4">
                <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
                    <p className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Toplam Satış Tutarı</p>
                    <p className="text-2xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
                        ₺{totalSaleValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4">
                    <p className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Gerçekleşen Kâr / Zarar</p>
                    <div className={`mt-1 flex items-center space-x-2 text-2xl font-bold ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                        {profit >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        <span>₺{Math.abs(profit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className={`text-base font-semibold mt-1 ${profit >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
                        ({Math.abs(profitPercent).toFixed(2)}%)
                    </p>
                </div>
            </div>

            {/* Detay Listesi */}
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