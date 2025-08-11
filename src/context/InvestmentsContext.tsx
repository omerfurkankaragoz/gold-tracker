// Konum: src/context/InvestmentsContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase, Investment } from '../lib/supabase';
import { usePrices } from '../hooks/usePrices';
import { Session, User } from '@supabase/supabase-js';

interface IInvestmentsContext {
  investments: Investment[];
  loading: boolean;
  totalPortfolioValue: number;
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<{ data: Investment | null; error: any; }>;
  deleteInvestment: (id: string) => Promise<{ error: any; }>;
  refetch: () => void;
}

const InvestmentsContext = createContext<IInvestmentsContext | undefined>(undefined);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const { prices } = usePrices();

  // Oturum durumunu dinle ve kullanıcıyı state'e al
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);


  // ==================================================================
  // KRİTİK DEĞİŞİKLİK: Veri çekme işlemi artık kullanıcıya bağlı
  // ==================================================================
  const fetchInvestments = useCallback(async (currentUser: User) => {
    if (!currentUser) return; // Kullanıcı yoksa işlem yapma
    setLoading(true);
    try {
      // Sadece o an giriş yapmış kullanıcının yatırımlarını çek (.eq('user_id', ...))
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', currentUser.id) // FİLTRELEME
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

  // Kullanıcı değiştiğinde yatırımlarını yeniden çek
  useEffect(() => {
    if (user) {
      fetchInvestments(user);
    } else {
      // Kullanıcı çıkış yaparsa listeyi temizle
      setInvestments([]);
    }
  }, [user, fetchInvestments]);

  const totalPortfolioValue = useMemo(() => {
    return investments.reduce((total, investment) => {
      const currentPrice = prices[investment.type]?.sellingPrice || 0;
      return total + (investment.amount * currentPrice);
    }, 0);
  }, [investments, prices]);


  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      // Eklenen yeni varlığa o anki kullanıcının ID'sini ekle
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
      // Silme işleminde de kullanıcının kendi verisini sildiğinden emin ol
      const { error } = await supabase.from('investments').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    investments,
    loading,
    totalPortfolioValue,
    addInvestment,
    deleteInvestment,
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