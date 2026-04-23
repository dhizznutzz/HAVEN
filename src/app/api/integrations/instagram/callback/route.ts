import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForToken, getInstagramUser } from '@/lib/behaviour/instagram';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/guardian?error=cancelled`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/login`);
  }

  let accessToken: string;
  let expiresIn: number;
  let igUser: { id: string; username: string };

  try {
    ({ accessToken, expiresIn } = await exchangeCodeForToken(code));
    igUser = await getInstagramUser(accessToken);
  } catch (err: any) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/guardian?error=ig_auth_failed`);
  }

  await supabase.from('instagram_integrations').upsert(
    {
      user_id: user.id,
      instagram_user_id: igUser.id,
      instagram_username: igUser.username,
      access_token: accessToken,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      is_active: true,
      consent_given_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  // Trigger initial post sync in the background
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/integrations/instagram/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  }).catch(() => {});

  return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/guardian?connected=instagram`);
}
