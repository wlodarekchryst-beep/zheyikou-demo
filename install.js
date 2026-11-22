(() => {
  let offer;
  const standalone = matchMedia('(display-mode: standalone)');
  const update = () => {
    document.documentElement.classList.toggle('installed', standalone.matches || navigator.standalone === true);
  };
  update();
  standalone.addEventListener?.('change', update);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    offer = event;
  });
  window.addEventListener('appinstalled', () => {
    offer = null;
    document.documentElement.classList.add('installed');
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  document.addEventListener('click', async event => {
    if (!event.target.closest('[data-install]')) return;
    if (offer) {
      const prompt = offer;
      offer = null;
      try { await prompt.prompt(); await prompt.userChoice; return; } catch {}
    }
    const dialog = document.createElement('dialog');
    dialog.className = 'crop-dialog';
    dialog.setAttribute('aria-labelledby','install-heading');
    const ua = navigator.userAgent;
    const help = /MicroMessenger/i.test(ua) ? '请从微信右上角菜单选择在浏览器打开，再添加到手机桌面。'
      : /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? '用 Safari 打开这一口，点共享，选择「添加到主屏幕」。如果看到「作为网页 App 打开」，请打开后点「添加」。'
      : /Android/i.test(ua) ? '用 Chrome 打开这一口，点右上角菜单，选择「添加到主屏幕」，再点「安装」。'
      : '在 Chrome 或 Edge 的地址栏或菜单中选择安装此网站。也可以把这个网址发到手机，用手机浏览器添加到主屏幕。';
    dialog.innerHTML = '<h2 id="install-heading">安装这一口</h2><p></p><form method="dialog"><button class="button primary">知道了</button></form>';
    dialog.querySelector('p').textContent = help;
    document.body.append(dialog);
    dialog.addEventListener('close', () => dialog.remove(), {once:true});
    dialog.showModal();
  });
})();
