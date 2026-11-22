(() => {
  'use strict';

  const card = window.OatEvidence;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  })[char]);
  const source = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;

  function entry() {
    return `<button class="evidence-entry" data-page="evidence">
      <span class="evidence-entry-mark" aria-hidden="true">β</span>
      <span><strong>食品文献证据卡</strong><small>燕麦 β-葡聚糖 · 人体研究和标签解读</small></span>
      <span class="evidence-entry-arrow" aria-hidden="true">→</span>
    </button>`;
  }

  function labelLink(name, ingredients) {
    const text = `${name ?? ''} ${ingredients ?? ''}`;
    if (!/燕麦|\b(?:oats?|oatmeal)\b/i.test(text)) return '';
    return `<aside class="evidence-label-link"><p>包装文字提到燕麦。可查看 β-葡聚糖的人体研究和读标签方法。</p>
      <button class="text-button" data-page="evidence">看燕麦证据卡 →</button></aside>`;
  }

  function studyCard(study) {
    return `<article class="evidence-study">
      <header><p class="evidence-design">${esc(study.design)}</p><h3>${esc(study.topic)}</h3></header>
      <p class="evidence-value"><strong>${esc(study.value)}</strong><span>${esc(study.unit)}</span></p>
      <p>${esc(study.result)}</p>
      <p class="evidence-context">${esc(study.context)}</p>
      <details><summary>研究条件与适用范围</summary><p>${esc(study.intervention)}</p><p>${esc(study.limit)}</p></details>
      <footer><p>${esc(study.authors)} · ${study.year} · <cite>${esc(study.journal)}</cite></p>${source(study.url,'查看论文')}<small>DOI ${esc(study.doi)}</small></footer>
    </article>`;
  }

  function renderPage({standalone = false} = {}) {
    return `<article class="food-evidence" aria-labelledby="evidence-title">
      <header class="evidence-hero">
        <div><p class="evidence-kicker">一口看文献 · ${esc(card.food)}</p>
          <h1 id="evidence-title">${esc(card.component)}</h1>
          <p class="evidence-intro">${esc(card.description)}</p>
          <p class="evidence-structure-link">${source(card.structureSource,'成分结构来源')}</p>
        </div>
        <div class="evidence-grain" aria-hidden="true"><span>β</span><i></i><b></b></div>
      </header>
      <section class="evidence-section" aria-labelledby="evidence-studies">
        <div class="evidence-heading"><h2 id="evidence-studies">人体研究发现</h2>${standalone ? '' : '<button class="text-button" data-page="home">返回首页</button>'}</div>
        <div class="evidence-grid">${card.studies.map(studyCard).join('')}</div>
      </section>
      <section class="evidence-application evidence-section" aria-labelledby="evidence-mechanisms">
        <h2 id="evidence-mechanisms">可能怎样起作用</h2>
        ${card.mechanisms.map(item => `<p><strong>${esc(item.title)}。</strong>${esc(item.text)} ${source(item.url,'机制研究')}</p>`).join('')}
      </section>
      <section class="evidence-application evidence-section" aria-labelledby="evidence-label">
        <h2 id="evidence-label">买燕麦食品时，怎么看标签</h2>
        <p>配料表里的「燕麦」或「燕麦粉」说明它用到了燕麦原料。营养成分表上的「膳食纤维」通常是总量。要核对这一份有多少 β-葡聚糖，需要产品单独披露其含量或提供检测数据。</p>
        <p>例如，某款燕麦片若明确标注每 100 g 含 4 g β-葡聚糖，吃 30 g 可换算为 1.2 g。这个数字用于演示标签换算。人体研究的结果还取决于试验用量、吃法和食品形态。</p>
      </section>
      <details class="evidence-method">
        <summary>查看本卡的检索与归纳过程</summary>
        <p>检索日期 <time datetime="${esc(card.search.date)}">${esc(card.search.date)}</time>。 ${esc(card.search.sources)}</p>
        <ul>${card.search.queries.map(query => `<li><code>${esc(query)}</code></li>`).join('')}</ul>
        <p>${esc(card.search.scope)}</p>
      </details>
    </article>`;
  }

  window.FoodEvidence = {entry, labelLink, renderPage};
  const preview = document.querySelector('[data-food-evidence-preview]');
  if (preview) preview.innerHTML = renderPage({standalone:true});
})();
