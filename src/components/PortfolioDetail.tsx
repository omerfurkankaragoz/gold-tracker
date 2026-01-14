import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, FolderInput } from 'lucide-react';
import { usePortfoliosContext } from '../context/PortfoliosContext';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';
import { SwipeableItem } from './SwipeableItem';
import { SellModal } from './SellModal';
import { EmptyState } from './EmptyState';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PortfolioDetailProps {
    portfolioId: string;
    onBack: () => void;
    onSelectInvestment: (id: string) => void;
    onAddInvestment: (portfolioId?: string) => void;
    isBalanceVisible: boolean;
}

export function PortfolioDetail({
    portfolioId,
    onBack,
    onSelectInvestment,
    onAddInvestment,
    isBalanceVisible
}: PortfolioDetailProps) {
    const { portfolios } = usePortfoliosContext();
    const { investments, deleteInvestment, sellInvestment } = useInvestmentsContext();
    const { prices } = usePrices();
    const [sellingInvestment, setSellingInvestment] = useState<Investment | null>(null);

    const portfolio = portfolioId === 'all' || portfolioId === 'uncategorized'
        ? null
        : portfolios.find(p => p.id === portfolioId);

    const filteredInvestments = useMemo(() => {
        if (portfolioId === 'all') {
            return investments;
        }
        if (portfolioId === 'uncategorized') {
            return investments.filter(inv => !inv.portfolio_id);
        }
        return investments.filter(inv => inv.portfolio_id === portfolioId);
    }, [investments, portfolioId]);

    const totalValue = useMemo(() => {
        return filteredInvestments.reduce((total, inv) => {
            const currentPrice = prices[inv.type]?.sellingPrice || 0;
            return total + (inv.amount * currentPrice);
        }, 0);
    }, [filteredInvestments, prices]);

    const getTitle = () => {
        if (portfolioId === 'all') return 'Tüm Varlıklar';
        if (portfolioId === 'uncategorized') return 'Kategorisiz';
        return portfolio?.name || 'Liste';
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu yatırımı silmek istediğinizden emin misiniz?')) {
            await deleteInvestment(id);
        }
    };

    const handleSellClick = (investment: Investment) => {
        setSellingInvestment(investment);
    };

    const handleConfirmSell = async (price: number, amount: number, date: string) => {
        if (sellingInvestment) {
            await sellInvestment(sellingInvestment.id, price, amount, date);
            setSellingInvestment(null);
        }
    };

    return (
        <div className="pt-6">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-apple-light-bg dark:bg-apple-dark-bg py-4 pt-safe">
                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={onBack}
                        className="flex items-center text-apple-blue"
                    >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="font-medium">Geri</span>
                    </button>
                    <button
                        onClick={() => onAddInvestment(portfolioId !== 'all' && portfolioId !== 'uncategorized' ? portfolioId : undefined)}
                        className="bg-apple-blue text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-4 px-2">
                    <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">
                        {getTitle()}
                    </h1>
                    {portfolio?.description && (
                        <p className="text-apple-light-text-secondary dark:text-apple-dark-text-secondary mt-1">
                            {portfolio.description}
                        </p>
                    )}
                    <p className="text-2xl font-semibold text-apple-blue mt-2">
                        {isBalanceVisible
                            ? `₺${totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                            : '₺******'
                        }
                    </p>
                </div>
            </div>

            {/* Investment List */}
            <div className="pt-4">
                {filteredInvestments.length === 0 ? (
                    <EmptyState
                        icon={FolderInput}
                        title="Bu listede varlık yok"
                        description="Listeye yatırım eklemek için + butonuna tıklayın."
                        action={{
                            label: "Yatırım Ekle",
                            onClick: () => onAddInvestment(portfolioId !== 'all' && portfolioId !== 'uncategorized' ? portfolioId : undefined)
                        }}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredInvestments.map((investment) => {
                            const details = typeDetails[investment.type as Investment['type']];
                            if (!details) return null;
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
                        })}
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
