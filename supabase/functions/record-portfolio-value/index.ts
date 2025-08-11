// Konum: supabase/functions/delete-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ÖNEMLİ: Bu fonksiyonun çalışması için Supabase projenizde
// Project Settings -> Database -> "Enable trusted database user credentials" ayarını aktif etmelisiniz.

Deno.serve(async (req) => {
  // Supabase istemcisini, kullanıcının kimlik bilgileriyle başlat
  const userSupabaseClient = createClient(
    Deno.env.get('VITE_SUPABASE_URL')!,
    Deno.env.get('VITE_SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // Kullanıcı bilgilerini al
  const { data: { user } } = await userSupabaseClient.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Kullanıcı bulunamadı' }), { status: 401 });
  }

  // Yönetici (admin) haklarına sahip yeni bir Supabase istemcisi oluştur.
  // Bu, RLS (Row Level Security) kurallarını atlayarak silme işlemi yapmamızı sağlar.
  // Supabase projenizin ayarlarından 'service_role' anahtarını alıp environment variable olarak eklemelisiniz.
  const adminSupabaseClient = createClient(
    Deno.env.get('VITE_SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Kullanıcıya ait tüm verileri sil
    await adminSupabaseClient.from('investments').delete().eq('user_id', user.id)
    await adminSupabaseClient.from('portfolio_history').delete().eq('user_id', user.id)

    // Son olarak, kullanıcının kendisini Auth sisteminden sil
    const { error: deleteUserError } = await adminSupabaseClient.auth.admin.deleteUser(user.id)
    if (deleteUserError) throw deleteUserError

    return new Response(JSON.stringify({ message: 'Kullanıcı başarıyla silindi' }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})