import { buildOAuthUrl } from '@/lib/behaviour/instagram';

export async function GET() {
  const authUrl = buildOAuthUrl();
  return Response.redirect(authUrl);
}
