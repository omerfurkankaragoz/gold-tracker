import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, Investment } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { Insights } from './components/Insights';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { InvestmentDetail } from './components/InvestmentDetail';
import { AddInvestmentPage } from './components/AddInvestmentPage';
import { Navigation } from './components/Navigation';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-full w-full bg-apple-light-bg dark:bg-apple-dark-bg" />;
  }

  return (
    <div className="h-full w-full">
      {!session ? <Auth /> : <MainApp key={session.user.id} />}
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [addInvestmentState, setAddInvestmentState] = useState<{
    isOpen: boolean;
    initialType?: Investment['type'];
  }>({ isOpen: false });
  
  // ======================= GÜNCELLENEN BÖLÜM 1: State'in Hafızadan Okunması =======================
  // isBalanceVisible state'i artık başlangıç değerini localStorage'dan okur.
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isBalanceVisible');
    // Eğer kayıtlı bir durum varsa onu kullan (string'i boolean'a çevirerek).
    // Eğer kayıt yoksa, varsayılan olarak 'true' (görünür) başla.
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // ======================= GÜNCELLENEN BÖLÜM 2: State Değişikliğinin Kaydedilmesi =======================
  // isBalanceVisible state'i her değiştiğinde bu fonksiyon çalışır.
  useEffect(() => {
    // Yeni durumu string formatında localStorage'a kaydeder.
    localStorage.setItem('isBalanceVisible', JSON.stringify(isBalanceVisible));
  }, [isBalanceVisible]);
  // ===============================================================================================

  const handleSelectInvestment = (id: string) => {
    setActiveTab('holdings');
    setSelectedInvestmentId(id);
  };

  const handleBackToHoldings = () => {
    setSelectedInvestmentId(null);
  };

  const handleGoToAddInvestment = (initialType?: Investment['type']) => {
    if (initialType) {
        setActiveTab('dashboard');
    } else {
        setActiveTab('holdings');
    }
    setAddInvestmentState({ isOpen: true, initialType: initialType });
  };
  
  const handleBackFromAdd = () => {
    setAddInvestmentState({ isOpen: false });
  };

  const renderContent = () => {
    if (addInvestmentState.isOpen) {
      return <AddInvestmentPage onBack={handleBackFromAdd} initialSelectedType={addInvestmentState.initialType} isDirectAdd={!!addInvestmentState.initialType} />;
    }
    
    if (selectedInvestmentId) {
      return <InvestmentDetail investmentId={selectedInvestmentId} onBack={handleBackToHoldings} />;
    }

    switch (activeTab) {
      case 'holdings':
        return <Holdings 
                  onSelectInvestment={handleSelectInvestment} 
                  onAddInvestment={() => handleGoToAddInvestment()} 
                  isBalanceVisible={isBalanceVisible}
               />;
      case 'insights':
        return <Insights isBalanceVisible={isBalanceVisible} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard 
                  onNavigate={setActiveTab} 
                  onAddInvestment={handleGoToAddInvestment} 
                  isBalanceVisible={isBalanceVisible}
                  setIsBalanceVisible={setIsBalanceVisible}
               />;
    }
  };
  
  const isFullScreenPageOpen = !!selectedInvestmentId || addInvestmentState.isOpen;

  return (
    <div className="h-full w-full flex flex-col bg-apple-light-bg dark:bg-apple-dark-bg">
      <main className="flex-grow overflow-y-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>
      {!isFullScreenPageOpen && (
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;