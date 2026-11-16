import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/env';
import { STATE_COOKIE, handoffPage } from '../../lib/github-oauth';

export const prerender = false;

// ადმინ პანელის „Sign In with GitHub“ → GitHub-ის ავტორიზაციის გვერდი
export const GET: APIRoute = ({ url, locals }) => {
  const env = getEnv(locals);
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return handoffPage('error', { error: 'GitHub შესვლა ჯერ არ არის გამართული (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)' }, url.origin);
  }
  const state = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('');
  const scope = (url.searchParams.get('scope') || 'repo').replace(/[^a-z:,_ ]/gi, '');
  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  gh.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  gh.searchParams.set('scope', scope);
  gh.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.href,
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/api; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
};
