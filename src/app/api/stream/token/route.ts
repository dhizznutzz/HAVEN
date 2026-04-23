import { StreamChat } from 'stream-chat';
import { createClient } from '@supabase/supabase-js';

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!
);

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const authHeader = req.headers.get('authorization');
  const jwt = authHeader?.replace('Bearer ', '');

  let userId: string;
  let userName: string;

  if (jwt) {
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    if (error || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;
    userName = user.email?.split('@')[0] ?? 'User';
  } else {
    // Anonymous session
    const { userId: anonId } = await req.json().catch(() => ({}));
    if (!anonId) return Response.json({ error: 'userId required for anonymous session' }, { status: 400 });
    userId = `anon_${anonId}`;
    userName = 'Anonymous';
  }

  await serverClient.upsertUser({ id: userId, name: userName, role: 'user' });
  const token = serverClient.createToken(userId);

  return Response.json({ token, userId, userName });
}
