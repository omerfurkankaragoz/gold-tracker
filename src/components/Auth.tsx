import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader, Moon, Sun } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useTheme } from '../context/ThemeContext';

// Tema Değiştirme Butonu
function AuthThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-6 right-6 p-2 rounded-full bg-gray-200/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AuthThemeToggle />
      <div className="w-full max-w-sm text-center">
        {/* ======================= GÜNCELLENEN BÖLÜM: Animasyonlu Logo ======================= */}
        {/* `animate-float` sınıfı ile logoya animasyon eklendi */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float shadow-lg">
          <span className="text-white text-6xl font-bold">₺</span>
        </div>
        {/* ============================================================================== */}
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Birikim'e Hoş Geldin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 mb-8">
            Varlıklarını kolayca takip etmeye başla.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
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
              className="w-full bg-gray-800 dark:bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-500 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingGuest ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <span>Misafir Olarak Devam Et</span>
              )}
            </button>
          </div>
        </div>
        {/* Kullanım koşulları yazısı kaldırıldı */}
      </div>
    </div>
  );
}