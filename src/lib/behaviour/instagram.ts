import axios from 'axios';

const GRAPH_BASE = 'https://graph.instagram.com';
const FB_GRAPH = 'https://graph.facebook.com/v19.0';

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  // Short-lived token
  const shortRes = await axios.post(`${FB_GRAPH}/oauth/access_token`, null, {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code,
    },
  });

  // Exchange for long-lived token (~60 days)
  const longRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: shortRes.data.access_token,
    },
  });

  return {
    accessToken: longRes.data.access_token,
    expiresIn: longRes.data.expires_in as number,
  };
}

export async function getInstagramUser(accessToken: string): Promise<{
  id: string;
  username: string;
}> {
  const res = await axios.get(`${GRAPH_BASE}/me`, {
    params: { fields: 'id,username', access_token: accessToken },
  });
  return { id: res.data.id, username: res.data.username };
}

export async function fetchRecentPosts(
  igUserId: string,
  accessToken: string,
  limit = 20
): Promise<Array<{ id: string; caption?: string; timestamp: string }>> {
  const res = await axios.get(`${GRAPH_BASE}/${igUserId}/media`, {
    params: {
      fields: 'id,caption,timestamp',
      limit,
      access_token: accessToken,
    },
  });
  return res.data?.data ?? [];
}

export function buildOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: 'instagram_basic',
    response_type: 'code',
    state: 'haven_instagram_connect',
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
}
