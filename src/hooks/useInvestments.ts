import { useState, useEffect } from 'react';
import { supabase, Investment } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchInvestments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setInvestments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding investment:', error);
      return { data: null, error };
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting investment:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  return {
    investments,
    loading,
    addInvestment,
    deleteInvestment,
    refetch: fetchInvestments,
  };
}