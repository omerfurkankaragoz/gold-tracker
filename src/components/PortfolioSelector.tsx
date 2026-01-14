import { useState } from 'react';
import { Folder, Check, ChevronDown } from 'lucide-react';
import { usePortfoliosContext } from '../context/PortfoliosContext';

interface PortfolioSelectorProps {
    selectedPortfolioId?: string;
    onSelect: (portfolioId: string | undefined) => void;
}

export function PortfolioSelector({ selectedPortfolioId, onSelect }: PortfolioSelectorProps) {
    const { portfolios } = usePortfoliosContext();
    const [isOpen, setIsOpen] = useState(false);

    const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-left"
            >
                <div className="flex items-center space-x-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: selectedPortfolio ? `${selectedPortfolio.color}20` : '#8E8E9320' }}
                    >
                        <Folder
                            className="h-5 w-5"
                            style={{ color: selectedPortfolio?.color || '#8E8E93' }}
                        />
                    </div>
                    <span className="text-apple-light-text-primary dark:text-apple-dark-text-primary">
                        {selectedPortfolio?.name || 'Varlıklarım'}
                    </span>
                </div>
                <ChevronDown className={`h-5 w-5 text-apple-light-text-secondary dark:text-apple-dark-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="mt-2 bg-apple-light-card dark:bg-apple-dark-card rounded-xl overflow-hidden animate-fade-in border border-gray-100 dark:border-white/5">
                    {/* Kategorisiz option */}
                    <button
                        type="button"
                        onClick={() => {
                            onSelect(undefined);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                <Folder className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                                Kategorisiz (Varlıklarım)
                            </span>
                        </div>
                        {!selectedPortfolioId && (
                            <Check className="h-5 w-5 text-apple-blue" />
                        )}
                    </button>

                    {/* Portfolio options */}
                    {portfolios.map(portfolio => (
                        <button
                            key={portfolio.id}
                            type="button"
                            onClick={() => {
                                onSelect(portfolio.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: `${portfolio.color}20` }}
                                >
                                    <Folder className="h-5 w-5" style={{ color: portfolio.color }} />
                                </div>
                                <span className="text-apple-light-text-primary dark:text-apple-dark-text-primary">
                                    {portfolio.name}
                                </span>
                            </div>
                            {selectedPortfolioId === portfolio.id && (
                                <Check className="h-5 w-5 text-apple-blue" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
