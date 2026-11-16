import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/env';
import { STATE_COOKIE, handoffPage, readCookie } from '../../lib/github-oauth';

export const prerender = false;

// GitHub აბრუნებს აქ → კოდს ვცვლით ტოკენზე → ვაწვდით ადმინ პანელს
export const GET: APIRoute = async ({ url, request, locals }) => {
  const env = getEnv(locals);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = readCookie(request.headers.get('cookie'), STATE_COOKIE);
  if (!code || !state || !expected || state !== expected) {
    return handoffPage('error', { error: 'შესვლის სესია ვადაგასულია. სცადე თავიდან.' }, url.origin);
  }
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'sixseven-admin' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });
    const data = (await res.json()) as { access_token?: string; error_description?: string };
    if (!data.access_token) throw new Error(data.error_description || 'no token');
    return handoffPage('success', { token: data.access_token }, url.origin);
  } catch (e) {
    console.error('[oauth]', e);
    const why = e instanceof Error ? e.message : String(e);
    return handoffPage('error', { error: `GitHub-მა შესვლა არ დაადასტურა (${why}). შეამოწმე Client ID და Client secret Cloudflare-ში.` }, url.origin);
  }
};
