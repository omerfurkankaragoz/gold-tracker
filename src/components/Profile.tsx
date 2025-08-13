import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, User, Loader, Moon, Sun } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from '../context/ThemeContext';

type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
};

// Tema Değiştirme Butonu (Switch) Component'i
function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            {theme === 'light' ? <Sun className="text-yellow-500" /> : <Moon className="text-yellow-400" />}
        </div>
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {theme === 'light' ? 'Açık Tema' : 'Koyu Tema'}
        </span>
      </div>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Ana Profile Component'i
export function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Sadece misafir değilse profil bilgisini (avatar vb. için) çekmeye çalış
        if (!user.is_anonymous) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', user.id)
              .single();
            if (error && error.code !== 'PGRST116') {
              console.error("Profil bilgisi çekilirken hata:", error);
            } else {
              setProfile(profileData);
            }
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

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  
  // ======================= GÜNCELLENEN BÖLÜM =======================
  // is_anonymous true ise "Misafir Kullanıcı", değilse veritabanındaki adı veya boş string'i göster.
  // Bu, "hiçbir şey yazmasın" isteğini karşılar.
  const displayName = user?.is_anonymous ? 'Misafir Kullanıcı' : (profile?.full_name || '');
  // ====================================================================

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center px-4">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profil Resmi"
            className="w-24 h-24 rounded-full object-cover mb-4 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        
        {/* Eğer displayName boşsa, başlık alanı için bir minimum yükseklik vererek kaymayı önle */}
        <h1 className={`w-full break-words text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 ${!displayName && 'h-9'}`}>
          {displayName}
        </h1>
        
        {/* E-posta, misafir olmayan tüm kullanıcılar için her zaman gösterilir */}
        {!user?.is_anonymous && (
            <p className="w-full break-words text-gray-500 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Ayarlar</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <ThemeSwitch />
        </div>
      </div>
      
      <div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center p-4 text-red-600 dark:text-red-500 font-semibold bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}