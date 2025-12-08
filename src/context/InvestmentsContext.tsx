import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase, Investment, Sale } from '../lib/supabase';
import { usePrices } from '../hooks/usePrices';
import { Session, User } from '@supabase/supabase-js';

interface IInvestmentsContext {
  investments: Investment[];
  sales: Sale[];
  loading: boolean;
  totalPortfolioValue: number;
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<{ data: Investment | null; error: any; }>;
  deleteInvestment: (id: string) => Promise<{ error: any; }>;
  sellInvestment: (id: string, sellPrice: number, amountToSell: number, saleDate?: string) => Promise<{ error: any; }>;
  fetchSales: () => Promise<void>;
  refetch: () => void;
}

const InvestmentsContext = createContext<IInvestmentsContext | undefined>(undefined);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
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

  const fetchInvestments = useCallback(async (currentUser: User) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sold_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchInvestments(user);
      fetchSales();
    } else {
      setInvestments([]);
      setSales([]);
    }
  }, [user, fetchInvestments, fetchSales]);

  const totalPortfolioValue = useMemo(() => {
    return investments.reduce((total, investment) => {
      const currentPrice = prices[investment.type]?.sellingPrice || 0;
      return total + (investment.amount * currentPrice);
    }, 0);
  }, [investments, prices]);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      const investmentWithUser = { ...investment, user_id: user.id };

      const { data, error } = await supabase
        .from('investments')
        .insert([investmentWithUser])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setInvestments(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteInvestment = async (id: string) => {
    if (!user) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      const { error } = await supabase.from('investments').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const sellInvestment = async (id: string, sellPrice: number, amountToSell: number, saleDate: string = new Date().toISOString().split('T')[0]) => {
    if (!user) throw new Error("Kullanıcı yok");

    const investment = investments.find(inv => inv.id === id);
    if (!investment) return { error: "Yatırım bulunamadı" };

    try {
      // 1. Satış kaydını oluştur (sold_at artık sadece tarih)
      const { error: saleError } = await supabase.from('sales').insert([{
        user_id: user.id,
        type: investment.type,
        amount: amountToSell,
        buy_price: investment.purchase_price,
        sell_price: sellPrice,
        sold_at: saleDate, // YYYY-MM-DD formatında gelir
        purchase_date: investment.purchase_date
      }]);

      if (saleError) throw saleError;

      // 2. Mevcut yatırımı güncelle veya sil
      if (amountToSell >= investment.amount) {
        await deleteInvestment(id);
      } else {
        const { error: updateError } = await supabase
          .from('investments')
          .update({ amount: investment.amount - amountToSell })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        setInvestments(prev => prev.map(inv =>
          inv.id === id ? { ...inv, amount: inv.amount - amountToSell } : inv
        ));
      }

      fetchSales();
      return { error: null };

    } catch (error) {
      console.error("Satış hatası:", error);
      return { error };
    }
  };

  const value = {
    investments,
    sales,
    loading,
    totalPortfolioValue,
    addInvestment,
    deleteInvestment,
    sellInvestment,
    fetchSales,
    refetch: () => user ? fetchInvestments(user) : undefined,
  };

  return (
    <InvestmentsContext.Provider value={value}>
      {children}
    </InvestmentsContext.Provider>
  );
};

export const useInvestmentsContext = () => {
  const context = useContext(InvestmentsContext);
  if (context === undefined) {
    throw new Error('useInvestmentsContext must be used within a InvestmentsProvider');
  }
  return context;
};