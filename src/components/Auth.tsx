import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader, Moon, Sun, AreaChart, Coins, Wallet, Landmark, PiggyBank, TrendingUp } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useTheme } from '../context/ThemeContext';

// Tema Değiştirme Butonu
function AuthThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-6 right-6 p-2 rounded-full bg-gray-200/50 dark:bg-apple-dark-card/50 text-apple-light-text-secondary dark:text-apple-dark-text-secondary hover:bg-gray-200 dark:hover:bg-apple-dark-card transition-colors"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}

// Animasyonlu Logo Component'i
function AnimatedAppIcon() {
  const iconSize = 48;
  const iconContainerHeight = 96; // w-24 h-24 -> 6rem = 96px

  // Yeni ikonlarla birlikte daha zengin bir liste
  const icons = [AreaChart, Coins, Wallet, TrendingUp, Landmark, PiggyBank];

  return (
    <div 
      className="w-24 h-24 bg-gradient-to-br from-apple-blue to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden"
      style={{ height: iconContainerHeight }}
    >
      <div className="animate-scroll-up">
        {/* İkon listesini iki kez tekrarlayarak pürüzsüz bir döngü sağlıyoruz */}
        {[...icons, ...icons].map((Icon, index) => (
          <div key={index} className="flex items-center justify-center" style={{ height: iconContainerHeight }}>
            <Icon size={iconSize} className="text-white" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Ana Giriş Component'i
export function Auth() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      console.error('Google ile giriş hatası:', error);
      setLoadingGoogle(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setLoadingGuest(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Misafir girişi hatası:', error);
      setLoadingGuest(false);
    }
  };

  const isLoading = loadingGoogle || loadingGuest;

  return (
    <div className="min-h-screen bg-apple-light-bg dark:bg-apple-dark-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AuthThemeToggle />
      <div className="w-full max-w-sm text-center">
        <AnimatedAppIcon />
        
        <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Kenz'e Hoş Geldin</h1>
          <p className="text-apple-light-text-secondary dark:text-apple-dark-text-secondary mt-3 mb-8">
            Varlıklarını kolayca takip etmeye başla.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-apple-light-card dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-apple-light-text-primary dark:text-apple-dark-text-primary py-3 rounded-xl font-semibold hover:bg-gray-200/50 dark:hover:bg-gray-600 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loadingGoogle ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  <span>Google ile Giriş Yap</span>
                </>
              )}
            </button>
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingGuest ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <span>Misafir Olarak Devam Et</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}