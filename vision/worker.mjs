import { init, classifySamples } from './recognize.mjs?v=public-assets-1';

self.addEventListener('message', async ({data:{samples, warm}}) => {
  if (warm) { await init().catch(() => {}); return; }
  try {
    self.postMessage({stage:'loading'});
    await init();
    self.postMessage({stage:'analyzing'});
    self.postMessage({dishes:await classifySamples(samples)});
  } catch {
    self.postMessage({error:true});
  }
});
