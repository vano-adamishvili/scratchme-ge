# scratchme.ge

გადასაფხეკი პოსტერების მაღაზია — Astro + Cloudflare Workers (იგივე სისტემა, რაც sixseven.ge).

- პროდუქტები: `src/data/products/*.json` · პარამეტრები: `src/data/settings.json` · ბლოგი: `src/data/blog/*.md`
- ადმინ პანელი: `/admin` (GitHub-ით შესვლა)
- შეკვეთები და საკონტაქტო ფორმა: Telegram-ში

## Cloudflare-ის ცვლადები
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — შეკვეთების შეტყობინებები
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — ადმინში შესვლა (GitHub OAuth App, callback: `https://scratchme.ge/api/callback`)

ლოკალურად: `npm install && npm run dev`
