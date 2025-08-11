// Konum: src/components/Profile.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, User, Loader } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Profil verisinin tipini tanımlıyoruz
type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
};

export function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Component ilk yüklendiğinde kullanıcı ve profil bilgilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // 1. O anki kullanıcı oturumunu al
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // 2. Kullanıcı ID'si ile 'profiles' tablosundan profil bilgilerini çek
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single(); // Sadece tek bir sonuç beklediğimizi belirtiyoruz

        if (error && error.code !== 'PGRST116') { // 'PGRST116' = "0 rows" hatası, bu normal olabilir
          console.error("Profil bilgisi çekilirken hata:", error);
        } else {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Profil resmi veya ismini belirle, misafirler için varsayılan değerler ata
  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.full_name || (user?.is_anonymous ? 'Misafir Kullanıcı' : user?.email);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        {/* Profil resmi varsa göster, yoksa standart ikon göster */}
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profil Resmi"
            className="w-24 h-24 rounded-full object-cover mb-4 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900">
          {displayName}
        </h1>
        {/* Sadece Google kullanıcısıysa e-postayı göster */}
        {!user?.is_anonymous && (
            <p className="text-gray-500 mt-1">
              {user?.email}
            </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-500" />
          <span className="font-semibold">Çıkış Yap</span>
        </button>
      </div>

      {/* "Hesabımı Sil" bölümü isteğiniz üzerine şimdilik kapalı */}
      {/* <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
        ...
      </div>
      */}
    </div>
  );
}