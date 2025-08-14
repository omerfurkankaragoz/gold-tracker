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
        <div className="bg-gray-200/50 dark:bg-apple-dark-bg p-2 rounded-lg">
            {theme === 'light' ? <Sun className="text-apple-light-text-secondary" /> : <Moon className="text-apple-dark-text-secondary" />}
        </div>
        <span className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">
          {theme === 'light' ? 'Açık Tema' : 'Koyu Tema'}
        </span>
      </div>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-apple-blue' : 'bg-gray-200'
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
        <Loader className="animate-spin text-apple-blue" />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = user?.is_anonymous ? 'Misafir Kullanıcı' : (profile?.full_name || user?.email || '');

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
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-apple-dark-card flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-apple-light-text-secondary dark:text-apple-dark-text-secondary" />
          </div>
        )}
        <h1 className={`w-full break-words text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary ${!displayName && 'h-9'}`}>
          {displayName}
        </h1>
        {user && !user.is_anonymous && profile?.full_name && (
            <p className="w-full break-words text-apple-light-text-secondary dark:text-apple-dark-text-secondary mt-1">
              {user.email}
            </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary px-2">Ayarlar</h2>
        <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl">
          <ThemeSwitch />
        </div>
      </div>
      
      <div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center p-4 text-apple-red font-semibold bg-apple-light-card dark:bg-apple-dark-card hover:bg-red-50 dark:hover:bg-apple-red/10 transition-colors rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}