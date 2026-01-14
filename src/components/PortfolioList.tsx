import { useState, useMemo, useEffect } from 'react';
import { Folder, FolderPlus, Plus, X } from 'lucide-react';
import { usePortfoliosContext } from '../context/PortfoliosContext';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment, Portfolio } from '../lib/supabase';
import { SwipeableItem } from './SwipeableItem';
import { SellModal } from './SellModal';
import { ConfirmModal } from './ConfirmModal';
import { typeDetails } from './Holdings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const PORTFOLIO_COLORS = [
    '#0A84FF', '#30D158', '#FF9500', '#FF375F', '#AF52DE', '#FFD60A', '#64D2FF', '#FF6482',
];

const COLLAPSED_STORAGE_KEY = 'portfolio_collapsed_sections';

const getCollapsedSections = (): Record<string, boolean> => {
    try {
        const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const setCollapsedSections = (sections: Record<string, boolean>) => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(sections));
};

interface PortfolioListProps {
    onSelectInvestment: (id: string) => void;
    onAddInvestment: (portfolioId?: string) => void;
    isBalanceVisible: boolean;
}

export function PortfolioList({ onSelectInvestment, onAddInvestment, isBalanceVisible }: PortfolioListProps) {
    const { portfolios, addPortfolio, deletePortfolio, updatePortfolio } = usePortfoliosContext();
    const { investments, deleteInvestment, sellInvestment } = useInvestmentsContext();
    const { prices } = usePrices();

    const [collapsedSections, setCollapsedSectionsState] = useState<Record<string, boolean>>(getCollapsedSections);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PORTFOLIO_COLORS[0]);

    // Edit Modal State
    const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    // Sell Modal State
    const [sellModalInvestment, setSellModalInvestment] = useState<Investment | null>(null);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        setCollapsedSections(collapsedSections);
    }, [collapsedSections]);

    // Group investments by portfolio
    const groupedInvestments = useMemo(() => {
        const groups: Record<string, { portfolio: Portfolio | null; investments: Investment[]; totalValue: number }> = {};

        investments.forEach(inv => {
            const key = inv.portfolio_id || 'uncategorized';
            if (!groups[key]) {
                const portfolio = portfolios.find(p => p.id === key) || null;
                groups[key] = { portfolio, investments: [], totalValue: 0 };
            }
            groups[key].investments.push(inv);
            const currentPrice = prices[inv.type]?.sellingPrice || 0;
            groups[key].totalValue += inv.amount * currentPrice;
        });

        return groups;
    }, [investments, portfolios, prices]);

    // Sections with investments (sorted by value)
    const sectionsWithInvestments = useMemo(() => {
        return Object.entries(groupedInvestments)
            .filter(([_, data]) => data.investments.length > 0)
            .sort((a, b) => b[1].totalValue - a[1].totalValue)
            .map(([key]) => key);
    }, [groupedInvestments]);

    // Empty portfolios (no investments)
    const emptyPortfolios = useMemo(() => {
        const portfolioIdsWithInvestments = new Set(
            investments.map(inv => inv.portfolio_id).filter(Boolean)
        );
        return portfolios.filter(p => !portfolioIdsWithInvestments.has(p.id));
    }, [portfolios, investments]);

    const toggleSection = (key: string) => {
        setCollapsedSectionsState(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddPortfolio = async () => {
        if (!newPortfolioName.trim()) return;
        await addPortfolio({
            name: newPortfolioName.trim(),
            icon: 'folder',
            color: selectedColor,
        });
        setNewPortfolioName('');
        setSelectedColor(PORTFOLIO_COLORS[0]);
        setIsAddModalOpen(false);
    };

    const handleEditPortfolio = (portfolio: Portfolio) => {
        setEditingPortfolio(portfolio);
        setEditName(portfolio.name);
        setEditColor(portfolio.color);
    };

    const handleSaveEdit = async () => {
        if (!editingPortfolio || !editName.trim()) return;
        await updatePortfolio(editingPortfolio.id, {
            name: editName.trim(),
            color: editColor,
        });
        setEditingPortfolio(null);
        setEditName('');
        setEditColor('');
    };

    const handleDeleteEmptyPortfolio = (portfolioId: string, portfolioName: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Listeyi Sil',
            message: `"${portfolioName}" listesini silmek istediğinizden emin misiniz?`,
            onConfirm: () => deletePortfolio(portfolioId),
        });
    };



    const handleDeleteInvestment = (investment: Investment) => {
        const details = typeDetails[investment.type as Investment['type']];
        setConfirmModal({
            isOpen: true,
            title: 'Varlığı Sil',
            message: `${details?.name || investment.type} varlığını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
            onConfirm: () => deleteInvestment(investment.id),
        });
    };

    const handleSellInvestment = (investment: Investment) => {
        setSellModalInvestment(investment);
    };

    const handleSellConfirm = async (sellPrice: number, amountToSell: number, saleDate?: string) => {
        if (sellModalInvestment) {
            await sellInvestment(sellModalInvestment.id, sellPrice, amountToSell, saleDate);
            setSellModalInvestment(null);
        }
    };

    const renderInvestmentCard = (investment: Investment) => {
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
                    onDelete={() => handleDeleteInvestment(investment)}
                    onSell={() => handleSellInvestment(investment)}
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
    };

    const renderPortfolioHeader = (
        key: string,
        name: string,
        color: string,
        _count: number,
        totalValue: number,
        isUncategorized: boolean,
        portfolio: Portfolio | null
    ) => {

        const headerContent = (
            <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between py-3 px-1"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-0">
                        <Folder className="h-6 w-6" style={{ color }} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-xl text-apple-light-text-primary dark:text-apple-dark-text-primary">{name}</p>
                        <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                            {isBalanceVisible ? `₺${totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}
                        </p>
                    </div>
                </div>
            </button>
        );

        // Kategorisiz için swipe yok
        if (isUncategorized || !portfolio) {
            return headerContent;
        }

        // İçinde varlık olan listeler için sadece düzenleme
        return (
            <SwipeableItem
                onEdit={() => handleEditPortfolio(portfolio)}
                className="bg-apple-light-bg dark:bg-apple-dark-bg"
            >
                {headerContent}
            </SwipeableItem>
        );
    };

    const renderSection = (key: string, data: { portfolio: Portfolio | null; investments: Investment[]; totalValue: number }) => {
        const isUncategorized = key === 'uncategorized';
        const isCollapsed = collapsedSections[key] === true;
        const name = isUncategorized ? 'Varlıklarım' : data.portfolio?.name || 'Liste';
        const color = isUncategorized ? '#8E8E93' : data.portfolio?.color || '#0A84FF';
        const count = data.investments.length;

        return (
            <div key={key} className="mb-4">
                {/* Section Header with SwipeableItem */}
                {renderPortfolioHeader(key, name, color, count, data.totalValue, isUncategorized, data.portfolio)}

                {/* Investments */}
                {!isCollapsed && (
                    <div className="mt-2">
                        {data.investments.map(inv => renderInvestmentCard(inv))}
                    </div>
                )}
            </div>
        );
    };

    const renderEmptyPortfolio = (portfolio: Portfolio) => {
        return (
            <div key={portfolio.id} className="mb-2">
                <SwipeableItem
                    onEdit={() => handleEditPortfolio(portfolio)}
                    onDelete={() => handleDeleteEmptyPortfolio(portfolio.id, portfolio.name)}
                    className="bg-apple-light-bg dark:bg-apple-dark-bg"
                >
                    <div className="flex items-center justify-between py-3 px-1">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: `${portfolio.color}20` }}>
                                <Folder className="h-5 w-5" style={{ color: portfolio.color }} />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-apple-light-text-primary dark:text-apple-dark-text-primary">{portfolio.name}</p>
                                <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                                    Boş liste
                                </p>
                            </div>
                        </div>
                    </div>
                </SwipeableItem>
            </div>
        );
    };

    return (
        <div className="pt-6">
            {/* Fixed Header */}
            <div className="sticky top-0 z-20 bg-apple-light-bg dark:bg-apple-dark-bg py-4 pt-safe">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Varlıklarım</h1>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-gray-200/50 dark:bg-gray-800 p-2 rounded-full hover:opacity-90 transition-opacity"
                            title="Yeni Liste"
                        >
                            <FolderPlus className="h-6 w-6 text-apple-light-text-primary dark:text-apple-dark-text-primary" />
                        </button>
                        <button
                            onClick={() => onAddInvestment()}
                            className="bg-apple-blue text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                            title="Varlık Ekle"
                        >
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sections with investments */}
            <div className="pt-4">
                {sectionsWithInvestments.map(key => renderSection(key, groupedInvestments[key]))}
            </div>

            {/* Empty portfolios section */}
            {emptyPortfolios.length > 0 && (
                <div className="pt-4 pb-8">
                    <p className="text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-3 px-1">
                        Boş Listeler (düzenlemek veya silmek için sola kaydırın)
                    </p>
                    {emptyPortfolios.map(p => renderEmptyPortfolio(p))}
                </div>
            )}

            {/* Empty state */}
            {investments.length === 0 && emptyPortfolios.length === 0 && (
                <div className="text-center py-16">
                    <Folder className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Henüz varlık eklemediniz</h3>
                    <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary mt-1">Portföyünüzü oluşturmaya başlayın.</p>
                    <button
                        onClick={() => onAddInvestment()}
                        className="mt-4 px-6 py-3 bg-apple-blue text-white font-semibold rounded-xl"
                    >
                        Varlık Ekle
                    </button>
                </div>
            )}

            {/* Bottom padding */}
            <div className="pb-8" />

            {/* Add Portfolio Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md bg-apple-light-card dark:bg-apple-dark-card rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                Yeni Liste Oluştur
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                            >
                                <X className="h-5 w-5 text-apple-light-text-secondary dark:text-apple-dark-text-secondary" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-2">
                                    Liste Adı
                                </label>
                                <input
                                    type="text"
                                    value={newPortfolioName}
                                    onChange={(e) => setNewPortfolioName(e.target.value)}
                                    placeholder="Birikimlerim"
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-apple-light-text-primary dark:text-apple-dark-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-2">
                                    Renk
                                </label>
                                <div className="flex space-x-3 flex-wrap gap-y-2">
                                    {PORTFOLIO_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full transition-transform ${selectedColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-apple-light-card dark:ring-offset-apple-dark-card' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddPortfolio}
                                disabled={!newPortfolioName.trim()}
                                className="w-full py-4 bg-apple-blue text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity mt-4"
                            >
                                Liste Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Portfolio Modal */}
            {editingPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md bg-apple-light-card dark:bg-apple-dark-card rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                Listeyi Düzenle
                            </h2>
                            <button
                                onClick={() => setEditingPortfolio(null)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                            >
                                <X className="h-5 w-5 text-apple-light-text-secondary dark:text-apple-dark-text-secondary" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-2">
                                    Liste Adı
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Liste adı"
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-apple-light-text-primary dark:text-apple-dark-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-2">
                                    Renk
                                </label>
                                <div className="flex space-x-3 flex-wrap gap-y-2">
                                    {PORTFOLIO_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setEditColor(color)}
                                            className={`w-10 h-10 rounded-full transition-transform ${editColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-apple-light-card dark:ring-offset-apple-dark-card' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveEdit}
                                disabled={!editName.trim()}
                                className="w-full py-4 bg-apple-blue text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity mt-4"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sell Modal */}
            <SellModal
                investment={sellModalInvestment}
                isOpen={sellModalInvestment !== null}
                onClose={() => setSellModalInvestment(null)}
                onConfirm={handleSellConfirm}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}
