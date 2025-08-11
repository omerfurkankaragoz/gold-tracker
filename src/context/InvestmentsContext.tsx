import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase, Investment } from '../lib/supabase';
import { usePrices } from '../hooks/usePrices'; // Fiyatları dinlemek için içeri alıyoruz

// Context'in artık toplam portföy değerini de tutacağını belirtiyoruz
interface IInvestmentsContext {
  investments: Investment[];
  loading: boolean;
  totalPortfolioValue: number; // EN ÖNEMLİ EKLENTİ
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Investment | null; error: any; }>;
  deleteInvestment: (id: string) => Promise<{ error: any; }>;
  refetch: () => void;
}

const InvestmentsContext = createContext<IInvestmentsContext | undefined>(undefined);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fiyatları doğrudan bu context içinde dinliyoruz
  const { prices } = usePrices();

  // ==================================================================
  // ÇÖZÜMÜN KALBİ: Toplam Değeri Burada Hesaplıyoruz
  // 'investments' veya 'prices' her değiştiğinde bu değer anında yeniden hesaplanır.
  // ==================================================================
  const totalPortfolioValue = useMemo(() => {
    if (investments.length === 0 || Object.keys(prices).length === 0) {
      return 0;
    }
    return investments.reduce((total, investment) => {
      const currentPrice = prices[investment.type]?.sellingPrice || 0;
      return total + (investment.amount * currentPrice);
    }, 0);
  }, [investments, prices]);


  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
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

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([investment])
        .select()
        .single();

      if (error) throw error;
      
      // YENİ EKLENEN YATIRIMI LİSTEYE EKLE (Bu işlem totalPortfolioValue'yu yeniden tetikler)
      if (data) {
        setInvestments(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Yeni toplam değeri context aracılığıyla tüm uygulamaya dağıtıyoruz
  const value = {
    investments,
    loading,
    totalPortfolioValue,
    addInvestment,
    deleteInvestment,
    refetch: fetchInvestments,
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