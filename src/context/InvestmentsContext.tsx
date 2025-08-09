import React,
{
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { supabase, Investment } from '../lib/supabase';

// Context'in tutacağı verilerin tipini tanımlıyoruz
interface IInvestmentsContext {
  investments: Investment[];
  loading: boolean;
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Investment | null; error: any; }>;
  deleteInvestment: (id: string) => Promise<{ error: any; }>;
  refetch: () => void;
}

// Context'i oluşturuyoruz
const InvestmentsContext = createContext<IInvestmentsContext | undefined>(undefined);

// Uygulamamızı sarmalayacak olan Provider component'i
export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    try {
      // Filtreleme olmadan tüm yatırımları çekiyoruz.
      // Bu, kullanıcı girişi olmayan senaryolar için uygundur.
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) {
        // Hata varsa konsola yazdırıyoruz ama uygulamayı kesintiye uğratmıyoruz.
        console.error('Error fetching investments:', error);
        throw error;
      }
      
      setInvestments(data || []);
    } catch (error) {
      // Hata durumunda listeyi boşaltarak tutarsız veri gösterimini engelliyoruz.
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Veritabanına yeni yatırımı ekliyoruz
      const { data, error } = await supabase
        .from('investments')
        .insert([investment])
        .select()
        .single(); // Eklenen tek bir kaydı geri döndürmesini sağlıyoruz

      if (error) {
        console.error('Error adding investment:', error);
        throw error;
      }
      
      // Ekleme başarılı olursa, state'i güncelleyerek arayüzün anında yenilenmesini sağlıyoruz.
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
      if (error) {
        console.error('Error deleting investment:', error);
        throw error;
      }
      // Silme başarılı olursa, state'den ilgili yatırımı çıkarıyoruz.
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    // Component ilk yüklendiğinde yatırımları getiriyoruz.
    fetchInvestments();
  }, [fetchInvestments]);

  const value = {
    investments,
    loading,
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

// Bu custom hook, component'lerden context'e kolayca erişmemizi sağlayacak
export const useInvestmentsContext = () => {
  const context = useContext(InvestmentsContext);
  if (context === undefined) {
    throw new Error('useInvestmentsContext must be used within a InvestmentsProvider');
  }
  return context;
};
