// Keep releases network-first. Photos, reports and model files are not cached here.
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>这一口</title><main style="padding:8vw;font-family:system-ui"><h1>这一口</h1><p>暂时无法连接。联网后可重新打开饮食助手。</p><a href="./">重新打开</a></main></html>',
    {status:503, headers:{'Content-Type':'text/html; charset=utf-8'}}
  )));
});
