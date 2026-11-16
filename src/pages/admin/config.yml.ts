import type { APIRoute } from 'astro';
import config from '../../cms/config.yml?raw';

export const prerender = false;

// ადმინ პანელის კონფიგურაცია. base_url = ის დომენი, საიდანაც პანელი გაიხსნა,
// რომ „Sign In with GitHub“ ამავე საიტის /api/auth-ზე წავიდეს.
export const GET: APIRoute = ({ url }) => {
  const body = config.replace(/^backend:\n/m, `backend:\n  base_url: ${url.origin}\n`);
  return new Response(body, {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
