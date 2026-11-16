import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/env';
import { notifyTelegram } from '../../lib/notify';

export const prerender = false;
const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ request, locals }) => {
  const f = await request.formData().catch(() => null);
  if (!f || f.get('website')) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  const name = clean(f.get('name'), 120), contact = clean(f.get('contact'), 200), message = clean(f.get('message'), 4000);
  if (name.length < 2 || contact.length < 5 || message.length < 3)
    return new Response(JSON.stringify({ error: 'შეავსე ყველა ველი' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const ok = await notifyTelegram(getEnv(locals), `✉️ ახალი შეტყობინება საიტიდან\n\n👤 ${name}\n📞 ${contact}\n\n${message}`);
  return new Response(JSON.stringify(ok ? { ok: true } : { error: 'შეტყობინება ვერ გაიგზავნა, დაგვირეკე' }), { status: ok ? 200 : 502, headers: { 'Content-Type': 'application/json' } });
};
