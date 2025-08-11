// Konum: src/components/Profile.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Trash2, User, AlertTriangle, Loader } from 'lucide-react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Profil verisinin tipini tanımlıyoruz
type ProfileData = {
  full_name: string;
  avatar_url: string;
};

export function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Component ilk yüklendiğinde kullanıcı ve profil bilgilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // 1. O anki kullanıcıyı al
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // 2. Kullanıcı ID'si ile 'profiles' tablosundan profil bilgilerini çek
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single(); // Sadece tek bir sonuç beklediğimizi belirtiyoruz

        if (error) {
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

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt("Bu işlem geri alınamaz. Hesabınızı ve tüm verilerinizi kalıcı olarak silmek için 'sil' yazın.");
    if (confirmation === 'sil') {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) {
        alert("Hesap silinirken bir hata oluştu: " + error.message);
      } else {
        alert("Hesabınız ve tüm verileriniz başarıyla silindi.");
        await supabase.auth.signOut();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        {/* Profil resmi varsa göster, yoksa standart ikon göster */}
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Profil Resmi"
            className="w-24 h-24 rounded-full object-cover mb-4 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900">
          {/* İsim varsa göster, yoksa "Misafir Kullanıcı" yaz */}
          {profile?.full_name || 'Misafir Kullanıcı'}
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.email || ''}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors rounded-t-2xl"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-500" />
          <span className="font-semibold">Çıkış Yap</span>
        </button>
      </div>

      <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
        <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-semibold text-red-800">Tehlikeli Alan</h3>
                <p className="text-sm text-red-700 mt-1 mb-3">
                    Hesabınızı silerseniz, tüm varlıklarınız ve geçmiş verileriniz kalıcı olarak yok olur.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Hesabımı Sil
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}