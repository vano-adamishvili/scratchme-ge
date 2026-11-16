import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/env';
import { notifyTelegram } from '../../lib/notify';
import { computeTotals, type RawLine } from '../../lib/pricing';
import { SETTINGS } from '../../data/catalog';

export const prerender = false;

const clean = (v: unknown, max = 300) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'არასწორი მოთხოვნა' }, 400); }
  if (body.website) return json({ ok: true, ref: 'SCR-0000' }); // spam-ის ხაფანგი

  const c = body.customer ?? {};
  const customer = { name: clean(c.name, 120), phone: clean(c.phone, 40), city: clean(c.city, 80), address: clean(c.address, 300), notes: clean(c.notes, 1000) };
  if (customer.name.length < 2) return json({ error: 'ჩაწერე სახელი და გვარი' }, 400);
  if (!/^[+\d\s()-]{9,20}$/.test(customer.phone)) return json({ error: 'ჩაწერე სწორი ტელეფონის ნომერი' }, 400);
  if (customer.address.length < 4) return json({ error: 'ჩაწერე მიწოდების მისამართი' }, 400);
  const bank = SETTINGS.banks.find((b) => b.id === body.bank) ?? SETTINGS.banks[0];

  const lines: RawLine[] = Array.isArray(body.lines) ? body.lines : [];
  const t = computeTotals(lines);
  if (!t.ok) return json({ error: t.lines.find((l) => l.error)?.error ?? 'კალათა ცარიელია', totals: t }, 400);

  const ref = 'SCR-' + Math.floor(1000 + Math.random() * 9000) + Date.now().toString(36).slice(-2).toUpperCase();
  const msg = [
    `🧾 ახალი შეკვეთა ${ref}`,
    '',
    ...t.lines.map((l) => l.type === 'bundle' ? `📦 ${l.title} — ${l.total.toFixed(2)} ₾\n${l.parts!.map((p) => '   • ' + p).join('\n')}` : `• ${l.title} × ${l.qty} — ${l.total.toFixed(2)} ₾`),
    '',
    `მიტანა: ${t.shipping ? t.shipping.toFixed(2) + ' ₾' : 'უფასო'}`,
    `სულ: ${t.total.toFixed(2)} ₾`,
    `გადახდა: გადარიცხვა — ${bank.name}`,
    '',
    `👤 ${customer.name}`,
    `📞 ${customer.phone}`,
    `📍 ${customer.city ? customer.city + ', ' : ''}${customer.address}`,
    customer.notes ? `📝 ${customer.notes}` : '',
  ].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');

  // თუ შეკვეთა Telegram-ში ვერ მივიდა (ერთი განმეორებითი ცდის შემდეგაც), მყიდველს ვეუბნებით — ჩუმად არ იკარგება
  const env = getEnv(locals);
  const sent = (await notifyTelegram(env, msg)) || (await new Promise((r) => setTimeout(r, 700)), await notifyTelegram(env, msg));
  if (!sent) {
    console.error('[order] not delivered to Telegram', ref, '\n' + msg);
    return json({ error: `შეკვეთა ვერ გაიგზავნა. სცადე თავიდან ან დაგვირეკე: ${SETTINGS.phone}` }, 502);
  }
  return json({ ok: true, ref, total: t.total, bank, delivered: true });
};
