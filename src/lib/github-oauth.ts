// GitHub-ით შესვლა ადმინ პანელისთვის (Sveltia/Decap CMS OAuth პროტოკოლი).
// Cloudflare-ში საჭიროა: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
export interface OAuthEnv { GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string }

export const STATE_COOKIE = 'cms_oauth_state';

/** პატარა HTML გვერდი, რომელიც შედეგს ადმინ პანელს გადასცემს და ფანჯარას ხურავს */
export function handoffPage(status: 'success' | 'error', payload: Record<string, string>, origin: string) {
  const message = `authorization:github:${status}:${JSON.stringify({ provider: 'github', ...payload })}`;
  const js = JSON.stringify(message).replace(/</g, '\\u003c');
  const target = JSON.stringify(origin).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="ka"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>შესვლა…</title></head>
<body style="font-family:system-ui;padding:24px">${status === 'success' ? 'შესვლა წარმატებულია, ფანჯარა დაიხურება…' : 'შესვლა ვერ მოხერხდა. დახურე ეს ფანჯარა და სცადე თავიდან.'}
<script>
(function () {
  var msg = ${js}, target = ${target};
  if (!window.opener) return;
  window.addEventListener('message', function (e) {
    if (e.origin !== target || e.data !== 'authorizing:github') return;
    window.opener.postMessage(msg, target);
    setTimeout(function () { window.close(); }, 400);
  });
  window.opener.postMessage('authorizing:github', target);
})();
</script></body></html>`;
  return new Response(html, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

export function readCookie(header: string | null, name: string) {
  return (header ?? '').split(/;\s*/).map((c) => c.split('=')).find(([k]) => k === name)?.[1];
}
