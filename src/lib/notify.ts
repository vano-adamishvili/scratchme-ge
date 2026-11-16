// ახალი შეკვეთის შეტყობინება Telegram-ში.
// 1) Telegram-ში @BotFather → /newbot → მიიღე token
// 2) მისწერე შენს ბოტს რამე, მერე გახსენი https://api.telegram.org/bot<TOKEN>/getUpdates → chat.id
// 3) Cloudflare-ში დაამატე TELEGRAM_BOT_TOKEN და TELEGRAM_CHAT_ID

export interface NotifyEnv { TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string }

export async function notifyTelegram(env: NotifyEnv, text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log('[scratchme] Telegram not configured. Message:\n' + text);
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
  if (!res.ok) console.error('[scratchme] Telegram error', res.status, await res.text());
  return res.ok;
}

/** ფაილების (დიზაინების) გაგზავნა Telegram-ში, ორიგინალი ხარისხით (document) */
