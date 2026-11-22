(() => {
  'use strict';

  const N = window.Nutrition;
  const P = window.Packaging;
  const I = window.DietInsights;
  const F = window.FavoriteFoods;
  const M = window.MealMascot;
  const E = window.FoodEvidence;
  const root = document.getElementById('app');
  const icons = {
    logo: '<path d="M12 21c-4.5 0-8-3.2-8-7.4 0-3.5 2.5-6 5.5-6 1.1 0 2 .4 2.5 1 .5-.6 1.4-1 2.5-1 3 0 5.5 2.5 5.5 6C20 17.8 16.5 21 12 21Z"/><path d="M12 8.2C11.9 5 13.6 3 17 3c0 3-2 5-5 5.2Z"/>',
    home: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.3"/>',
    camera: '<path d="M15 5H9L7 8H4a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 4 19h16a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 20 8h-3z"/><circle cx="12" cy="13" r="3.2"/>',
    label: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7m-7 4h4"/>',
    profile: '<circle cx="12" cy="8" r="3.3"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>',
    log: '<path d="M7 4H5a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 5 21h14a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 19 4h-2"/><rect x="7" y="2.5" width="10" height="4" rx="1.2"/><path d="M8 11h8m-8 4h8"/>',
    leaf: '<path d="M20.5 4c-6 0-11.5 2-13 6.2a5.2 5.2 0 0 0 6.6 6.6c4.2-1.5 6.4-6.9 6.4-12.8Z"/><path d="M4 20 15.5 8.5"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
    bowl: '<path d="M3 12h18a9 9 0 0 1-18 0Zm4 9h10M8 8c-1.5-1.5 1.5-2.5 0-4m4 4c-1.5-1.5 1.5-2.5 0-4m4 4c-1.5-1.5 1.5-2.5 0-4"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    flame: '<path d="M12 2c1 5-5 7.5-5 12a5 5 0 1 0 10 0c0-2.5-1-4.5-2-5-1 3-2 3-2 3 1-4-1-10-1-10Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    voice: '<path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
    calendar: '<rect x="4" y="6" width="16" height="15" rx="2"/><path d="M8 3v6m8-6v6M4 11h16m-11 5 2 2 4-4"/>',
  };
  const icon = (key, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || ''}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(`mealwise:${key}`)) ?? fallback; } catch { return fallback; } };
  const persist = (key, value) => { try { localStorage.setItem(`mealwise:${key}`, JSON.stringify(value)); return true; } catch { return false; } };
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {month:'long', day:'numeric', weekday:'long'});
  const timeLabel = new Intl.DateTimeFormat('zh-CN', {hour:'2-digit', minute:'2-digit'});
  const numberLabel = new Intl.NumberFormat('zh-CN', {maximumFractionDigits:1});
  const format = value => value == null ? '—' : numberLabel.format(value);
  const purposes = {
    weight:{label:'体重与体型管理', description:'减脂、维持体重或增重，了解实际吃了多少，方便调整份量。'},
    sport:{label:'健身与运动', description:'支持增肌、训练表现或运动后恢复，关注能量、蛋白质和碳水。'},
    checkup:{label:'体检指标与慢病管理', description:'把报告或医生给出的饮食要求用到日常选餐，关注血压、血糖或血脂相关的指标。'},
    avoid:{label:'过敏与忌口', description:'核对需要避开的配料，留意包装上的「可能含有」和共线加工声明。'},
    balance:{label:'日常均衡与健康习惯', description:'回顾吃得是否多样、搭配是否合理，改善食堂、外卖和零食的搭配。'},
  };
  const weightPurposes = ['减脂','维持体重','增重'];
  const trainingPurposes = ['增肌','训练表现','运动后恢复'];
  const selectedPurposes = values => Object.keys(purposes).filter(key => Array.isArray(values) && values.includes(key));
  const pages = [
    ['home', 'home', '首页'], ['scan', 'camera', '拍照分析'], ['plan', 'calendar', '个性食谱'], ['profile', 'profile', '我的档案'], ['log', 'log', '饮食记录'],
  ];
  const pageFromHash = () => {
    const page = location.hash.slice(1);
    return (page === 'evidence' && E) || pages.some(([id]) => id === page) ? page : 'home';
  };
  const blankFood = () => ({id:'', name:'', grams:''});
  const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const emptyCapture = () => ({file:null, url:'', raw:'', status:'', busy:false});
  const emptyLabel = () => ({inputs:{...N.blankLabel,nrv:{}}, portion:{mode:'direct', share:'', count:'', eaten:''}, edited:new Set(), active:'ingredients', ingredients:emptyCapture(), table:emptyCapture(), columns:[], column:'', demo:false});
  const savedProfile = load('profile', {});
  const legacyFocus = load('ingredientFocus', '');
  const ingredientFocus = typeof savedProfile.ingredientFocus === 'string' ? savedProfile.ingredientFocus
    : typeof legacyFocus === 'string' ? legacyFocus : '';
  const profile = {...N.blankProfile, ...savedProfile, ingredientFocus, purposes:selectedPurposes(savedProfile.purposes)};
  if (profile.goal === 'energy' && !Object.hasOwn(savedProfile, 'dailyEnergy')) {
    profile.dailyEnergy = profile.target;
    profile.target = '';
  }
  const state = {
    page: pageFromHash(), mode:'meal', profile, history:load('history', []), mealPhotos:load('mealPhotos', []),
    meal:{rows:[blankFood()], seasonings:[], file:null, url:'', demo:false, status:'', busy:false, detected:false, note:null},
    label:emptyLabel(),
    draft:null, report:{file:null, status:'', busy:false, raw:'', demo:false}, logWindow:'today',
    favorites:F.loadPlans(load('favoriteFoods', [])), planDraft:null, planRecord:null,
  };
  let toastTimer;

  function notify(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3600);
  }

  function changePage(page) {
    if (page === 'profile' && !state.draft) state.draft = {...state.profile};
    state.page = page;
    if (location.hash !== `#${page}`) history.pushState(null, '', `#${page}`);
    render();
    prepareScan();
    window.scrollTo(0, 0);
    document.getElementById('main-content').focus({preventScroll:true});
  }

  function todayRecords() {
    return state.history.filter(record => new Date(record.time).toDateString() === new Date().toDateString());
  }

  function recentRecords() {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - 6);
    return state.history.filter(record => record.time >= from.getTime());
  }

  function sectionLinks(links) {
    return `<nav class="section-links" aria-label="本页快捷定位">${links.map(([id,label]) => `<button type="button" data-section="${id}">${label}</button>`).join('')}</nav>`;
  }

  function navigation(active) {
    return `<nav class="navigation" aria-label="主要导航">${pages.map(([id, visual, name]) => `<button class="nav-item ${id === active ? 'active' : ''}" data-page="${id}" ${id === active ? 'aria-current="page"' : ''}>${icon(visual,20)}<span>${name}</span></button>`).join('')}</nav>`;
  }

  function render() {
    const active = state.page;
    const content = active === 'evidence' ? E.renderPage()
      : active === 'scan' ? scanPage() : active === 'profile' ? profilePage() : active === 'log' ? logPage()
      : active === 'plan' ? favoriteFoodsPage() : homePage();
    root.innerHTML = `<div class="layout" data-view="${active}"><aside class="sidebar"><button class="brand" data-page="home"><span class="brand-mark"><img src="assets/mouse-cutout-brand.webp" alt="" width="47" height="47"></span><span><strong>这一口</strong><small>拍照饮食助手</small></span></button>${navigation(active)}<div class="sidebar-bottom"><div class="privacy-label">${icon('lock',16)}<span>档案保存在本机</span></div></div></aside>
      <main id="main-content" tabindex="-1" class="main"><div class="mobile-top"><button class="brand" data-page="home"><span class="brand-mark"><img src="assets/mouse-cutout-brand.webp" alt="" width="47" height="47"></span><strong>这一口</strong></button></div><div class="content">${content}</div></main></div>`;
  }

  function homePage() {
    const records = todayRecords();
    const live = records.filter(record => !record.demo);
    const goal = N.goals[state.profile.goal] ?? N.goals.balance;
    const focus = state.profile.purposes.map(key => {
      if (key === 'weight' && weightPurposes.includes(state.profile.weightPurpose)) return state.profile.weightPurpose;
      if (key === 'sport' && trainingPurposes.includes(state.profile.trainingPurpose)) return state.profile.trainingPurpose;
      return purposes[key].label;
    }).join('、');
    const energyValues = live.map(record => record.totals.energy).filter(value => value != null);
    const energy = energyValues.length ? N.round(energyValues.reduce((sum, value) => sum + value, 0)) : null;
    return `<header class="page-head home-head"><div><h1>今天吃什么？</h1><p>拍一张照片，了解这一口的营养。</p></div><div class="date-chip">${icon('sun',18)} ${dateLabel.format(new Date())}</div></header>
      <section class="hero" aria-labelledby="hero-title"><div class="hero-text"><h2 id="hero-title">这一餐，<br>吃进去多少？</h2><p>拍食堂餐盘或食品包装，<br class="desktop-break">按你实际吃的份量算一算。</p><div class="hero-actions"><button class="button primary" data-action="start-meal">${icon('camera',20)} 拍照分析</button><button class="button ghost" data-action="demo-meal">试用示例</button><button class="text-button" data-install>安装这一口</button></div></div><div class="hero-visual">${mascotPortrait(currentMascotPose())}</div></section>
      ${balanceCard(records)}
      <section class="quick-section" aria-labelledby="quick-title"><h2 id="quick-title" class="section-title">你想分析什么？</h2><div class="quick-grid">
        ${quick('start-meal','camera','餐盘照片','识别菜品，按食用份量估算营养。','green')}
        ${quick('start-label','label','食品包装','读取营养标签和配料，换算实际摄入。','peach')}
        ${quick('go-profile','profile','体检 / 体测报告','导入报告，核对指标并设置饮食关注点。','lilac')}
      </div></section>
      ${E?.entry() ?? ''}
      ${mascotCard()}
      <div class="home-bottom"><section class="card overview"><div class="section-head"><h2 class="section-title">今天的饮食</h2><button class="text-button" data-page="log">查看记录</button></div><div class="overview-body"><span class="icon-tile green">${icon('bowl',23)}</span><div><strong>${records.length ? `已记录 ${records.length} 次` : '还没有饮食记录'}</strong><p>${live.length ? `已记录能量 ${format(energy)} kcal` : records.length ? '已有示例记录，可继续拍摄你的餐食。' : '分析后保存，日常份量和频率可以一起查看。'}</p></div></div></section>
      <section class="card overview"><div class="section-head"><h2 class="section-title">我的饮食关注</h2><button class="text-button" data-page="profile">修改</button></div><div class="overview-body"><span class="icon-tile lilac">${icon('leaf',23)}</span><div><strong>${esc(focus || goal.label)}</strong><p>${goal.description}</p></div></div></section></div>`;
  }

  let balanceFood = 'rice';
  function balanceCard(records) {
    const targets = I.targets(state.profile);
    if (state.profile.goal === 'protein' && Number(state.profile.target) > 0) targets.protein = Number(state.profile.target);
    const configured = Object.entries(targets).filter(([,value]) => value > 0);
    const settings = '<button class="text-button" data-action="balance-settings">设置每日参考量</button>';
    const remaining = {};
    const metrics = configured.map(([key,limit]) => {
      const {label,unit} = N.nutrients[key];
      const {total,missing} = I.tally(records,key);
      const used = total ?? 0;
      const left = N.round(limit - used);
      if (!missing) remaining[key] = Math.max(0,left);
      const figure = missing ? '待补全' : left < 0 ? `已超出 ${format(-left)} ${unit}` : `${format(left)} ${unit}`;
      return `<div class="balance-metric"><span>${label}余额</span><strong>${figure}</strong><small>已记录 ${missing && total == null ? '未知' : format(used)} / 参考 ${format(limit)} ${unit}${missing ? ` · ${missing} 条缺此项` : ''}</small></div>`;
    }).join('');
    const key = ['energy','carbs','protein'].find(key => remaining[key] != null);
    let example = '';
    if (key) {
      const foods = N.foods.filter(food => food[key] > 0);
      const food = foods.find(item => item.id === balanceFood) || foods[0];
      const {label,unit} = N.nutrients[key];
      const grams = Math.round(remaining[key] * 100 / food[key]);
      example = `<div class="balance-example"><label class="field">把${label}余额换算成食物<select id="balance-food">${foods.map(item => `<option value="${item.id}" ${food.id === item.id ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label><p aria-live="polite">${format(remaining[key])} ${unit} ${label}约相当于 <strong>${format(grams)} 克${esc(food.name)}</strong>。这是单项等值换算，一餐可搭配多种食物。</p></div>`;
    }
    return `<section class="card form-card balance-card" id="daily-balance"><div class="section-head"><h2>今日摄入余额</h2>${settings}</div>
      ${metrics ? `<div class="balance-grid">${metrics}</div><p class="micro">按你设置的参考量减去今天已记录的摄入计算。${records.some(record => !record.demo) ? '' : '今天还没有真实饮食记录。'}</p>${example}`
        : '<p>先在「我的档案」填写每日参考量。保存餐食后，这里会显示今天还剩多少，并可换算成熟米饭等食物的份量。</p>'}</section>`;
  }

  function quick(action, visual, title, body, color) {
    return `<button class="quick-card" data-action="${action}"><span class="icon-tile ${color}">${icon(visual,23)}</span><span><strong>${title}</strong><small>${body}</small></span></button>`;
  }

  function currentMascotPose(now = new Date()) {
    return M.poseFor(now, I.tally(todayRecords(), 'energy'), I.targets(state.profile).energy,
      todayRecords(), state.mealPhotos, state.favorites);
  }

  function mascotPortrait(pose) {
    const [name, message] = M.poses[pose];
    return `<figure class="mascot-portrait" data-mascot-view data-pose="${pose}">
      <img src="assets/mouse-cutout-${pose}.webp" alt="" width="480" height="480">
      <figcaption><strong>${name}</strong><small>${message}</small></figcaption>
    </figure>`;
  }

  function refreshMascot(now) {
    const views = root.querySelectorAll('[data-mascot-view]');
    if (!views.length) return;
    const pose = currentMascotPose(now);
    for (const view of views) if (view.dataset.pose !== pose) view.outerHTML = mascotPortrait(pose);
  }

  function mascotCard() {
    const records = todayRecords();
    const goals = I.targets(state.profile);
    const energy = I.tally(records, 'energy');
    const carbs = I.tally(records, 'carbs');
    const reached = goals.energy != null && energy.total != null && energy.total >= goals.energy;
    const message = mascotMessage(energy, carbs, goals, reached);
    const progress = (key, metric) => {
      const {label, unit} = N.nutrients[key];
      const goal = goals[key];
      const value = metric.total == null ? '暂无记录' : `${format(metric.total)} ${unit}`;
      const meter = goal == null ? '' : `<progress aria-label="${label}今日记录进度" max="${goal}" value="${Math.min(metric.total ?? 0, goal)}"></progress>`;
      return `<div class="mouse-meter"><div><span>${label}</span><strong>${value}${goal == null ? '' : ` <small>/ ${format(goal)} ${unit}</small>`}</strong></div>${meter}
        ${metric.missing ? `<small>另有 ${metric.missing} 条记录缺少此项</small>` : ''}</div>`;
    };
    return `<section class="card mouse-card ${reached ? 'mouse-goal-reached' : ''}" aria-labelledby="mouse-title">
      <div class="mouse-scene">${mascotPortrait(currentMascotPose())}</div>
      <div class="mouse-content"><div class="section-head"><h2 id="mouse-title">小鼠的今日进度</h2><button class="text-button" data-page="profile">设置目标</button></div>
        ${progress('energy', energy)}${progress('carbs', carbs)}
        <div class="mouse-speech"><p id="mouse-message" aria-live="polite">${esc(message)}</p><button class="button outline mouse-voice" data-action="speak-mouse" aria-label="播报今日饮食进度">${icon('voice',17)} 播报</button></div>
        ${favoritePreview()}
      </div></section>`;
  }

  function mascotMessage(energy, carbs, goals, reached) {
    if (reached) return '今天已记录的能量达到了你设定的目标。先核对一下今天的记录吧。';
    if (carbs.known && goals.carbs != null && carbs.total < goals.carbs) {
      return `今天已记录碳水化合物 ${format(carbs.total)} 克，距你设定的参考量还有 ${format(goals.carbs - carbs.total)} 克。`;
    }
    if (carbs.known && goals.carbs != null) return '今天已记录的碳水化合物达到了你设定的参考量。';
    if (energy.known) return `今天已记录 ${format(energy.total)} 千卡。${goals.energy == null ? '在档案中填写每日能量目标，就能看到进度。' : '小鼠会随着记录更新。'}`;
    return '记录第一餐后，我就能帮你回顾今天的摄入。';
  }

  function speakMouse() {
    const message = document.getElementById('mouse-message')?.textContent;
    if (!message || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      notify('当前浏览器暂不能播报，可以查看文字提示。');
      return;
    }
    const voices = speechSynthesis.getVoices().filter(voice => voice.localService && /^zh(?:[-_]|$)/i.test(voice.lang));
    const voice = voices.find(voice => /^zh[-_]cn$/i.test(voice.lang)) ?? voices[0];
    if (!voice) {
      notify('当前设备暂无可用的本地中文语音，可以查看文字提示。');
      return;
    }
    const line = new SpeechSynthesisUtterance(message);
    line.lang = 'zh-CN';
    line.voice = voice;
    line.rate = 0.96;
    line.onerror = event => {
      if (!['interrupted','canceled'].includes(event.error)) notify('暂未播报成功，请检查设备的中文语音。');
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(line);
  }

  function scanPage() {
    const meal = state.mode === 'meal';
    return `<header class="page-head"><div><h1>拍照分析</h1><p>选一种照片，再确认你实际吃的份量。</p></div><button class="button outline" data-action="${meal ? 'demo-meal' : 'demo-label'}">试用${meal ? '餐盘' : '包装'}示例</button></header>
      <div class="segmented" aria-label="分析模式"><button data-action="start-meal" aria-pressed="${meal}">${icon('camera',19)} 餐盘照片</button><button data-action="start-label" aria-pressed="${!meal}">${icon('label',19)} 食品包装</button></div>
      ${sectionLinks([['scan-photo','选照片'],['scan-check',meal ? '核对食材' : '核对标签'],['scan-result','看营养结果']])}
      <div class="workspace-grid ${!meal && state.label.active === 'ingredients' ? 'ingredients-layout' : ''}"><div class="stack">${meal ? mealEditor() : labelEditor()}</div><div id="result-panel" class="stack">${resultPanel()}</div></div>`;
  }

  function uploadArea(type, description, accept, imageUrl = '', buttonLabel = '选择照片') {
    return `<div class="upload-area ${imageUrl ? 'has-image' : ''}">${imageUrl ? `<img src="${esc(imageUrl)}" alt="待分析的照片">` : ''}<div class="upload-controls"><span class="icon-tile green">${icon('upload',22)}</span><strong>${description}</strong><div class="upload-buttons"><label class="button outline file-button">${icon('upload',16)} ${buttonLabel}<input type="file" data-file="${type}" accept="${accept}"></label><label class="button outline file-button camera-file">${icon('camera',17)} 拍照<input type="file" data-file="${type}" accept="image/*" capture="environment"></label></div></div></div>`;
  }

  const massUnits = {克:1, 两:50, 斤:500};
  function mealEditor() {
    const meal = state.meal;
    return `<section class="card form-card"><div class="section-head"><h2 id="scan-photo" tabindex="-1">餐盘照片</h2>${meal.demo ? '<span class="pill">示例</span>' : ''}</div>
      ${uploadArea('meal', meal.file ? esc(meal.file.name) : '适用于食堂、餐厅和外卖', 'image/*', meal.demo ? 'assets/campus-meal.png' : meal.url)}
      <div class="action-row"><button class="button primary" data-action="recognize-meal" ${!meal.file || meal.busy ? 'disabled' : ''}>${meal.busy ? '正在识别…' : meal.detected ? '仔细复扫' : '识别菜品'}</button></div><p class="micro">选好照片后自动识别。首次加载模型建议用 Wi-Fi。照片在本机处理。</p>${status(meal.status)}
      </section><section class="card form-card"><div class="section-head"><h2 id="scan-check" tabindex="-1">核对食材和份量</h2><button class="text-button" data-action="add-food">${icon('plus',17)} 添加食材</button></div><div class="food-table">
      ${meal.rows.map((row, i) => `<div class="food-item"><div class="food-row"><label class="field">食材名称<input list="meal-food-names" maxlength="60" value="${esc(row.name)}" placeholder="例如番茄、鸡胸肉" aria-label="第 ${i + 1} 项食材" data-food-name="${i}"></label><label class="field">吃了多少<input type="number" min="0" max="${1500 / massUnits[row.unit || '克']}" step="any" value="${row.grams === '' ? '' : Number((row.grams / massUnits[row.unit || '克']).toFixed(8))}" placeholder="数量" aria-label="第 ${i + 1} 道菜食用量" data-grams="${i}"></label><button class="icon-button remove-button" data-remove-food="${i}" aria-label="移除第 ${i + 1} 道菜">×</button></div><label class="field">份量单位<select data-mass-unit="${i}" aria-label="第 ${i + 1} 道菜份量单位">${Object.keys(massUnits).map(unit => `<option ${unit === (row.unit || '克') ? 'selected' : ''}>${unit}</option>`).join('')}</select></label>${varietyChoices(row,i)}${row.photoGrams ? `<p class="micro">照片粗估约 ${row.photoGrams} 克。请按实际吃下的量调整。</p>` : ''}</div>`).join('')}</div>
      <datalist id="meal-food-names">${N.foods.map(food => `<option value="${esc(food.name)}"></option>`).join('')}</datalist><p class="micro">1 两 = 50 克，1 斤 = 500 克。混合菜可分别填写其中的食材。</p></section>${seasoningEditor()}`;
  }

  const varieties = {
    '叶菜':['菠菜','小白菜','大白菜','卷心菜'],
    '鱼':['大西洋鳕鱼','鲤鱼','罗非鱼','海鲈鱼','大西洋三文鱼'],
    '肉类（种类待核对）':['鸡肉','猪肉','牛肉'],
  };
  function varietyButtons(row,index) {
    const choices = varieties[row.name.trim()];
    return choices ? `<p class="micro">照片只辨认到大类，请按实际品种改名或点选。</p><div class="action-row">${choices.map(name => `<button class="text-button" data-variety="${name}" data-row="${index}">${name}</button>`).join('')}</div>` : '';
  }
  function varietyChoices(row,index) {
    return `<div data-varieties="${index}">${varietyButtons(row,index)}</div>`;
  }

  function seasoningEditor() {
    return `<section class="card form-card"><div class="section-head"><h2>调料与酱汁 <small>选填</small></h2><button class="text-button" data-action="add-seasoning">${icon('plus',17)} 添加调料</button></div>
      <p class="micro">只填自己实际吃下的量。品种和用量都填好才计入；蘸料剩在碟里的部分可扣除。</p>
      ${state.meal.seasonings.map((row,i) => {
        const food = N.seasonings.find(item => item.id === row.id);
        const custom = row.id === 'custom';
        const attr = key => `data-season-index="${i}" data-season-field="${key}"`;
        const choices = [['','请选择'],...N.seasonings.map(item => [item.id,item.name]),['custom','其他调料 · 按包装标签填写']];
        return `<div class="food-item seasoning-item"><div class="section-head"><label class="field">调料品种<select ${attr('id')}>${choices.map(([id,name]) => `<option value="${id}" ${id === row.id ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
          <button class="icon-button" data-remove-seasoning="${i}" aria-label="移除第 ${i+1} 项调料">×</button></div>
          ${custom ? `<label class="field">调料名称<input ${attr('name')} value="${esc(row.name)}" maxlength="60" placeholder="如 自家品牌花生酱"></label>` : ''}
          <div class="fields two"><label class="field">实际用量<input ${attr('amount')} type="number" min="0" step="any" value="${esc(row.amount)}" placeholder="例如 5"></label>
          <label class="field">单位<select ${attr('unit')}><option value="g">克</option>${custom || food?.density ? `<option value="mL" ${row.unit === 'mL' ? 'selected' : ''}>毫升</option>` : ''}</select></label></div>
          ${custom ? `<p class="micro">按包装每 100 ${row.unit} 填写。缺少的项目将显示为未知。</p><label class="field">标签能量单位<select ${attr('energyUnit')}><option value="kJ">千焦（kJ）</option><option value="kcal" ${row.energyUnit === 'kcal' ? 'selected' : ''}>千卡（kcal）</option></select></label><div class="fields two">${N.mealNutrients.map(key => `<label class="field">${N.nutrients[key].label}（${key === 'energy' ? row.energyUnit : N.nutrients[key].unit}）<input ${attr(key)} type="number" min="0" step="any" value="${esc(row.values[key] ?? '')}" placeholder="选填"></label>`).join('')}</div>` : ''}
          </div>`;
      }).join('')}</section>`;
  }

  function labelEditor() {
    const {active, demo} = state.label;
    const isIngredients = active === 'ingredients';
    const {url, busy, raw, file, status:message} = state.label[active];
    const heading = isIngredients ? '配料表' : '营养成分表';
    return `<section class="card form-card"><div class="section-head"><h2 id="scan-photo" tabindex="-1">包装照片</h2>${demo ? '<span class="pill">示例</span>' : ''}<button class="text-button" data-action="reset-label">分析新食品</button></div>
      <div class="segmented label-tabs" aria-label="包装拍照类型"><button data-action="label-ingredients" aria-pressed="${isIngredients}">${icon('camera',17)} 拍配料表</button><button data-action="label-table" aria-pressed="${!isIngredients}">${icon('camera',17)} 拍营养成分表</button></div>
      ${uploadArea(active, file ? esc(file.name) : isIngredients ? '拍清配料、产品信息和过敏原声明' : '拍全表头、单位和每一行数值', 'image/*', url, `选择${heading}照片`)}
      <p class="micro">把包装摊平、避开反光，靠近拍清${heading}。整袋小字看不清时，可以框选标签复扫。</p>
      <div class="action-row"><button class="button primary" data-action="recognize-label" ${!file || busy ? 'disabled' : ''}>${busy ? '正在识别…' : `识别${heading}`}</button>${url ? '<button class="button outline" data-action="crop-label">框选标签</button>' : ''}</div><div id="label-photo-status">${status(message)}</div>
      <details><summary>查看或修改识别原文</summary><label class="field">核对${heading}原文<textarea id="label-raw" rows="4" placeholder="${isIngredients ? '例如：配料表：小麦粉、食用盐' : '例如：项目 每100克\n钠 600 mg'}">${esc(raw)}</textarea></label><button class="button outline" data-action="parse-label">从文字提取</button></details></section>
      ${isIngredients ? ingredientEditor() : nutritionTableEditor()}`;
  }

  function ingredientEditor() {
    const {inputs} = state.label;
    return `<section class="card form-card ingredient-editor"><div class="section-head"><h2 id="scan-check" tabindex="-1">核对产品信息</h2></div><div class="fields two">${[['name','食品名称'],['brand','品牌'],['net','净含量']].map(([key,label]) => `<label class="field">${label}<input data-label-field="${key}" maxlength="60" value="${esc(inputs[key])}" placeholder="按包装填写"></label>`).join('')}</div>
      <label class="field">配料表<textarea data-label-field="ingredients" rows="3" placeholder="核对识别出的配料，也可直接编辑">${esc(inputs.ingredients)}</textarea></label>
      <label class="field">包装上的过敏原声明<textarea data-label-field="allergenNote" rows="2" placeholder="例如 可能含有微量花生">${esc(inputs.allergenNote)}</textarea></label>
      <label class="field">我的关注配料<input id="ingredient-focus" value="${esc(state.profile.ingredientFocus)}" maxlength="160" placeholder="如 椰子油、乳糖，用逗号分隔"></label></section>`;
  }

  function nutritionTableEditor() {
    const {inputs, columns, column} = state.label;
    const units = ['100ml','servingMl'].includes(inputs.basisMode) ? 'mL' : 'g';
    return `<section class="card form-card"><div class="section-head"><h2 id="scan-check" tabindex="-1">核对营养成分表</h2></div>
      ${columns.length > 1 ? `<label class="field">照片有多列，请选择要录入的列<select id="nutrition-source-column"><option value="">选择原表列</option>${columns.map(({title}, index) => `<option value="${index}" ${String(index) === column ? 'selected' : ''}>第 ${index + 1} 列 · ${title}</option>`).join('')}</select></label>` : ''}
      <div class="fields two"><label class="field">标示基准<select data-label-field="basisMode">${Object.entries({'':'请选择','100g':'每 100 g','100ml':'每 100 mL',serving:'每份（g）',servingMl:'每份（mL）'}).map(([value,label]) => `<option value="${value}" ${inputs.basisMode === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      </div>
      ${inputs.basisMode.startsWith('serving') ? `<label class="field">标签上每份的食用量（${units}）${labelNumber('serving','每份食用量',5000)}</label>` : ''}
      <table class="label-values"><thead><tr><th scope="col">营养项目</th><th scope="col">含量</th><th scope="col">NRV %</th></tr></thead><tbody>${Object.entries(N.nutrients).map(([key,{label,unit}]) => `<tr><th scope="row">${label}${key === 'energy' ? '' : `<small>${unit}</small>`}</th><td>${labelNumber(key,label,key === 'energy' ? 5000 : key === 'sodium' ? 100000 : 1000)}${key === 'energy' ? `<select class="label-energy-unit" aria-label="能量单位" data-label-field="energyUnit"><option ${inputs.energyUnit === 'kJ' ? 'selected' : ''}>kJ</option><option ${inputs.energyUnit === 'kcal' ? 'selected' : ''}>kcal</option></select>` : ''}</td><td><input type="number" aria-label="${label} NRV 百分比" min="0" max="10000" step="any" data-nrv="${key}" value="${esc(inputs.nrv[key])}" placeholder="—"></td></tr>`).join('')}</tbody></table>
      <p class="micro">营养项目含量和 NRV% 分列录入。看不清的数值留空，核对原图后可修改。</p></section>${portionEditor(units)}`;
  }

  function portionEditor(unit) {
    const {portion, inputs} = state.label;
    const field = (key, title, placeholder, numeric = false) => `<label class="field">${title}<input data-portion="${key}" value="${esc(portion[key])}" maxlength="18" placeholder="${placeholder}" ${numeric ? 'inputmode="decimal"' : ''}></label>`;
    return `<section class="card form-card"><div class="section-head"><h2>这次吃了多少？</h2></div>
      <label class="field">整包净含量<input data-label-field="net" maxlength="60" value="${esc(inputs.net)}" placeholder="如 120 g、250 mL 或 20 g × 6 袋"></label>
      <label class="field">按什么记录<select data-portion="mode">${Object.entries({direct:'直接填克数或毫升',fraction:'单包或大包装 · 按整包比例',small:'大包装内有独立小包 · 按小包数'}).map(([key,title]) => `<option value="${key}" ${portion.mode === key ? 'selected' : ''}>${title}</option>`).join('')}</select></label>
      ${portion.mode === 'direct' ? `<label class="field">实际食用量（${unit}）${labelNumber('amount','实际食用量',5000)}</label>`
        : portion.mode === 'small' ? `<div class="fields two">${field('count','整包内同规格小包数','如 6',true)}${field('eaten','本次吃了几小包','如 2 或 0.5',true)}</div><p class="micro">按相同净含量的小包换算。净含量已写「20 g × 6 袋」时可省略总包数。</p>`
        : `${field('share','吃了整包的几分之几','如 1/3 或 0.5')}<div class="action-row">${[['1/4','四分之一包'],['1/2','半包'],['1','整包']].map(([share,title]) => `<button class="text-button" data-share="${share}">${title}</button>`).join('')}</div>`}
      <p id="portion-hint" class="micro" aria-live="polite">${esc(P.packageIntake(inputs,portion).hint)}</p>
      ${portion.mode !== 'direct' ? '<button class="text-button" data-action="direct-portion">吃了多份外包装？直接填总食用量</button>' : ''}</section>`;
  }

  function labelNumber(key, label, max) {
    return `<input type="number" min="0" max="${max}" step="any" aria-label="${label}" data-label-field="${key}" value="${esc(state.label.inputs[key])}" placeholder="—">`;
  }

  function status(message) { return message ? `<p class="inline-status" role="status">${esc(message)}</p>` : ''; }

  function scanResult() {
    const label = state.label.inputs;
    if (state.mode === 'meal') {
      const rows = state.meal.rows;
      const calculated = rows.filter(row => row.id && Number(row.grams) > 0);
      const names = calculated.map(row => row.name.trim());
      const added = state.meal.seasonings.map(N.seasoningEntry).filter(Boolean);
      const items = [...calculated.map(row => ({kind:'food',name:row.name,amount:Number(row.grams),unit:'g'})),
        ...added.map(({name,amount,unit}) => ({kind:'seasoning',name,amount,unit}))];
      const amount = N.round(items.reduce((sum,item) => sum + (item.unit === 'g' ? item.amount : 0), 0));
      const volume = N.round(items.reduce((sum,item) => sum + (item.unit === 'mL' ? item.amount : 0), 0));
      return {totals:N.calculateMeal(rows,added), name:state.meal.demo ? '示例食堂餐' : '餐盘 · ' + names.slice(0, 2).join('、'), frequencyKey:names.join(' / '), demo:state.meal.demo, amount, unit:'g', items, portionNote:volume ? `另计调料 ${format(volume)} mL` : ''};
    }
    const intake = P.packageIntake(label, state.label.portion);
    return {totals:N.calculateLabel({...label, amount:intake.amount}), rates:N.labelRates(label), name:label.name.trim() || '包装食品', frequencyKey:label.name.trim(), demo:state.label.demo, amount:intake.amount, unit:intake.unit, portionNote:intake.note};
  }

  function snackPlanCard(snack, title) {
    if (snack.demo) return '';
    const {pattern, checks, missing, missingGoals, available, reportPriorities, goal, hasRecords} = I.snackPlan(state.profile, todayRecords(), recentRecords(), snack);
    const cueList = reportPriorities.map(({value, label, key}) => {
      const nutrient = N.nutrients[key];
      const rate = snack.rates?.[key];
      const labelText = rate != null ? `这款每 100 ${snack.unit} 含${nutrient.label} ${format(N.round(rate * 100))} ${nutrient.unit}。`
        : `这款标签的${nutrient.label}还未确认。`;
      const reference = goal[key] == null ? '如已有医师或营养师给出的参考量，可在档案中填写。' : '';
      return `<li><strong>${label} ${format(value)} mmol/L（报告标高）</strong><span>建议优先核对${nutrient.label}。${labelText}${reference}</span></li>`;
    }).join('');
    const timeText = pattern.slot ? `近 7 天在不同日期多次于${pattern.slot}记录这款零食。`
      : '目前还看不出固定时段。下次计划加餐时，可以先核对当天已经吃了什么。';
    const amountText = pattern.portion == null ? `近 7 天同名记录 ${pattern.count} 次，继续记录后可看到常吃份量。`
      : `近 7 天同名记录 ${pattern.count} 次，一次通常约 ${format(N.round(pattern.portion))} ${snack.unit}（中位数）。`;
    let portionText = hasRecords ? '填写已确定的每日参考量和标签数据后，可按当天的记录估算。' : '添加今天的饮食记录后，可按记录和已设参考量估算份量。';
    if (missingGoals.length) {
      portionText = `报告提示需要优先关注${missingGoals.map(key => N.nutrients[key].label).join('、')}。有已确定的参考量后，可以一起纳入估算。`;
    } else if (missing.length) {
      portionText = `${missing.map(key => N.nutrients[key].label).join('、')}在标签或今天的记录里有缺项，先补齐再估算份量。`;
    } else if (available === 0) {
      portionText = `按今天已记录的量，${N.nutrients[checks[0].key].label}已达到你设置的参考量，或剩余量不足以估算。`;
    } else if (available != null) {
      const tight = N.nutrients[checks[0].key];
      portionText = `按已记录的量、已设参考量和份量习惯估算，参考份量约 ${format(available)} ${snack.unit}。${tight.label}距离参考量还差 ${format(N.round(checks[0].left))} ${tight.unit}。`;
    }
    return `<section class="card form-card snack-card"><div class="section-head"><h2>${esc(title)}</h2><button class="text-button" data-page="profile">查看档案</button></div>
      <p class="snack-name">${esc(snack.name)}</p>
      <dl class="snack-plan"><div><dt>下次什么时候核对</dt><dd>${esc(timeText)}</dd></div>
        <div><dt>下次份量怎么定</dt><dd>${esc(amountText)}</dd><dd>${esc(portionText)}</dd></div></dl>
      ${cueList ? `<ul class="snack-cues">${cueList}</ul><a class="snack-source" href="https://www.nhc.gov.cn/sps/c100088/202301/f01895a06c5349ef999f25da833c166d.shtml" target="_blank" rel="noopener noreferrer">国家卫健委食养指南</a>` : ''}
      ${snack.frequencyKey && F.canPlan(snack) ? `<div class="action-row"><button class="button outline" ${snack.id ? `data-plan-source="${esc(snack.id)}"` : 'data-action="plan-from-label"'}>${state.favorites.some(plan => F.key(plan) === F.key(snack)) ? '查看爱吃计划' : '加入爱吃清单'}</button></div>` : ''}
      <p class="micro">时段来自你的记录。份量按当日已记录的摄入估算，补记正餐或加餐后会重新计算。</p>
    </section>`;
  }

  // Favorite-food plans use local calendar dates so that each week's slots repeat in local time.
  const scheduleDays = [1,2,3,4,5,6,0];

  function planCountdown(at, now = Date.now()) {
    if (at <= now) return '已到计划时段';
    const minutes = Math.ceil((at - now) / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor(minutes % 1440 / 60);
    return `距计划 ${days ? `${days} 天 ` : ''}${hours ? `${hours} 小时 ` : ''}${minutes % 60} 分钟`;
  }

  const planTime = slot => `${dateLabel.format(slot.at)} ${timeLabel.format(slot.at)}`;
  const countdown = slot => `<span class="plan-countdown" data-plan-at="${slot.at}">${planCountdown(slot.at)}</span>`;

  function favoritePreview() {
    const upcoming = state.favorites.map(plan => ({plan, slot:F.nextSlot(plan,state.history)}))
      .filter(item => item.slot).sort((a,b) => a.slot.at - b.slot.at)[0];
    if (!upcoming) return '';
    const {plan, slot} = upcoming;
    return `<div class="mouse-plan"><div><strong>下次计划 · ${esc(plan.name)}</strong><p>${planTime(slot)} · ${countdown(slot)}</p></div><button class="text-button" data-page="plan">爱吃清单</button></div>`;
  }

  function favoriteEditor(draft) {
    const unit = draft.unit;
    const selected = draft.editedDays ?? draft.days;
    return `<form class="card form-card" id="favorite-editor">
      <div class="section-head"><h2>${draft.id ? '修改计划' : '安排下一次'}</h2><button class="text-button" type="button" data-action="close-plan-editor">取消</button></div>
      <p class="snack-name">${esc(draft.name)}</p>
      <fieldset class="plan-days"><legend>每周想安排在哪几天</legend><div class="plan-week">${scheduleDays.map(day => `<label><input type="checkbox" name="day" value="${day}" ${selected.includes(day) ? 'checked' : ''}><span>${F.days[day]}</span></label>`).join('')}</div></fieldset>
      <div class="fields two"><label class="field">计划时间<input type="time" name="time" value="${esc(draft.editedTime ?? draft.time)}" required></label>
      <label class="field">每次计划份量（${unit}）<input type="number" name="amount" min="0.1" max="5000" step="any" value="${esc(draft.editedAmount ?? draft.amount)}" required></label></div>
      <p class="micro">到了计划当天，按已记录的摄入重新核算份量。提前吃了也可以照常记录。</p>
      <div class="action-row"><button class="button primary" type="submit">保存计划</button></div></form>`;
  }

  function favoriteCard(plan) {
    const slot = F.nextSlot(plan,state.history);
    const isToday = slot && new Date(slot.at).toDateString() === new Date().toDateString();
    const result = isToday ? F.portion(plan,state.profile,todayRecords()) : null;
    const rate = plan.rates.energy;
    const unit = plan.unit;
    const portion = result?.amount;
    const favoriteId = esc(plan.id);
    return `<section class="card form-card favorite-card">${state.planRecord === plan.id ? `
      <form data-plan-intake="${favoriteId}"><div class="section-head"><h2>记录这次 · ${esc(plan.name)}</h2><button class="text-button" type="button" data-action="close-plan-record">取消</button></div>
        <label class="field">实际吃了多少（${unit}）<input type="number" name="amount" min="0.1" max="5000" step="any" inputmode="decimal" required></label>
        <p class="micro">按保存计划时核对的标签换算。换了规格或口味，可从新的包装分析结果更新计划。</p><div class="action-row"><button class="button primary" type="submit">保存这次记录</button></div></form>` : `
      <div class="section-head"><h2>${esc(plan.name)}</h2><button class="text-button" data-plan-edit="${favoriteId}">改计划</button></div>
      <div class="plan-slot"><span>下次计划</span><strong>${slot ? planTime(slot) : '暂无安排'}</strong>${slot ? countdown(slot) : ''}</div>
      <p class="micro">${scheduleDays.filter(day => plan.days.includes(day)).map(day => F.days[day]).join('、')} · 每次计划 ${format(plan.amount)} ${unit}${N.numeric(rate) ? `（约 ${format(N.round(rate * plan.amount))} kcal）` : ''}</p>
      ${result ? `<div class="plan-portion">${portion != null ? `<strong>按今日记录估算 ${format(portion)} ${unit}${N.numeric(rate) ? ` · 约 ${format(N.round(rate * portion))} kcal` : ''}</strong>` : ''}<p>${esc(result.message)}</p></div>` : '<p class="micro">计划当天会按你的饮食记录和参考量核算份量。</p>'}
      <div class="action-row"><button class="button outline" data-plan-record="${favoriteId}">记录这次</button><button class="text-button danger" data-plan-remove="${favoriteId}">移除计划</button></div>`}
    </section>`;
  }

  function favoriteFoodsPage() {
    const options = F.patterns(state.history).filter(({latest}) => !state.favorites.some(plan => F.key(plan) === F.key(latest))).slice(0,6);
    return `<header class="page-head"><div><h1>个性食谱</h1><p>把喜欢的食物放进自己的每周计划。</p></div><button class="button outline" data-action="start-label">${icon('camera',18)} 扫包装</button></header>
      <div class="workspace-grid"><div class="stack">
        ${state.planDraft ? favoriteEditor(state.planDraft) : ''}
        ${state.favorites.map(favoriteCard).join('')}
        ${state.favorites.length || state.planDraft ? '' : `<section class="card form-card"><div class="empty-result"><span class="icon-tile green">${icon('calendar',24)}</span><strong>爱吃清单还是空的</strong><p>核对零食包装后，点击「加入爱吃清单」，或从近期记录添加。</p></div></section>`}
      </div><div class="stack"><section class="card form-card"><div class="section-head"><h2>从近期记录添加</h2></div>
      <p class="micro">根据近 28 天真实记录。跨至少 3 天记录的同款会优先展示，是否喜欢由你确认。</p>
      ${options.length ? `<div class="favorite-suggestions">${options.map(({latest,pattern,dateCount}) => `<div class="favorite-suggestion"><div><strong>${esc(latest.name)}</strong><p class="micro">记录 ${dateCount} 天 · ${pattern.count} 次${pattern.portion != null ? ` · 常吃约 ${format(N.round(pattern.portion))} ${latest.unit}` : ''}${pattern.slot ? ` · ${esc(pattern.slot)}` : ''}</p></div><button class="button outline" data-plan-source="${esc(latest.id)}">添加</button></div>`).join('')}</div>` : '<p class="micro">核对并保存一款有名称的包装食品，它就可以出现在这里。</p>'}</section></div></div>`;
  }

  function openFavorite(food, updateRates = false) {
    if (!F.canPlan(food)) return;
    const existing = state.favorites.find(plan => F.key(plan) === F.key(food));
    const matched = F.patterns(state.history).find(({latest}) => F.key(latest) === F.key(food));
    state.planDraft = existing ? {...existing, rates:updateRates ? food.rates : existing.rates}
      : {name:food.name, frequencyKey:food.frequencyKey, unit:food.unit, rates:food.rates, amount:Math.max(.1,N.round(matched?.pattern.portion ?? food.amount)), days:[], time:'15:00'};
    state.planRecord = null;
    changePage('plan');
    document.getElementById('favorite-editor')?.scrollIntoView({block:'start'});
  }

  function saveFavorites(updated) {
    if (!persist('favoriteFoods', updated)) { notify('浏览器无法保存爱吃清单，请检查本机存储权限。'); return false; }
    state.favorites = updated;
    return true;
  }

  function submitFavorite(form) {
    const draft = state.planDraft;
    if (!draft) return;
    const data = new FormData(form);
    const time = String(data.get('time'));
    const days = data.getAll('day').map(Number);
    const amount = Number(data.get('amount'));
    if (!days.length) { notify('请至少选择一天。'); form.querySelector('input[name="day"]')?.focus(); return; }
    if (!F.amountValid(amount) || !F.clockPattern.test(time)) { notify('请检查份量和时间。'); return; }
    const today = new Date();
    today.setHours(0,0,0,0);
    const sameSchedule = draft.time === time && JSON.stringify(draft.days) === JSON.stringify(days);
    const {name, frequencyKey, unit, rates} = draft;
    const plan = {name, frequencyKey, unit, rates, id:draft.id || newId(), start:sameSchedule && draft.start != null ? draft.start : +today, days, time, amount};
    const updated = [...F.loadPlans(load('favoriteFoods', state.favorites)).filter(item => item.id !== draft.id && F.key(item) !== F.key(plan)),plan];
    if (!saveFavorites(updated)) return;
    state.planDraft = null;
    render();
    notify('已保存爱吃计划。');
  }

  function missingInputs() {
    const missing = [];
    if (state.mode === 'meal') {
      let hasPortion = false;
      state.meal.rows.forEach((row,i) => {
        if ((!row.id && !row.name.trim() && row.grams === '') || row.grams !== '' && Number(row.grams) === 0) return;
        if (!row.id) missing.push({text:`第 ${i + 1} 项请填写可计算的具体食材${row.name ? `（当前为「${row.name}」）` : '' }，如菠菜、鸡蛋或猪肉。`, field:`[data-food-name="${i}"]`});
        if (!(Number(row.grams) > 0)) missing.push({text:`第 ${i + 1} 道菜请填写实际食用量`, field:`[data-grams="${i}"]`});
        else hasPortion = true;
      });
      if (!missing.length && !hasPortion) missing.push({text:'请至少录入一种吃过的食材，并填写大于零的份量。', field:'[data-food-name="0"]'});
      state.meal.seasonings.forEach((row,i) => {
        if (row.id === 'custom' && row.name.trim() && Number(row.amount) > 0 && !N.seasoningEntry(row)) {
          missing.push({text:`请为「${row.name}」至少填写一项包装营养数值。`,field:`[data-season-index="${i}"][data-season-field=energy]`});
        }
      });
      return missing;
    }
    const {inputs,columns,column,portion} = state.label;
    if (columns.length > 1 && column === '') missing.push({text:'营养表有多列，请先选择要使用的一列。',field:'#nutrition-source-column'});
    else if (!inputs.basisMode) missing.push({text:'请选择包装标示基准，例如每 100 克、每 100 毫升或每份。',field:'[data-label-field=basisMode]'});
    if (inputs.basisMode.startsWith('serving') && !(Number(inputs.serving) > 0)) missing.push({text:'请填写营养标签上每份的重量或容量。',field:'[data-label-field=serving]'});
    if (!Object.keys(N.nutrients).some(key => N.numeric(inputs[key]))) missing.push({text:'请拍营养成分表或至少填写一项含量，例如能量或蛋白质。',field:'[data-label-field=energy]'});
    const intake = P.packageIntake(inputs,portion);
    if (!intake.amount) missing.push({text:intake.hint || '请填写大于零的实际食用量。', field:intake.field});
    return missing;
  }

  const itemSummary = items => items.map(item => `${item.name} ${format(item.amount)} ${item.unit}`).join('、');
  function mealBreakdown(result) {
    const foods = result.items.filter(item => item.kind === 'food');
    const added = result.items.filter(item => item.kind === 'seasoning');
    const skipped = state.meal.seasonings.length - added.length;
    return `<div class="meal-breakdown"><p><strong>已计食材</strong> ${esc(itemSummary(foods))}</p>
      <p><strong>已计调料</strong> ${added.length ? esc(itemSummary(added)) : '无'}${skipped ? `（${skipped} 项未填完整，已跳过）` : ''}</p></div>`;
  }

  function resultPanel() {
    const meal = state.mode === 'meal';
    const result = scanResult();
    const requested = state[state.mode].resultRequested;
    const missing = requested ? missingInputs() : [];
    const totals = requested && !missing.length ? result.totals : null;
    const {name, amount, unit, demo, frequencyKey} = result;
    const goal = N.goals[state.profile.goal] ?? N.goals.balance;
    const priority = {protein:'protein', sodium:'sodium', energy:'energy'}[state.profile.goal];
    const resultKeys = meal ? N.mealNutrients : Object.keys(N.nutrients).filter(key => N.mealNutrients.includes(key) || totals?.[key] != null);
    const [tipTitle, tip] = N.advice(state.profile.goal, state.mode, totals, amount, unit, meal ? state.meal.rows : []);
    const target = priority === 'energy' ? I.targets(state.profile).energy : Number(state.profile.target);
    const contribution = priority && totals?.[priority] != null && target > 0 ? N.round(totals[priority] / target * 100) : null;
    const repeats = frequencyKey ? recentRecords().filter(record => record.kind === state.mode && record.demo === demo && record.frequencyKey === frequencyKey).length : null;
    const review = meal ? '' : ingredientResults();
    const adviceText = meal ? `<label class="field">建议文字，可编辑<textarea id="meal-note" rows="3" maxlength="500">${esc(state.meal.note ?? tip)}</textarea></label>` : `<p>${esc(tip)}</p>`;
    return `${!meal && state.label.active === 'ingredients' ? review : ''}<section class="card form-card result-card"><div class="section-head"><h2 id="scan-result" tabindex="-1">营养结果</h2><button class="button primary" data-action="generate-result">${totals ? '重新生成' : '生成营养结果'}</button></div>
      ${totals ? `<p class="result-name" id="result-feedback" tabindex="-1">${esc(name)} · ${format(amount)} ${unit}${meal && result.portionNote ? ' · ' + esc(result.portionNote) : ''}</p>${meal ? mealBreakdown(result) : ''}<div class="nutrient-grid">${resultKeys.map(key => `<div class="nutrient ${key === priority ? 'priority' : ''}"><span>${N.nutrients[key].label}</span><strong>${format(totals[key])}</strong>${totals[key] != null ? `<small>${N.nutrients[key].unit}</small>` : '<small>未知</small>'}</div>`).join('')}</div>
      <p class="micro">${meal ? '按已填食材和调料的实际用量估算。品牌和烹调做法会影响数值。<a href="https://fdc.nal.usda.gov/download-datasets/" target="_blank" rel="noopener noreferrer">食材数据来源（USDA SR28）</a>' : `已按实际食用量与标签基准换算。${state.label.inputs.energyUnit === 'kJ' ? '能量按 4.184 kJ = 1 kcal 转换。' : ''}`}</p>` : requested ? `<div class="missing-result" tabindex="-1" id="result-feedback"><strong>还需要补充</strong><ul>${missing.map(({text,field}) => `<li><button class="text-button" data-missing-field="${esc(field)}">${esc(text)}</button></li>`).join('')}</ul></div>` : '<p class="micro">核对好食物和份量后，点击生成查看本次摄入。</p>'}</section>
      ${totals ? `<section class="card form-card advice-card"><div class="section-head"><h2>${icon('leaf',19)} 食用建议</h2><span class="pill green">${goal.label}</span></div><strong class="tip-title">${tipTitle}</strong>${adviceText}${contribution != null ? `<p>当前份量约占你填写的每日${N.nutrients[priority].label}参考量的 <strong>${format(contribution)}%</strong>。</p>` : ''}${repeats != null ? `<p class="frequency">${icon('log',16)} 近 7 天同款已记录 ${repeats} 次${demo ? '（示例）' : ''}</p>` : ''}<div class="action-row"><button class="button primary" data-action="save-meal">${icon('check',18)} 记录这${meal ? '一餐' : '次食用'}</button>${meal ? '<button class="text-button" data-action="restore-note">恢复建议文字</button>' : ''}</div></section>` : ''}
      ${!meal && state.label.active === 'table' ? review : ''}
      ${!meal ? E?.labelLink(state.label.inputs.name, state.label.inputs.ingredients) ?? '' : ''}
      ${!meal && totals ? snackPlanCard(result, '下次怎么吃') : ''}`;
  }

  function ingredientResults() {
    const {ingredients, allergenNote, name, brand, net} = state.label.inputs;
    if (!ingredients.trim() && !allergenNote.trim()) return '';
    const review = P.ingredientReview(ingredients, allergenNote, state.profile.ingredientFocus);
    const labels = (items, tone) => `<ul class="ingredient-flags">${items.map(({label,terms}) => `<li class="${tone}"><strong>${esc(label)}</strong><span>${esc(terms.join('、'))}</span></li>`).join('')}</ul>`;
    const present = review.customDeclared.length ? [...review.present,{label:'我的关注',terms:review.customDeclared}] : review.present;
    const trace = review.customTrace.length ? [...review.trace,{label:'我的关注',terms:review.customTrace}] : review.trace;
    const focus = [...review.focus, ...review.custom.map(word => ({label:'我的关注', terms:[word]}))];
    const terms = [...review.present, ...focus].flatMap(item => item.terms);
    return `<section class="card form-card ingredient-review"><div class="section-head"><h2>过敏原与重点配料</h2></div>
      ${[name,brand,net].filter(value => value.trim()).length ? `<p class="product-line">${[name,brand,net].filter(value => value.trim()).map(esc).join(' · ')}</p>` : ''}
      ${present.length ? `<h3>配料或声明中出现</h3>${labels(present,'allergen-present')}` : ''}
      ${trace.length ? `<h3>可能含有或共线加工</h3>${labels(trace,'allergen-trace')}` : ''}
      ${!present.length && !trace.length ? '<p class="micro">这次未读到明确的过敏原词条。</p>' : ''}
      ${focus.length ? `<h3>重点关注的配料</h3>${labels(focus,'focus-tag')}` : ''}
      ${ingredients.trim() ? `<p class="ingredient-evidence"><strong>配料表</strong><br>${highlightTerms(ingredients, terms)}</p>` : ''}
      ${allergenNote.trim() ? `<p class="ingredient-evidence"><strong>包装声明</strong><br>${highlightTerms(allergenNote,[...review.customDeclared,...review.customTrace])}</p>` : ''}
      <p class="micro">过敏提示以完整原包装为准。照片可能漏字，未识别到也不能排除过敏原。</p></section>`;
  }

  function highlightTerms(text, terms) {
    if (!terms.length) return esc(text);
    const choices = [...new Set(terms)].sort((a,b) => b.length - a.length).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return text.split(new RegExp(`(${choices.join('|')})`, 'gi')).map((part,index) => index % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
  }

  function profilePage() {
    state.draft ??= {...state.profile};
    const draft = state.draft;
    const {file, busy, raw} = state.report;
    return `<header class="page-head"><div><h1>我的档案</h1><p>设置饮食目标、关注配料和每日参考量。</p></div><div class="date-chip">${icon('lock',16)} 本机保存</div></header>
      ${sectionLinks([['purpose-title','饮食目的'],['profile-report','导入报告'],['profile-goals','每日参考量']])}
      <section class="card form-card purpose-card" aria-labelledby="purpose-title"><div class="section-head"><h2 id="purpose-title" tabindex="-1">你为什么关注饮食？</h2><button class="button primary" data-action="save-profile">${icon('check',18)} 保存档案</button></div>
      <p class="micro" id="purpose-hint">可选多项，也可以随时调整。</p>
      <div class="purpose-list" role="group" aria-labelledby="purpose-title" aria-describedby="purpose-hint">${Object.entries(purposes).map(([key,option]) => `<label class="goal-choice"><input type="checkbox" data-purpose="${key}" ${draft.purposes.includes(key) ? 'checked' : ''}><span><strong>${option.label}</strong><small>${option.description}</small></span></label>`).join('')}</div>
      <div id="purpose-details">${purposeDetails(draft)}</div></section>
      <div class="workspace-grid profile-grid"><div class="stack"><section class="card form-card" id="profile-report" tabindex="-1"><div class="section-head"><h2>导入报告</h2><button class="text-button" data-action="demo-profile">试用示例报告</button></div>
      ${uploadArea('report', file ? esc(file.name) : '体检单或健身体测单', 'image/*,.pdf,.txt,application/pdf,text/plain', '', '选择图片 / PDF / 文本')}
      <div class="action-row"><button class="button primary" data-action="recognize-report" ${!file || busy ? 'disabled' : ''}>${busy ? '正在读取…' : '读取报告'}</button></div><p class="micro">选择文件后自动读取并预填下方指标。PDF 首版读取前 3 页。请核对提取数值。</p>${status(state.report.status)}
      <details ${raw ? 'open' : ''}><summary>查看或粘贴报告文字</summary><label class="field">原始文字<textarea id="report-raw" rows="4" placeholder="例如：身高 170 cm\n体重 65 kg">${esc(raw)}</textarea></label><button class="button outline" data-action="parse-report">从文字提取</button></details></section>
      <section class="card form-card"><div class="section-head"><h2>确认档案指标</h2>${draft.reportExample ? '<span class="pill">示例</span>' : ''}</div><div class="fields two">${Object.entries(N.fields).map(([key, field]) => `<label class="field">${field.label}（${field.unit}）<input type="number" step="any" min="${field.min}" max="${field.max}" data-profile-field="${key}" value="${esc(draft[key])}" placeholder="选填"></label>`).join('')}</div>
        <fieldset class="report-flags"><legend>对照报告确认标高项</legend>
          <label><input type="checkbox" data-profile-field="ldlHigh" ${draft.ldlHigh ? 'checked' : ''}> 低密度脂蛋白胆固醇标高</label>
          <label><input type="checkbox" data-profile-field="glucoseHigh" ${draft.glucoseHigh ? 'checked' : ''}> 空腹血糖标高</label>
        </fieldset>${draft.reportExample ? '<p class="micro">示例报告供体验。粘贴或导入自己的报告后，才会把标高项用于份量核对。</p>' : ''}<div id="profile-review">${profileReview()}</div></section></div>
      <section class="card form-card goal-card" id="profile-goals" tabindex="-1"><div class="section-head"><h2>分析结果优先关注什么</h2></div><div class="goal-list">${Object.entries(N.goals).map(([key, goal]) => `<label class="goal-choice"><input type="radio" name="goal" value="${key}" ${draft.goal === key ? 'checked' : ''}><span><strong>${goal.label}</strong><small>${goal.description}</small></span></label>`).join('')}</div><div id="target-field">${targetField()}</div>
        <fieldset class="daily-goals"><legend>每日参考量</legend><p class="micro">选填你已确定的目标。小鼠按这些目标显示进度。</p>
          ${[['dailyEnergy','能量','kcal',10000],['dailyCarbs','碳水化合物','g',2000],['dailySaturatedFat','饱和脂肪','g',500]].map(([key,label,unit,max]) =>
            `<label class="field">${label}（${unit}）<input type="number" step="any" min="0.1" max="${max}" data-profile-field="${key}" value="${esc(draft[key])}" placeholder="选填"></label>`).join('')}
        </fieldset><div class="action-row"><button class="button primary" data-action="save-profile">${icon('check',18)} 保存档案</button></div><div class="profile-foot"><button class="text-button danger" data-action="reset-profile">清空本机档案</button></div></section></div>`;
  }

  function purposeDetails(draft) {
    const selected = draft.purposes;
    const choose = (field,title,options) => `<label class="field">${title}<select data-profile-field="${field}"><option value="">请选择（选填）</option>${options.map(value => `<option ${draft[field] === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>`;
    return `
      ${selected.includes('weight') || selected.includes('sport') ? `<div class="fields two">${selected.includes('weight') ? choose('weightPurpose','体重管理目标',weightPurposes) : ''}${selected.includes('sport') ? choose('trainingPurpose','运动饮食目标',trainingPurposes) : ''}</div>` : ''}
      ${selected.includes('avoid') ? `<label class="field">要核对的配料或过敏原<input data-profile-field="ingredientFocus" value="${esc(draft.ingredientFocus)}" maxlength="160" placeholder="如 花生、芝麻、乳糖，用逗号分隔"></label><p class="micro">保存档案后，包装分析会标出配料表和包装声明里匹配的词。请以完整原包装为准。</p>` : ''}
      ${selected.some(key => key === 'weight' || key === 'sport' || key === 'checkup') ? `<div class="purpose-actions">${selected.includes('checkup') ? '<button class="text-button" data-profile-jump="profile-report">导入和核对报告</button>' : ''}<button class="text-button" data-profile-jump="profile-goals">设置关注指标和参考量</button></div>` : ''}
    `;
  }

  function targetField() {
    const nutrient = N.nutrients[state.draft.goal];
    return nutrient && state.draft.goal !== 'energy' ? `<label class="field">每日${nutrient.label}参考量（${nutrient.unit}）<input type="number" step="any" min="1" max="100000" data-profile-field="target" value="${esc(state.draft.target)}" placeholder="选填，填写你已确定的目标"></label>` : '';
  }

  function profileReview() {
    const {height, weight, review} = state.draft;
    const bmi = Number(height) > 0 && Number(weight) > 0 ? Number(weight) / (Number(height) / 100) ** 2 : null;
    return `${bmi != null ? `<p class="micro">按录入的身高与体重计算，BMI 为 <strong>${format(N.round(bmi))}</strong>。</p>` : ''}${review ? '<p class="inline-status">报告文字含标记，请对照原报告确认，并向专业人员咨询指标含义。</p>' : ''}`;
  }

  function logPage() {
    const week = state.logWindow === 'week';
    const records = week ? recentRecords() : todayRecords();
    const actual = records.filter(record => !record.demo);
    const lastSnack = recentRecords().find(record => record.kind === 'label' && !record.demo && record.rates);
    return `<header class="page-head"><div><h1>饮食记录</h1><p>回看吃过什么，以及已经记录的摄入量。</p></div><button class="button primary" data-action="start-meal">${icon('camera',19)} 分析一餐</button></header>
      ${mascotCard()}
      ${lastSnack ? snackPlanCard(lastSnack, '最近保存的零食 · 下次怎么吃') : ''}
      <div class="segmented" aria-label="记录时间"><button data-action="log-today" aria-pressed="${!week}">今天</button><button data-action="log-week" aria-pressed="${week}">近 7 天</button></div><div class="log-totals">${['energy','protein','sodium'].map(key => {const available = actual.filter(record => record.totals[key] != null); const total = available.length ? N.round(available.reduce((sum, record) => sum + record.totals[key], 0)) : null; return `<div class="card log-metric"><span>${N.nutrients[key].label} · 已记录</span><strong>${format(total)} <small>${N.nutrients[key].unit}</small></strong><p class="micro">${available.length} 条有数值的记录</p></div>`;}).join('')}</div>
      <section class="card form-card"><div class="section-head"><h2>${week ? '近 7 天' : '今天'}的记录</h2><span class="pill green">${records.length} 条</span></div>${records.length ? `<div class="record-list">${records.map(record => {const date = new Date(record.time);return `<div class="record"><span class="icon-tile ${record.kind === 'meal' ? 'green' : 'peach'}">${icon(record.kind === 'meal' ? 'bowl' : 'label',22)}</span><div class="record-text"><strong>${esc(record.name)} ${record.demo ? '<span class="pill">示例</span>' : ''}</strong><p>${week ? dateLabel.format(date) + ' ' : ''}${timeLabel.format(date)} · ${format(record.amount)} ${esc(record.unit)}${record.portionNote ? ' · ' + esc(record.portionNote) : ''}</p>${record.items?.length ? `<details><summary>食材和调料明细</summary><p>${esc(itemSummary(record.items))}</p></details>` : ''}${record.note ? `<p class="record-note">${esc(record.note)}</p>` : ''}</div><strong class="record-energy">${format(record.totals.energy)} <small>kcal</small></strong><button class="text-button danger" data-delete-record="${esc(record.id)}">移除</button></div>`;}).join('')}</div>` : '<div class="empty-result"><span class="icon-tile green">' + icon('log',24) + '</span><strong>还没有记录</strong><p>拍照分析后，点击结果下方的记录按钮。</p></div>'}</section>`;
  }

  function updateResults() {
    const target = document.getElementById('result-panel');
    if (target) target.innerHTML = resultPanel();
    const hint = document.getElementById('portion-hint');
    if (hint) hint.textContent = P.packageIntake(state.label.inputs, state.label.portion).hint;
  }

  function updateDraftField(input) {
    if (input.form?.id === 'favorite-editor' && state.planDraft) {
      const data = new FormData(input.form);
      Object.assign(state.planDraft, {editedDays:data.getAll('day').map(Number), editedTime:data.get('time'), editedAmount:data.get('amount')});
      return;
    }
    if (input.dataset.purpose && state.draft) {
      state.draft.purposes = selectedPurposes([...root.querySelectorAll('[data-purpose]:checked')].map(field => field.dataset.purpose));
      document.getElementById('purpose-details').innerHTML = purposeDetails(state.draft);
      return;
    }
    const {labelField, grams, profileField, foodName, nrv} = input.dataset;
    if (input.dataset.seasonField) {
      const key = input.dataset.seasonField;
      const row = state.meal.seasonings[Number(input.dataset.seasonIndex)];
      const value = input.type === 'number' && !input.validity.valid ? '' : input.value;
      if (N.mealNutrients.includes(key)) row.values[key] = value;
      else row[key] = value;
      if (['id','unit','energyUnit'].includes(key)) {
        if (key === 'id' && row.id !== 'custom' && !N.seasonings.find(item => item.id === row.id)?.density) row.unit = 'g';
        render();
      } else updateResults();
      return;
    }
    if (input.dataset.massUnit !== undefined) {
      state.meal.rows[Number(input.dataset.massUnit)].unit = input.value;
      render();
      return;
    }
    if (input.dataset.portion) {
      state.label.portion[input.dataset.portion] = input.value;
      if (input.dataset.portion === 'mode') render();
      else updateResults();
      return;
    }
    if (labelField) {
      state.label.edited.add(labelField);
      if (labelField === 'basisMode' && ['100ml','servingMl'].includes(input.value) !== ['100ml','servingMl'].includes(state.label.inputs.basisMode)) {
        state.label.inputs.amount = '';
        state.label.inputs.serving = '';
      }
      state.label.inputs[labelField] = input.type === 'number' && !input.validity.valid ? '' : input.value;
      if (labelField === 'basisMode') { render(); return; }
      updateResults();
    }
    if (grams !== undefined) {
      const row = state.meal.rows[Number(grams)];
      row.grams = input.value && input.validity.valid ? Number(input.value) * massUnits[row.unit || '克'] : '';
      updateResults();
    }
    if (foodName !== undefined) {
      const row = state.meal.rows[Number(foodName)];
      row.name = input.value;
      row.id = N.matchFood(row.name)?.id || '';
      const choices = root.querySelector(`[data-varieties="${foodName}"]`);
      if (choices) choices.innerHTML = varietyButtons(row,Number(foodName));
      updateResults();
    }
    if (nrv) { state.label.edited.add('nrv:' + nrv); state.label.inputs.nrv[nrv] = input.validity.valid ? input.value : ''; }
    if (profileField) {
      state.draft[profileField] = input.type === 'checkbox' ? input.checked : input.value;
      document.getElementById('profile-review').innerHTML = profileReview();
    }
    if (input.name === 'goal' && state.draft.goal !== input.value) {
      state.draft.goal = input.value;
      state.draft.target = '';
      document.getElementById('target-field').innerHTML = targetField();
    }
    if (input.id === 'report-raw') state.report.raw = input.value;
    if (input.id === 'label-raw') state.label[state.label.active].raw = input.value;
    if (input.id === 'meal-note') state.meal.note = input.value;
    if (input.id === 'ingredient-focus') {
      if (state.draft?.ingredientFocus === state.profile.ingredientFocus) state.draft.ingredientFocus = input.value;
      state.profile = {...state.profile, ingredientFocus:input.value};
      if (!persist('profile', state.profile)) notify('浏览器暂时无法保存关注配料。');
      updateResults();
    }
  }

  root.addEventListener('input', event => {
    const field = event.target;
    updateDraftField(field);
    if (event.inputType === 'insertFromPaste' && ['report-raw','label-raw'].includes(field.id)) {
      extractText(field.id === 'report-raw' ? 'report' : state.label.active, field.value);
      render();
    }
  });
  root.addEventListener('change', event => {
    const input = event.target;
    if (input.id === 'balance-food') {
      balanceFood = input.value;
      document.getElementById('daily-balance').outerHTML = balanceCard(todayRecords());
      document.getElementById('balance-food').focus({preventScroll:true});
      return;
    }
    if (input.dataset.file) selectFile(input.dataset.file, input.files?.[0]);
    if (input.id === 'nutrition-source-column') {
      selectNutritionColumn(input.value);
      render();
      document.getElementById('nutrition-source-column')?.focus();
    }
  });

  const isPackagingPhoto = type => type === 'ingredients' || type === 'table';
  const capture = type => isPackagingPhoto(type) ? state.label[type] : state[type];
  function resetLabels(active = 'ingredients') {
    for (const type of ['ingredients','table']) {
      const target = state.label[type];
      target.job?.abort();
      if (target.url) URL.revokeObjectURL(target.url);
    }
    state.label = {...emptyLabel(),active};
  }

  function selectFile(type, file) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { notify('请选择小于 15 MB 的文件。'); return; }
    const image = file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic|avif)$/i.test(file.name);
    if (!image && (type !== 'report' || !/\.(pdf|txt)$/i.test(file.name))) { notify('文件格式不受支持。'); return; }
    if (isPackagingPhoto(type) && state.label.demo) resetLabels(type);
    const target = capture(type);
    if (target.url?.startsWith('blob:')) URL.revokeObjectURL(target.url);
    if (isPackagingPhoto(type)) {
      target.job?.abort();
      Object.assign(target, {job:null, frame:null});
    }
    if (type === 'meal') {
      target.rows = [blankFood()];
      target.seasonings = [];
      target.resultRequested = false;
      target.detected = false;
      target.note = null;
      target.photoAt = Date.now();
    }
    Object.assign(target, {file, url: image && type !== 'report' ? URL.createObjectURL(file) : '', demo:false, status:'', busy:false, raw:''});
    render();
    if (location.protocol !== 'file:') {
      if (type === 'meal') void recognizeMeal();
      if (isPackagingPhoto(type) || type === 'report') void runOcr(type);
    }
  }

  function showDemo(mode) {
    const section = state[mode];
    if (mode === 'meal') {
      if (section.url?.startsWith('blob:')) URL.revokeObjectURL(section.url);
      Object.assign(section, {resultRequested:false, file:null, url:'', demo:true, status:'', busy:false, detected:false, note:null});
      section.seasonings = [];
      section.rows = N.sampleMeal.map(row => ({...row, name:N.foods.find(food => food.id === row.id).name}));
    } else {
      resetLabels('table');
      state.label.inputs = {...N.sampleLabel,nrv:{}};
      state.label.demo = true;
    }
    state.mode = mode;
    changePage('scan');
  }

  function storeRecord(result) {
    const record = {...result, time:Date.now(), id:newId()};
    const updated = [record, ...load('history',state.history)];
    if (!persist('history', updated)) { notify('浏览器无法保存，请检查本机存储权限。'); return false; }
    state.history = updated;
    return true;
  }

  function saveRecord() {
    const result = scanResult();
    if (!state[state.mode].resultRequested || !result.totals || missingInputs().length) return;
    result.kind = state.mode;
    if (state.mode === 'meal') result.note = state.meal.note?.trim() || '';
    if (!storeRecord(result)) return;
    changePage('log');
    notify(result.demo ? '已保存示例记录。' : '已记录到饮食记录。');
  }

  root.addEventListener('submit', event => {
    const form = event.target;
    if (form.id === 'favorite-editor') {
      event.preventDefault();
      submitFavorite(form);
    }
    if (form.matches('[data-plan-intake]')) {
      event.preventDefault();
      const plan = state.favorites.find(item => item.id === form.dataset.planIntake);
      const amount = Number(new FormData(form).get('amount'));
      if (!plan || !F.amountValid(amount)) { notify('请核对实际食用量。'); return; }
      const {name, frequencyKey, unit, rates} = plan;
      const totals = Object.fromEntries(Object.keys(N.nutrients).map(metric => [
        metric, N.numeric(rates[metric]) ? N.round(Number(rates[metric]) * amount) : null,
      ]));
      if (!storeRecord({kind:'label', name, frequencyKey, unit, rates, totals, amount, demo:false})) return;
      state.planRecord = null;
      render();
      notify('已记入饮食记录，计划已更新。');
    }
  });

  function saveProfile() {
    const invalid = [...root.querySelectorAll('[data-profile-field]')].find(input => !input.validity.valid);
    if (invalid) { invalid.reportValidity(); return; }
    for (const field of ['ldl', 'glucose']) {
      if (!state.draft[`${field}High`] || N.numeric(state.draft[field])) continue;
      notify(`请填写${N.fields[field].label}的报告数值，或取消标高勾选。`);
      root.querySelector(`[data-profile-field="${field}"]`)?.focus();
      return;
    }
    if (!persist('profile', state.draft)) { notify('浏览器无法保存，请检查本机存储权限。'); return; }
    state.profile = {...state.draft};
    notify(`已保存 · ${N.goals[state.profile.goal].label}`);
  }

  const localAsset = path => new URL(path, document.baseURI).href;
  let tesseractReady;
  let ocrWorker;
  let pdfReady;
  let ocrQueue = Promise.resolve();
  function loadTesseract() {
    tesseractReady ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = localAsset('vendor/tesseract.min.js');
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => { tesseractReady = null; script.remove(); reject(new Error('OCR 组件加载失败')); };
      document.head.append(script);
    });
    return tesseractReady;
  }

  function timeLimit(promise, ms) {
    let timer;
    const limit = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('图片识别超时')), ms);
    });
    return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
  }

  async function readImage(image) {
    if (location.protocol === 'file:') throw new Error('请通过本地启动脚本打开，以使用图片 OCR。');
    const engine = await loadTesseract();
    const job = ocrQueue.then(async () => {
      ocrWorker ??= engine.createWorker(['chi_sim','eng'], 1, {
        workerPath:localAsset('vendor/worker.min.js'), workerBlobURL:false, corePath:localAsset('vendor/tesseract-core-lstm.wasm.js'),
        langPath:localAsset('vendor/').replace(/\/$/, ''), errorHandler:() => {},
      });
      const loading = ocrWorker;
      const discard = () => {
        ocrWorker = null;
        void loading.then(worker => worker.terminate(), () => {}).catch(() => {});
      };
      try {
        const worker = await timeLimit(loading, 24000);
        return (await timeLimit(worker.recognize(image), 18000)).data.text;
      } catch (error) {
        discard();
        throw error;
      }
    });
    ocrQueue = job.catch(() => {});
    return job;
  }

  function drawLabelImage(image, frame, edge, canvas = document.createElement('canvas')) {
    const angle = frame?.angle ?? 0;
    const crop = frame?.crop ?? {x:0, y:0, width:1, height:1};
    const vertical = angle % 180 !== 0;
    const width = vertical ? image.naturalHeight : image.naturalWidth;
    const height = vertical ? image.naturalWidth : image.naturalHeight;
    const scale = Math.min(1, edge / Math.max(width * crop.width, height * crop.height));
    canvas.width = Math.max(1, Math.round(width * crop.width * scale));
    canvas.height = Math.max(1, Math.round(height * crop.height * scale));
    const context = canvas.getContext('2d', {alpha:false});
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    context.translate(width * (0.5 - crop.x) * scale, height * (0.5 - crop.y) * scale);
    context.rotate(angle * Math.PI / 180);
    context.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale);
    return canvas;
  }

  async function loadLabelImage(url) {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error('这张照片无法打开。请用相机重拍，或选择 JPG、PNG 照片。');
    }
    return image;
  }

  async function openLabelCrop() {
    const type = state.label.active;
    const target = capture(type);
    const url = target.url;
    if (!url || document.getElementById('label-crop')) return;
    let image;
    try {
      image = await loadLabelImage(url);
    } catch (error) {
      notify(error.message);
      return;
    }
    if (capture(type).url !== url || state.label.active !== type || state.mode !== 'label' || state.page !== 'scan' || document.getElementById('label-crop')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'label-crop';
    dialog.className = 'crop-dialog';
    dialog.setAttribute('aria-labelledby', 'label-crop-heading');
    dialog.innerHTML = `<div class="section-head"><h2 id="label-crop-heading">框选标签文字</h2><button class="icon-button" type="button" data-crop="close" aria-label="关闭">×</button></div>
      <p class="micro">手指从标签一角拖到对角。营养成分表请把表头、单位和数字一起框入。</p>
      <div class="crop-preview"><canvas aria-label="拖动选择照片上的标签区域"></canvas></div>
      <div class="action-row"><button class="button outline" type="button" data-crop="rotate">旋转 90°</button><button class="button outline" type="button" data-crop="clear">用整张图</button><button class="button primary" type="button" data-crop="read">识别选区</button></div>`;
    document.body.append(dialog);
    const canvas = dialog.querySelector('canvas');
    let {angle = 0, crop = null} = target.frame || {};
    let start;
    const paint = () => {
      drawLabelImage(image, {angle}, 720, canvas);
      canvas.style.width = `min(100%, ${canvas.width}px, ${Math.round(53 * canvas.width / canvas.height)}vh)`;
      dialog.querySelector('[data-crop="read"]').textContent = crop ? '识别选区' : '识别整张图';
      if (!crop) return;
      const {width, height} = canvas;
      const ctx = canvas.getContext('2d');
      ctx.resetTransform();
      const x = crop.x * width, y = crop.y * height, w = crop.width * width, h = crop.height * height;
      ctx.fillStyle = 'rgba(0,0,0,.52)';
      ctx.fillRect(0, 0, width, y);
      ctx.fillRect(0, y + h, width, height - y - h);
      ctx.fillRect(0, y, x, h);
      ctx.fillRect(x + w, y, width - x - w, h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
    };
    const point = event => {
      const rect = canvas.getBoundingClientRect();
      const unit = value => Math.max(0, Math.min(1, value));
      return {x:unit((event.clientX - rect.left) / rect.width), y:unit((event.clientY - rect.top) / rect.height)};
    };
    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      start = point(event);
      canvas.setPointerCapture(event.pointerId);
    });
    const select = event => {
      const end = point(event);
      crop = {x:Math.min(start.x,end.x), y:Math.min(start.y,end.y), width:Math.abs(start.x-end.x), height:Math.abs(start.y-end.y)};
    };
    canvas.addEventListener('pointermove', event => {
      if (!start || !event.isPrimary) return;
      select(event);
      paint();
    });
    canvas.addEventListener('pointerup', event => {
      if (!start || !event.isPrimary) return;
      select(event);
      if (crop.width * canvas.clientWidth < 12 || crop.height * canvas.clientHeight < 12) crop = null;
      start = null;
      paint();
    });
    canvas.addEventListener('pointercancel', () => { start = null; crop = null; paint(); });
    dialog.addEventListener('close', () => dialog.remove(), {once:true});
    dialog.addEventListener('click', event => {
      const action = event.target.closest('[data-crop]')?.dataset.crop;
      if (action === 'rotate') { angle = (angle + 90) % 360; crop = null; paint(); }
      if (action === 'clear') { crop = null; paint(); }
      if (action === 'close') dialog.close();
      if (action === 'read') {
        dialog.close();
        if (capture(type).url !== url) return;
        target.job?.abort();
        target.frame = {angle, crop};
        target.busy = false;
        void runOcr(type);
      }
    });
    dialog.showModal();
    paint();
  }

  let labelWorker;
  let labelQueue = Promise.resolve();
  function scanLabelImage(canvas, signal, progress) {
    const job = labelQueue.then(async () => {
      if (signal.aborted) return '';
      const bitmap = await createImageBitmap(canvas);
      if (signal.aborted) { bitmap.close(); return ''; }
      let worker;
      try {
        labelWorker ??= new Worker(localAsset('label-ocr/worker.mjs'), {type:'module'});
        worker = labelWorker;
      } catch (error) {
        bitmap.close();
        throw error;
      }
      const reset = () => {
        worker.terminate();
        if (labelWorker === worker) labelWorker = null;
      };
      let cancel;
      try {
        return await timeLimit(new Promise((resolve, reject) => {
          cancel = () => { reset(); resolve(''); };
          signal.addEventListener('abort', cancel, {once:true});
          worker.onmessage = ({data}) => {
            if (data.stage) progress(data.stage === 'detect' ? '正在定位包装上的小字…' : '正在逐行读取包装文字…');
            else if (data.error) reject(new Error(data.error));
            else resolve(data.text);
          };
          worker.onerror = error => reject(new Error(error.message));
          try {
            worker.postMessage(bitmap, [bitmap]);
          } catch (error) {
            bitmap.close();
            reject(error);
          }
        }), 60000);
      } catch (error) {
        reset();
        throw error;
      } finally {
        signal.removeEventListener('abort', cancel);
        worker.onmessage = null;
        worker.onerror = null;
      }
    });
    labelQueue = job.catch(() => {});
    return job;
  }

  async function readLabelPhoto(type, target, signal, progress) {
    const canvas = drawLabelImage(await loadLabelImage(target.url), target.frame, 2400);
    let text = '', failed = false;
    try {
      text = await scanLabelImage(canvas, signal, progress);
    } catch {
      failed = true;
    }
    if (signal.aborted) return '';
    const score = value => {
      if (type === 'table') return P.readNutrition(value).count;
      const fields = P.readProduct(value);
      const ingredients = fields.ingredients || '';
      const readable = /(?:\p{Script=Han}.{0,5}){3}/u.test(ingredients)
        || (ingredients.match(/\b[a-z]{2,16}\b/gi)?.length || 0) > ingredients.length / 13;
      return Object.keys(fields).length + (readable ? 5 : 0);
    };
    if (score(text) >= (type === 'table' ? 1 : 5)) return text;

    progress('正在用备用方式再读一次…');
    try {
      const backup = await timeLimit(readImage(canvas), 18000);
      if (score(backup) > score(text) || !text.trim()) return backup;
    } catch {
      if (failed) throw new Error('识别未完成。可缩小框选范围后重试，或手动填写。');
    }
    return text;
  }

  async function readPdf(file) {
    if (location.protocol === 'file:') throw new Error('请通过本地启动脚本打开，以读取 PDF。');
    pdfReady ??= import(localAsset('vendor/pdf.min.mjs')).catch(error => { pdfReady = null; throw error; });
    const pdf = await pdfReady;
    pdf.GlobalWorkerOptions.workerSrc = localAsset('vendor/pdf.worker.min.mjs');
    const task = pdf.getDocument({data:new Uint8Array(await file.arrayBuffer()), isEvalSupported:false});
    try {
      const doc = await task.promise;
      const extracted = [];
      for (let number = 1; number <= Math.min(3, doc.numPages); number++) {
        const page = await doc.getPage(number);
        const {items} = await page.getTextContent();
        const rows = [];
        const cells = items.filter(item => item.str?.trim()).sort((a,b) => b.transform[5] - a.transform[5]);
        for (const cell of cells) {
          const previous = rows.at(-1);
          if (previous && Math.abs(previous[0].transform[5] - cell.transform[5]) <= 3) previous.push(cell);
          else rows.push([cell]);
        }
        const content = rows.map(row => row.sort((a,b) => a.transform[4] - b.transform[4]).map(item => item.str).join(' ')).join('\n');
        if (content.trim().length > 12) { extracted.push(content); continue; }
        const canvas = document.createElement('canvas');
        const initial = page.getViewport({scale:1});
        const viewport = page.getViewport({scale:Math.min(2.2, 1900 / Math.max(initial.width, initial.height))});
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({canvasContext:canvas.getContext('2d'), viewport}).promise;
        extracted.push(await readImage(canvas));
      }
      return extracted.join('\n');
    } finally { await task.destroy(); }
  }

  function extractText(type, text, snapshot) {
    const section = capture(type);
    if (!text.trim()) { section.status = '没有读到文字。请换一张清晰照片，或手动输入。'; return; }
    if (type === 'report') {
      const data = N.readReport(text);
      const keys = Object.keys(N.fields).filter(key => key in data);
      if (keys.length) {
        const draft = state.draft;
        const changed = new Set(snapshot ? Object.keys(snapshot).filter(key => draft[key] !== snapshot[key]) : []);
        if (draft.reportExample) {
          for (const key of [...Object.keys(N.fields),'ldlHigh','glucoseHigh']) {
            if (!changed.has(key)) draft[key] = N.blankProfile[key];
          }
        }
        for (const [key,value] of Object.entries(data)) {
          if (!changed.has(key) && !(key.endsWith('High') && changed.has(key.slice(0,-4)))) draft[key] = value;
        }
        draft.reportExample = false;
      }
      section.demo = false;
      section.status = keys.length ? `已识别${keys.map(key => N.fields[key].label).join('、')}。请核对下方档案指标后保存。` : '未找到能确认项目、数值和单位的结果。请对照原报告补填。';
      return;
    }

    const label = state.label;
    const product = P.readProduct(text);
    if (type === 'table' && !/配料|原料|ingredients/i.test(text)) delete product.ingredients;
    for (const [key,value] of Object.entries(product)) {
      if (!label.edited.has(key)) label.inputs[key] = value;
    }
    const {columns, omitted, count} = P.readNutrition(text);
    const useTable = count && (type === 'table' || !label.table.raw && !label.columns.length);
    const messages = [];
    if (Object.keys(product).length) messages.push('已识别产品或配料信息，请核对包装原文。');
    if (useTable) {
      label.columns = columns;
      selectNutritionColumn(columns.length > 1 ? '' : '0', columns.length === 1);
      messages.push(columns.length > 1 ? '营养表有多列，请在核对表格时选择一列。' : `已识别 ${count} 项营养数值，可在「拍营养成分表」中核对和修改。`);
      if (omitted.length) messages.push(`${omitted.map(key => N.nutrients[key].label).join('、')}有未读清的数值，请核对后填写。`);
    }
    if (messages.length) label.demo = false;
    section.status = messages.join(' ') || (type === 'table' ? '未匹配到明确的营养数值，请拍全表头、单位和数值，或手动填写。' : '未匹配到明确的产品信息，可补拍清晰的标签或手动填写。');
  }

  function selectNutritionColumn(index, preserveManual = false) {
    const label = state.label;
    const selected = index === '' ? null : label.columns[Number(index)];
    const inputs = label.inputs;
    const emptyValues = Object.fromEntries(Object.keys(N.nutrients).map(key => [key, '']));
    const basis = selected?.basis || (preserveManual && label.edited.has('basisMode') ? inputs.basisMode : '');
    const inMilliliters = basisMode => ['100ml','servingMl'].includes(basisMode);
    const keepAmount = basis && inputs.basisMode && inMilliliters(basis) === inMilliliters(inputs.basisMode);
    const sameBasis = !label.demo && preserveManual && basis && basis === inputs.basisMode
      && (!basis.startsWith('serving') || Number(inputs.serving) > 0 && Number(inputs.serving) === Number(selected?.data.serving));
    const prior = {};
    if (sameBasis) {
      for (const key of Object.keys(N.nutrients)) prior[key] = inputs[key];
      prior.energyUnit = inputs.energyUnit;
    }
    const priorNrv = sameBasis ? inputs.nrv : {};
    const manual = {};
    const manualNrv = {};
    if (preserveManual && (!inputs.basisMode || !inputs.serving && inputs.basisMode === basis || sameBasis)) {
      for (const key of label.edited) {
        if (key.startsWith('nrv:')) manualNrv[key.slice(4)] = inputs.nrv[key.slice(4)];
        else if (key in N.nutrients || ['energyUnit','serving'].includes(key)) manual[key] = inputs[key];
      }
      if ('energy' in manual) manual.energyUnit = inputs.energyUnit;
    } else {
      for (const key of label.edited) {
        if (key in N.nutrients || key.startsWith('nrv:') || ['energyUnit','serving','basisMode'].includes(key)) label.edited.delete(key);
      }
    }
    const amount = keepAmount || !inputs.basisMode && !inMilliliters(basis) ? inputs.amount : '';
    Object.assign(inputs, emptyValues, {energyUnit:'kJ', serving:'', basisMode:basis, amount}, prior, selected?.data, manual);
    inputs.nrv = {...priorNrv, ...selected?.data.nrv, ...manualNrv};
    label.column = index;
  }

  async function runOcr(type) {
    const target = capture(type);
    const file = target.file;
    if (!file || target.busy) return;
    const packaging = isPackagingPhoto(type);
    const snapshot = type === 'report' ? {...state.draft} : null;
    const job = packaging ? new AbortController() : null;
    if (packaging) target.job = job;
    const active = () => capture(type) === target && target.file === file && !job?.signal.aborted;
    const visible = () => packaging ? state.page === 'scan' && state.mode === 'label' && state.label.active === type : state.page === 'profile';
    const progress = message => {
      if (!active()) return;
      target.status = message;
      if (visible()) document.getElementById('label-photo-status').innerHTML = status(message);
    };
    target.busy = true;
    target.status = '首次读取可能需要初始化识别组件…';
    if (visible()) render();
    try {
      const text = packaging ? await readLabelPhoto(type, target, job.signal, progress)
        : /\.pdf$/i.test(file.name) ? await readPdf(file) : /\.txt$/i.test(file.name) ? await file.text() : await readImage(file);
      if (!active()) return;
      target.raw = text;
      extractText(type, text, snapshot);
    } catch (error) {
      if (active()) target.status = packaging || location.protocol === 'file:' ? error.message : '读取失败。请试试更清晰的截图，或在下方手动输入。';
    } finally {
      if (active()) {
        target.busy = false;
        if (packaging) target.job = null;
        if (visible()) render(); else updateResults();
      }
    }
  }

  let mealWorker;
  let mealQueue = Promise.resolve();

  function prepareScan() {
    if (navigator.connection?.saveData || location.protocol === 'file:') return;
    if (state.page === 'scan' && state.mode === 'meal' && !mealWorker) {
      try {
        mealWorker = new Worker(localAsset('vision/worker.mjs?v=meal-balance'), {type:'module'});
        const worker = mealWorker;
        worker.addEventListener('error', () => { if (mealWorker === worker) mealWorker = null; }, {once:true});
        worker.postMessage({warm:true});
      } catch { mealWorker = null; }
    }
  }

  async function photoSamples(url, detail) {
    const image = new Image();
    image.src = url;
    await image.decode();
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d', {willReadFrequently:true, alpha:false});
    context.imageSmoothingQuality = 'high';
    const crop = (x, y, w, h) => {
      context.drawImage(image, x, y, w, h, 0, 0, 256, 256);
      return context.getImageData(0, 0, 256, 256).data;
    };
    const samples = [crop(0, 0, width, height)];
    for (const fraction of detail ? [0.36, 0.54] : [0.36]) {
      const span = Math.min(width, height) * fraction;
      for (const y of [0.13, 0.5, 0.87]) {
        for (const x of [0.13, 0.5, 0.87]) samples.push(crop(x * (width - span), y * (height - span), span, span));
      }
    }
    return samples;
  }

  function classifyMeal(samples, onStage) {
    const task = mealQueue.then(() => new Promise((resolve, reject) => {
      const worker = mealWorker ??= new Worker(localAsset('vision/worker.mjs?v=meal-balance'), {type:'module'});
      const finish = (result, failed = false) => {
        clearTimeout(timer);
        worker.removeEventListener('message', received);
        worker.removeEventListener('error', crashed);
        if (failed) { worker.terminate(); mealWorker = null; reject(new Error('Vision worker unavailable')); }
        else resolve(result);
      };
      const received = event => {
        if (event.data.stage) onStage(event.data.stage);
        else finish(event.data.dishes, event.data.error);
      };
      const crashed = () => finish(null, true);
      const timer = setTimeout(crashed, 90000);
      worker.addEventListener('message', received);
      worker.addEventListener('error', crashed);
      worker.postMessage({samples}, samples.map(pixels => pixels.buffer));
    }));
    mealQueue = task.catch(() => {});
    return task;
  }

  async function recognizeMeal(detail = false) {
    const current = state.meal;
    const file = current.file;
    if (!file || current.busy) return;
    if (location.protocol === 'file:') { notify('请通过本地启动脚本打开网页，再识别餐盘。'); return; }
    current.busy = true;
    current.status = '正在准备照片…';
    render();
    try {
      const samples = await photoSamples(current.url, detail);
      if (current.file !== file) return;
      if (current.photoAt != null) {
        const date = new Date(current.photoAt).toDateString();
        const times = [...state.mealPhotos, ...load('mealPhotos', [])];
        state.mealPhotos = [...new Set([...times.filter(time => new Date(time).toDateString() === date), current.photoAt])];
        persist('mealPhotos', state.mealPhotos);
        current.photoAt = null;
        refreshMascot(new Date());
      }
      const guesses = await classifyMeal(samples, stage => {
        if (current.file !== file) return;
        current.status = stage === 'analyzing' ? '正在本机分析餐盘…' : '正在加载视觉模型，首次可能需要一些时间…';
        if (state.page === 'scan' && state.mode === 'meal') render();
      });
      if (current.file !== file) return;
      current.detected = true;
      const filled = current.rows.filter(row => row.name.trim() || row.id || row.grams !== '');
      const names = new Set(filled.map(row => row.name.trim()));
      const originals = new Set(filled.map(row => row.detectedName));
      const suggestions = guesses.filter(guess => !names.has(guess.name) && !originals.has(guess.name) && !filled.some(row => row.id && row.id === N.matchFood(guess.name)?.id));
      if (suggestions.length) current.rows = [...filled, ...suggestions.map(guess => {
        // The nine small crops sample the same grid on normal and detailed scans.
        const food = N.matchFood(guess.name);
        const typical = food?.serving ?? 100;
        const scale = Math.min(1.6, 0.55 + 0.15 * guess.localHits);
        const grams = guess.localHits > 0 ? Math.round(typical * scale / 10) * 10 : '';
        return {id:food?.id || '', name:guess.name, detectedName:guess.name, grams, photoGrams:grams};
      })];
      current.status = guesses.length ? '已填入候选菜名。有足够画面线索的菜品也已粗估份量。请核对食材品种和实际食用量。' : '没有找到把握较大的候选。可仔细复扫、换一张清楚的俯拍图，或手动输入。';
    } catch {
      if (current.file === file) current.status = '未能完成识别。可试试新版手机浏览器和清晰的 JPG，或手动选菜。';
    } finally {
      if (current.file === file) { current.busy = false; if (state.page === 'scan' && state.mode === 'meal') render(); }
    }
  }

  const actions = {
    'direct-portion': () => {
      state.label.portion.mode = 'direct';
      render();
      root.querySelector('[data-label-field=amount]')?.focus();
    },
    'add-seasoning': () => {
      state.meal.seasonings.push({id:'', name:'', amount:'', unit:'g', energyUnit:'kJ', values:{}});
      render();
      root.querySelector(`[data-season-index="${state.meal.seasonings.length - 1}"][data-season-field=id]`)?.focus();
    },
    'balance-settings': () => {
      changePage('profile');
      root.querySelector('[data-profile-field=dailyEnergy]').focus();
    },
    'generate-result': () => {
      state[state.mode].resultRequested = true;
      updateResults();
      document.getElementById('result-feedback')?.focus({preventScroll:true});
    },
    'start-meal': () => { state.mode = 'meal'; changePage('scan'); },
    'start-label': () => { state.mode = 'label'; changePage('scan'); },
    'go-profile': () => changePage('profile'),
    'demo-meal': () => showDemo('meal'),
    'demo-label': () => showDemo('label'),
    'reset-label': () => { resetLabels(); render(); },
    'label-ingredients': () => { state.label.active = 'ingredients'; render(); },
    'label-table': () => { state.label.active = 'table'; render(); },
    'demo-profile': () => {
      const {purposes, weightPurpose, trainingPurpose, ingredientFocus} = state.draft;
      state.draft = {...N.sampleProfile, ldlHigh:true, reportExample:true, purposes, weightPurpose, trainingPurpose, ingredientFocus};
      Object.assign(state.report,{demo:true, raw:'身高 170 cm\n体重 65 kg\n体脂率 22%\nLDL-C 3.4 mmol/L ↑', file:null, busy:false, status:'示例档案已填入草稿，可核对报告中的标高项。'});
      render();
    },
    'recognize-meal': () => recognizeMeal(state.meal.detected),
    'recognize-label': () => runOcr(state.label.active),
    'crop-label': openLabelCrop,
    'recognize-report': () => runOcr('report'),
    'parse-label': () => { extractText(state.label.active, state.label[state.label.active].raw); render(); },
    'parse-report': () => { extractText('report', state.report.raw); render(); },
    'add-food': () => { state.meal.rows.push(blankFood()); render(); root.querySelector(`[data-food-name="${state.meal.rows.length - 1}"]`)?.focus(); },
    'restore-note': () => { state.meal.note = null; updateResults(); document.getElementById('meal-note')?.focus(); },
    'plan-from-label': () => openFavorite(scanResult(), true),
    'close-plan-editor': () => { state.planDraft = null; render(); },
    'close-plan-record': () => { state.planRecord = null; render(); },
    'save-meal': saveRecord,
    'save-profile': saveProfile,
    'speak-mouse': speakMouse,
    'reset-profile': () => {
      if (!confirm('清空本机保存的档案和饮食关注目标？')) return;
      if (!persist('profile', N.blankProfile)) { notify('无法清空本机档案。'); return; }
      state.profile = {...N.blankProfile};
      state.draft = {...N.blankProfile};
      state.report = {file:null, status:'', busy:false, raw:'', demo:false};
      render();
      notify('已清空本机档案。');
    },
    'log-today': () => { state.logWindow = 'today'; render(); },
    'log-week': () => { state.logWindow = 'week'; render(); },
  };
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const {page, action, removeFood, deleteRecord, planEdit, planSource, planRecord, planRemove, profileJump} = button.dataset;
    if (button.dataset.section) {
      const target = document.getElementById(button.dataset.section);
      if (target) {
        target.focus({preventScroll:true});
        target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      }
      return;
    }
    if (button.dataset.variety) {
      const row = state.meal.rows[Number(button.dataset.row)];
      row.name = button.dataset.variety;
      row.id = N.matchFood(row.name).id;
      render();
      root.querySelector(`[data-grams="${button.dataset.row}"]`)?.focus();
      return;
    }
    if (button.dataset.removeSeasoning !== undefined) {
      state.meal.seasonings.splice(Number(button.dataset.removeSeasoning),1);
      render();
      return;
    }
    if (button.dataset.missingField) {
      if (state.mode === 'label' && state.label.active !== 'table') {
        state.label.active = 'table';
        render();
      }
      root.querySelector(button.dataset.missingField)?.focus();
      return;
    }
    if (button.dataset.share) {
      state.label.portion.share = button.dataset.share;
      root.querySelector('[data-portion=share]').value = button.dataset.share;
      updateResults();
    }
    if (page) changePage(page);
    if (action) actions[action]?.();
    if (profileJump) document.getElementById(profileJump)?.focus();
    if (planSource) openFavorite(state.history.find(record => record.id === planSource));
    if (planEdit) openFavorite(state.favorites.find(item => item.id === planEdit));
    if (planRecord) {
      state.planDraft = null;
      state.planRecord = planRecord;
      render();
      root.querySelector('[data-plan-intake] input')?.focus();
    }
    if (planRemove && confirm('移除这项爱吃计划？')) {
      if (!saveFavorites(F.loadPlans(load('favoriteFoods', state.favorites)).filter(plan => plan.id !== planRemove))) return;
      if (state.planDraft?.id === planRemove) state.planDraft = null;
      render();
      notify('已移除计划。');
    }
    if (removeFood !== undefined) {
      state.meal.rows.splice(Number(removeFood), 1);
      if (!state.meal.rows.length) state.meal.rows.push(blankFood());
      render();
    }
    if (deleteRecord) {
      const updated = load('history',state.history).filter(record => record.id !== deleteRecord);
      if (!persist('history', updated)) { notify('无法移除本机记录。'); return; }
      state.history = updated;
      render();
      notify('已移除饮食记录。');
    }
  });
  window.addEventListener('popstate', () => { state.page = pageFromHash(); render(); });
  let planDate = new Date().toDateString();
  function refreshPlanClock() {
    const now = new Date();
    if (['home','plan','log'].includes(state.page)
      && planDate !== now.toDateString() && !state.planDraft && !state.planRecord) render();
    planDate = now.toDateString();
    refreshMascot(now);
    for (const element of root.querySelectorAll('[data-plan-at]')) element.textContent = planCountdown(Number(element.dataset.planAt), +now);
  }
  window.setInterval(refreshPlanClock, 15000);
  document.addEventListener('visibilitychange', refreshPlanClock);
  render();
  prepareScan();
  M.startWelcome();
})();
