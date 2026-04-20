'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (data?.username) {
        router.push(`/profile/${data.username}`);
      } else {
        router.push('/feed');
      }
    };
    redirect();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
