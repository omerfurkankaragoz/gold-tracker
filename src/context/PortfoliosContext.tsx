import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase, Portfolio, Investment } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { usePrices } from '../hooks/usePrices';

interface IPortfoliosContext {
    portfolios: Portfolio[];
    loading: boolean;
    addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<{ data: Portfolio | null; error: any }>;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<{ error: any }>;
    deletePortfolio: (id: string) => Promise<{ error: any }>;
    getPortfolioValue: (portfolioId: string, investments: Investment[]) => number;
    refetch: () => void;
}

const PortfoliosContext = createContext<IPortfoliosContext | undefined>(undefined);

export const PortfoliosProvider = ({ children }: { children: ReactNode }) => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const { prices } = usePrices();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchPortfolios = useCallback(async (currentUser: User) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('portfolios')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPortfolios(data || []);
        } catch (error) {
            console.error('Error fetching portfolios:', error);
            setPortfolios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchPortfolios(user);
        } else {
            setPortfolios([]);
        }
    }, [user, fetchPortfolios]);

    const addPortfolio = async (portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
        if (!user) throw new Error("Kullanıcı giriş yapmamış.");
        try {
            const portfolioWithUser = { ...portfolio, user_id: user.id };

            const { data, error } = await supabase
                .from('portfolios')
                .insert([portfolioWithUser])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setPortfolios(prev => [...prev, data]);
            }
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
        if (!user) throw new Error("Kullanıcı giriş yapmamış.");
        try {
            const { error } = await supabase
                .from('portfolios')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setPortfolios(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ));
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const deletePortfolio = async (id: string) => {
        if (!user) throw new Error("Kullanıcı giriş yapmamış.");
        try {
            const { error } = await supabase
                .from('portfolios')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setPortfolios(prev => prev.filter(p => p.id !== id));
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const getPortfolioValue = useCallback((portfolioId: string, investments: Investment[]) => {
        const portfolioInvestments = portfolioId === 'all'
            ? investments
            : investments.filter(inv => inv.portfolio_id === portfolioId);

        return portfolioInvestments.reduce((total, investment) => {
            const currentPrice = prices[investment.type]?.sellingPrice || 0;
            return total + (investment.amount * currentPrice);
        }, 0);
    }, [prices]);

    const value = {
        portfolios,
        loading,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        getPortfolioValue,
        refetch: () => user ? fetchPortfolios(user) : undefined,
    };

    return (
        <PortfoliosContext.Provider value={value}>
            {children}
        </PortfoliosContext.Provider>
    );
};

export const usePortfoliosContext = () => {
    const context = useContext(PortfoliosContext);
    if (context === undefined) {
        throw new Error('usePortfoliosContext must be used within a PortfoliosProvider');
    }
    return context;
};
