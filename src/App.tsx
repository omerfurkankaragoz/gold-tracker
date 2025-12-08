import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { History } from './components/History';
import { HistoryDetail } from './components/HistoryDetail';

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
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [addInvestmentState, setAddInvestmentState] = useState<{
    isOpen: boolean;
    initialType?: Investment['type'];
  }>({ isOpen: false });

  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isBalanceVisible');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('isBalanceVisible', JSON.stringify(isBalanceVisible));
  }, [isBalanceVisible]);

  const handleSelectInvestment = (id: string) => {
    setActiveTab('holdings');
    setSelectedInvestmentId(id);
  };

  const handleBackToHoldings = () => {
    setSelectedInvestmentId(null);
  };

  const handleSelectSale = (id: string) => {
    setSelectedSaleId(id);
  };

  const handleBackToHistory = () => {
    setSelectedSaleId(null);
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

    if (selectedSaleId) {
      return <HistoryDetail saleId={selectedSaleId} onBack={handleBackToHistory} />;
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
      case 'history':
        return <History onSelectSale={handleSelectSale} />;
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

  const isFullScreenPageOpen = !!selectedInvestmentId || !!selectedSaleId || addInvestmentState.isOpen;

  const pageKey = addInvestmentState.isOpen
    ? 'add-investment'
    : selectedInvestmentId
      ? `investment-${selectedInvestmentId}`
      : selectedSaleId
        ? `sale-${selectedSaleId}`
        : activeTab;

  return (
    <div className="h-full w-full flex flex-col bg-apple-light-bg dark:bg-apple-dark-bg">
      {/* DEĞİŞİKLİK 1: pb-24 -> pb-40 (Daha fazla alt boşluk) */}
      <main className="flex-grow overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            // DEĞİŞİKLİK 2: "h-full" sınıfı kaldırıldı, sadece "w-full" bırakıldı.
            // Bu sayede içerik uzadıkça kapsayıcı da uzayacak ve padding işleyecek.
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isFullScreenPageOpen && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;