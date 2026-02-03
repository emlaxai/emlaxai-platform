import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Account() {
  const supabase = createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  return (
    <section className="mb-32 bg-black min-h-screen">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Hesabım
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Kullanıcı hesap yönetimi
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
          {/* Kullanıcı Bilgileri */}
          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Profil Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400">Email</label>
                <p className="text-white text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Hesap Durumu</label>
                <p className="text-green-400 text-lg">Aktif</p>
              </div>
            </div>
          </div>

          {/* Abonelik Bilgisi */}
          <div className="border-b border-zinc-800 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Abonelik</h2>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-zinc-300 text-center">
                Abonelik sistemi yakında aktif olacak
              </p>
              <p className="text-zinc-500 text-sm text-center mt-2">
                İyzico entegrasyonu hazırlanıyor
              </p>
            </div>
          </div>

          {/* Çıkış Yap */}
          <div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
