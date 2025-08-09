import { useState, useEffect } from 'react';

// Mock investment type for demo
export type Investment = {
  id: string;
  asset_type: 'gold' | 'usd' | 'eur';
  asset_name: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
};

export function useInvestments() {
  // Mock data for demo - in real app this would come from Supabase
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      asset_type: 'gold',
      asset_name: 'Gram Altın',
      amount: 10,
      purchase_price: 2450.00,
      purchase_date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      asset_type: 'usd',
      asset_name: 'Amerikan Doları',
      amount: 500,
      purchase_price: 32.80,
      purchase_date: '2024-02-01',
      created_at: '2024-02-01T14:30:00Z',
      updated_at: '2024-02-01T14:30:00Z',
    },
    {
      id: '3',
      asset_type: 'eur',
      asset_name: 'Euro',
      amount: 300,
      purchase_price: 35.60,
      purchase_date: '2024-02-10',
      created_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-02-10T09:15:00Z',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newInvestment: Investment = {
        ...investment,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setInvestments(prev => [newInvestment, ...prev]);
      return { data: newInvestment, error: null };
    } catch (error) {
      console.error('Error adding investment:', error);
      return { data: null, error };
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting investment:', error);
      return { error };
    }
  };

  const fetchInvestments = async () => {
    // Mock function for demo
  };

  return {
    investments,
    loading,
    addInvestment,
    deleteInvestment,
    refetch: fetchInvestments,
  };
}