// Konum: src/components/Auth.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Chrome, Loader } from 'lucide-react'; // Google ve Yüklenme ikonu için

export function Auth() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl font-bold">₺</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Birikim'e Hoş Geldiniz</h1>
          <p className="text-gray-600 mt-3 mb-8">
            Varlıklarınızı takip etmeye başlamak için giriş yapın.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loadingGoogle ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  <span>Google ile Giriş Yap</span>
                </>
              )}
            </button>
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center disabled:opacity-50"
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