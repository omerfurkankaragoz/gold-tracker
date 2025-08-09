import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

// Sahte (mock) kullanıcı nesnesi
const mockUser: User = {
  // HATA BURADAYDI: ID'yi geçerli bir UUID formatıyla değiştirdik.
  id: '00000000-0000-0000-0000-000000000000', 
  app_metadata: { provider: 'email' },
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('Sign up disabled:', email, password);
    return { data: { user: mockUser, session: null }, error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Sign in disabled:', email, password);
    return { data: { user: mockUser, session: null }, error: null };
  };

  const signOut = async () => {
    console.log('Sign out disabled.');
    return { error: null };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}