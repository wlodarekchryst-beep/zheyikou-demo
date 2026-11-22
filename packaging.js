(() => {
  'use strict';

  const nutrientRows = {
    energy:/^(?:总?能量|Energy)/i,
    protein:/^(?:蛋白质|Protein)/i,
    fat:/^(?:总?脂肪|Total\s*fat|Fat)(?!酸)/i,
    saturatedFat:/^(?:饱和脂肪(?:酸)?|Saturated\s*fat)/i,
    transFat:/^(?:反式脂肪(?:酸)?|Trans\s*fat)/i,
    carbs:/^(?:碳水(?:化合物)?|(?:Total\s+)?Carbohydrates?)/i,
    sugars:/^(?:总?糖(?:\(乳糖\))?|(?:Total\s+)?Sugars?)(?!醇|浆)/i,
    fiber:/^(?:膳食纤维|(?:Dietary\s+)?Fib(?:er|re))/i,
    sodium:/^(?:钠|Sodium)/i,
  };
  const amountUnits = /(<|≤)?\s*(\d+(?:\.\d+)?)\s*(千焦|千卡|毫克|克|kcal|kj|mg|g)(?![a-z])/gi;
  const basisHeader = /每\s*(100\s*(?:m\s*l|毫升|g|克)|(?:1\s*)?份)|\bper\s*(100\s*(?:ml|g)|serving)\b/gi;
  const servingPattern = /(?:每\s*(?:1\s*)?份(?:食用量|重量)?|serving size)\s*[:=(约为 ]*(\d+(?:\.\d+)?)\s*(ml|毫升|g|克)(?![a-z])/i;
  const basisNames = {'100g':'每 100 g','100ml':'每 100 mL',serving:'每份（g）',servingMl:'每份（mL）'};

  const allergens = [
    ['麸质谷物', /小麦(?:粉|麸|蛋白)?|黑麦|大麦|燕麦|斯佩耳特麦|谷朊粉|(?<!玉米|荞麦|大米|米)面粉|\b(?:wheat|rye|barley|oat[s]?|gluten)\b/gi],
    ['甲壳类', /小龙虾|龙虾|虾(?:仁|粉|米|皮|肉)?|蟹(?:肉|粉)?|甲壳类|\b(?:shrimp|prawns?|crab|lobster|crustaceans?)\b/gi],
    ['鱼类', /鱼(?:肉|露|粉|油|糜|类)|鱼(?!腥草)|鳕鱼?|鲑鱼?|\b(?:fish|salmon|tuna|cod)\b/gi],
    ['蛋类', /鸡蛋|鸭蛋|鹌鹑蛋|全蛋粉|蛋黄(?:粉)?|蛋清(?:粉)?|蛋白粉|卵白蛋白|蛋类|\b(?:eggs?|albumen)\b/gi],
    ['花生', /花生(?:油|酱|粉|仁)?|\bpeanuts?\b/gi],
    ['大豆', /大豆(?:制品|油|粉|蛋白|卵磷脂)?|黄豆|豆浆|豆腐|豆乳|豆奶|豆豉|\b(?:soy(?:beans?)?|soya|tofu)\b/gi],
    ['乳类', /牛乳|羊乳|生乳|牛奶|乳制品|乳及乳制品|脱脂乳|全脂乳|乳粉|奶粉|乳清(?:蛋白)?|乳糖|酪蛋白(?:酸钠)?|黄油|(?<!人造|植物|植脂)奶油|炼乳|奶酪|\b(?:milk|whey|casein|butter|lactose)\b/gi],
    ['坚果', /树坚果|坚果|核桃|腰果|榛子|开心果|碧根果|夏威夷果|巴旦木|扁桃仁|杏仁|澳洲坚果|巴西坚果|\b(?:tree nuts?|almonds?|cashews?|walnuts?|hazelnuts?|pistachios?|pecans?)\b/gi],
  ];
  const focusIngredients = [
    ['糖和糖浆', /白砂糖|食用糖|蔗糖|葡萄糖浆|果葡糖浆|高果糖浆|麦芽糖浆|转化糖浆|蜂蜜|红糖|冰糖|\b(?:sugar|glucose syrup|corn syrup|honey)\b/gi],
    ['含钠配料', /食用盐|海盐|食盐|氯化钠|碳酸氢钠|谷氨酸钠|味精|苯甲酸钠|亚硝酸钠|(?<!食用|食|海)盐(?!酸)|\b(?:salt|sodium bicarbonate|monosodium glutamate)\b/gi],
    ['氢化油脂', /部分氢化(?:植物)?油|氢化(?:植物)?油|起酥油|人造奶油|\b(?:hydrogenated\s+\w+\s+oil|shortening|margarine)\b/gi],
    ['甜味剂', /三氯蔗糖|阿斯巴甜|安赛蜜|甜蜜素|糖精钠|甜菊糖苷|赤藓糖醇|木糖醇|麦芽糖醇|\b(?:sucralose|aspartame|acesulfame|erythritol|xylitol)\b/gi],
    ['咖啡因相关', /咖啡因|含咖啡因|咖啡粉|茶提取物|瓜拉纳|\b(?:caffeine|guarana)\b/gi],
  ];

  function normalized(text) {
    return String(text ?? '').normalize('NFKC')
      .replace(/(?<=\p{Script=Han})[ \t]+(?=\p{Script=Han})/gu, '')
      .replace(/(?<=\d)\s*[·.]\s*(?=\d)/g, '.').replace(/\bN\s*R\s*V\b/gi, 'NRV');
  }

  // Keep the photographed text in the editable OCR field; normalize label vocabulary for matching.
  const labelTerms = new Map(Object.entries({
    產:'产', 稱:'称', 淨:'净', 營:'营', 養:'养', 資:'资', 質:'质', 總:'总', 飽:'饱', 鈉:'钠',
    麥:'麦', 鹽:'盐', 類:'类', 製:'制', 過:'过', 訊:'讯', 廠:'厂', 線:'线', 設:'设', 備:'备',
    殼:'壳', 蝦:'虾', 魚:'鱼', 雞:'鸡', 堅:'坚', 儲:'储', 貯:'贮', 條:'条', 許:'许', 證:'证',
    標:'标', 準:'准', 經:'经', 銷:'销', 賣:'卖', 聯:'联', 纖:'纤', 維:'维', 膠:'胶',
  }));
  const labelText = raw => normalized(raw).replace(/\p{Script=Han}/gu, char => labelTerms.get(char) ?? char);
  const productMarkers = /(?:产品名(?:称)?|食品名称|商品名称|品\s*名|品牌(?:名称)?|净含量|净重量?|生产商|制造商|生产者|生产企业|委托方)\s*[:：]/i;
  const otherMarkers = /(?:营养成[分份]表|营养资料|保质期|(?:贮|储)存(?:条件|方法)|食用方法|生产日期|生产许可证|产品标准|执行标准|联系方式|地址|经销商|Nutrition\s*Information|Stora?ge\s*Conditions|Imported\b|Distributed\b|Best\s*Before|Product\s+of)\s*[:：]?/i;
  const allergenHeading = /(?:(?:食物)?致(?:\(?过\)?)?敏(?:原|物质)(?:信息|提示)?|过敏原(?:信息|提示)?|致敏信息|Allergens?(?:\s*Information)?)\s*[:：]/i;
  const advisory = /可能含(?:有)?(?:微量)?|或含(?:有)?微量|生产线|同一(?:设备|场所|工厂|车间)|共线|共用设备|made in (?:a|the same) facility|may contain/i;
  const ingredientMarker = /(?:配料(?:表|清单)?|原料(?:表)?|成[份分](?=\s*[:：])|Ingredients?)\s*[:：]?/i;

  const trimBlock = value => value.trim().replace(/^[·•:| ]+|[| ]+$/g, '');

  function readProduct(raw) {
    const lines = labelText(raw).split(/\r?\n/).map(trimBlock).filter(Boolean);
    const text = lines.join('\n');
    const fields = {};
    for (const [key, pattern] of Object.entries({name:/^(?:产品名(?:称)?|食品名称|商品名称|品名|Product\s*Name)\s*:?\s*/i, brand:/^(?:品牌(?:名称)?|Brand)\s*:?\s*/i, net:/^(?:净含量|净重量?(?:\s*Net\s*Weight)?|Net\s*(?:Weight|Content))\s*:?\s*/i})) {
      const line = lines.find(line => pattern.test(line));
      if (!line) continue;
      const inline = line.replace(pattern, '');
      const next = lines[lines.indexOf(line) + 1] || '';
      const candidate = inline.trim() ? inline : !productMarkers.test(next) && !otherMarkers.test(next) && !ingredientMarker.test(next) && !allergenHeading.test(next) ? next : '';
      const value = trimBlock(candidate.split(productMarkers)[0].split(ingredientMarker)[0].split(otherMarkers)[0]);
      if (value) fields[key] = value.slice(0, 60);
    }
    const pieces = [];
    const statements = [];
    let inIngredients = false;
    let inAllergens = false;
    const segments = lines.flatMap(line => line.split(/(?<!^)(?=(?:食物)?(?:致(?:\(?过\)?)?敏(?:原|物质)|过敏原)(?:信息|提示)?\s*[:：])/i))
      .flatMap(line => line.search(ingredientMarker) === 0 ? line.split(/\s*(?=可能含有|may contain)/i) : [line]);
    for (const line of segments) {
      if (allergenHeading.test(line) || advisory.test(line) || /^(?:本(?:品|产品))?含有|^(?:This\s*product\s*)?contains\b/i.test(line)) {
        inIngredients = false;
        inAllergens = true;
        statements.push(line);
        continue;
      }
      if (productMarkers.test(line) || /^(?:净含量|净重|Net\s*Weight|品牌|品名|制造商|生产商|生产企业|注意|香辛料经辐照)/i.test(line) || otherMarkers.test(line)) { inIngredients = false; inAllergens = false; }
      if (line.search(ingredientMarker) === 0) {
        if (/^Ingredients?/i.test(line) && /[\p{Script=Han}]/u.test(pieces.join(''))) {
          inIngredients = false;
          inAllergens = false;
          continue;
        }
        inIngredients = true;
        inAllergens = false;
        pieces.push(line.replace(ingredientMarker, ''));
      } else if (inIngredients) pieces.push(line);
      else if (inAllergens) statements.push(line);
    }
    if (pieces.join('').trim()) fields.ingredients = pieces.join(' ').split(productMarkers)[0].split(otherMarkers)[0].split(allergenHeading)[0].trim();
    if (statements.length) fields.allergenNote = statements.join('\n');
    // If the user crops away the heading, read a list only when it clearly looks like ingredients.
    if (!fields.ingredients && !productMarkers.test(text) && !otherMarkers.test(text) && !advisory.test(text) && lines.length <= 4 && /[、,;]/.test(text)) {
      fields.ingredients = lines.join(' ');
    }
    return fields;
  }

  function facts(text, rules) {
    return rules.flatMap(([label, pattern]) => {
      const terms = [...new Set([...text.matchAll(pattern)].map(match => match[0]))];
      return terms.length ? [{label, terms}] : [];
    });
  }

  function ingredientReview(ingredients, notes, preferences) {
    const contents = labelText(ingredients);
    const statements = labelText(notes).split(/[。;；\n]/).flatMap(line => line.split(/[,，]\s*(?=不含|可能含有|may contain)/i))
      .map(line => line.replace(allergenHeading,'').trim()).filter(line => !/^(?:本(?:品|产品))?(?:不含|无\s*过敏原)|^(?:does not contain|free from)/i.test(line));
    const traces = statements.filter(line => advisory.test(line)).join(' ');
    const declared = statements.filter(line => !advisory.test(line)).join(' ');
    const terms = [...new Set(labelText(preferences).split(/[、,;\n]/).map(term => term.trim()).filter(Boolean))].slice(0, 12);
    const matches = value => terms.filter(term => value.toLowerCase().includes(term.toLowerCase()));
    return {
      present:facts(`${contents}\n${declared}`, allergens), trace:facts(traces, allergens),
      focus:facts(contents, focusIngredients), custom:matches(contents), customDeclared:matches(declared), customTrace:matches(traces),
    };
  }

  function extractBasis(matches, portion) {
    return [...matches].map(match => {
      const name = (match[1] || match[2]).replace(/\s/g, '').toLowerCase();
      if (name.startsWith('100')) return /ml|毫升/.test(name) ? '100ml' : '100g';
      return portion && /ml|毫升/i.test(portion[2]) ? 'servingMl' : 'serving';
    });
  }

  function nutrientAmount(key, match) {
    if (match[1]) return null;
    const unit = match[3].toLowerCase();
    const value = Number(match[2]);
    if (key === 'energy') {
      if (['kj','千焦'].includes(unit) && value <= 5000) return {energy:value, energyUnit:'kJ'};
      if (['kcal','千卡'].includes(unit) && value <= 5000) return {energy:value, energyUnit:'kcal'};
      return null;
    }
    if (!['mg','毫克','g','克'].includes(unit)) return null;
    const grams = ['mg','毫克'].includes(unit) ? value / 1000 : value;
    if (key === 'sodium') return grams <= 100 ? {sodium:Math.round(grams * 1000000) / 1000} : null;
    return grams <= 1000 ? {[key]:grams} : null;
  }

  function readNutrition(raw) {
    const text = labelText(raw).replace(/(每\s*100\s*克)\s*\/\s*per\s*100\s*g\b/gi, '$1')
      .replace(/(每\s*100\s*毫升)\s*\/\s*per\s*100\s*ml\b/gi, '$1');
    const rowNames = Object.values(nutrientRows).map(pattern => pattern.source.slice(1)).join('|');
    const lines = text.replace(new RegExp(`(?<=[%\\dg克焦卡升])(?:[ \\t|;；]*)(?=(?:${rowNames}))`, 'ig'), '\n')
      .split(/\r?\n/).map(trimBlock).filter(Boolean);
    const portion = text.match(servingPattern);
    const headers = lines.filter(line => !/建议|实际|每份食用量|serving size/i.test(line) && [...line.matchAll(basisHeader)].length);
    const header = headers.find(line => /项目|营养|NRV|nutri/i.test(line)) ?? headers[0];
    const bases = header ? extractBasis(header.matchAll(basisHeader), portion) : [];
    const columns = (bases.length ? bases : ['']).map(basis => ({basis, data:{nrv:{}}}));
    if (portion) for (const column of columns) column.data.serving = Number(portion[1]);
    const omitted = new Set();
    lines.forEach((line, index) => {
      const cleanCell = value => value.replace(/^(?:其\s*中[:：]?\s*|[/—–-]\s*)/, '').replace(/\s+酸(?=\s|\d)/, '酸');
      const cells = line.split(/ {2,}/);
      const matchesNutrient = value => Object.entries(nutrientRows).find(([,pattern]) => pattern.test(value));
      const candidates = cells.map((_, i) => {
        const clean = cleanCell(cells.slice(i).join(' '));
        const english = clean.replace(/^\p{Script=Han}{1,14}\s*\/\s*(?=[a-z])/iu, '');
        const primary = matchesNutrient(clean);
        const translated = english === clean ? null : matchesNutrient(english);
        if (primary && translated && primary[0] !== translated[0]) return null;
        return primary ? {clean, match:primary} : translated ? {clean:english, match:translated} : null;
      });
      const row = candidates.find(Boolean);
      if (!row) return;
      const {clean, match:[key, pattern]} = row;
      let body = clean.replace(pattern, '');
      // OCR can place each numeric cell, its unit and the percentage on separate lines.
      for (const next of lines.slice(index + 1, index + 7)) {
        if (!/^(?:[\d\s.%|:<>≤]+|(?:[\d\s.<>≤]*)(?:千焦|千卡|毫克|克|kcal|kj|mg|g)[\d\s.%|]*)$/i.test(next)) break;
        body += ' ' + next;
      }
      // Some labels print the unit in the row heading, e.g. 蛋白质(g) 6.0 10%.
      const namedUnit = body.match(/^\s*[(\[/]?\s*(千焦|千卡|毫克|克|kcal|kj|mg|g)(?![a-z])\s*[)\]]?\s*[:|]?\s*/i);
      if (namedUnit) {
        const cells = body.slice(namedUnit[0].length).trim();
        if (/^[\d\s.%|<≤]+$/.test(cells)) body = cells.replace(/([<≤]?\s*\d+(?:\.\d+)?)(\s*%)?/g, (token,value,percent) => percent ? token : value + ' ' + namedUnit[1]);
      }
      const values = [...body.matchAll(amountUnits)];
      // A missing value in a multi-column label makes the remaining value ambiguous.
      if (values.length < columns.length) { omitted.add(key); return; }
      const nrv = [...body.matchAll(/(\d+(?:\.\d+)?)\s*%/g)];
      columns.forEach(({data}, columnIndex) => {
        const amount = nutrientAmount(key, values[columnIndex]);
        if (amount) Object.assign(data, amount);
        else omitted.add(key);
        if (amount && nrv.length === columns.length && Number(nrv[columnIndex][1]) <= 10000) data.nrv[key] = Number(nrv[columnIndex][1]);
      });
    });
    const options = columns.map(({basis,data}) => ({basis, title:basisNames[basis] || '未识别标示基准', data}));
    return {columns:options, omitted:[...omitted], count:options.reduce((max,column) => Math.max(max, Object.keys(nutrientRows).filter(key => key in column.data).length),0)};
  }

  const sizeUnits = '(公斤|千克|毫升|克|升|斤|两|kg|ml|g|l)';
  const quantity = '(\\d+(?:\\.\\d+)?)\\s*' + sizeUnits;
  const sizeFactors = {公斤:1000,千克:1000,kg:1000,斤:500,两:50,克:1,g:1,升:1000,l:1000,毫升:1,ml:1};
  function packageSize(raw) {
    const text = normalized(raw).trim().toLowerCase();
    const detailed = text.match(/^([^()]+)\(([^()]+)\)$/);
    if (detailed) {
      const total = packageSize(detailed[1]);
      const bags = detailed[2].trim().match(/^(\d+)\s*(?:小包|小袋|包|袋|瓶|盒)$/);
      if (total && bags && Number(bags[1]) > 0) return {...total, count:Number(bags[1])};
      const inner = packageSize(detailed[2]);
      if (total && inner?.count && total.unit === inner.unit && Math.abs(total.total - inner.total) < 0.00001) return inner;
      return null;
    }
    const bulk = text.match(new RegExp('^' + quantity + '\\s*[*×x]\\s*(\\d+)\\s*(?:小?袋|小?包|盒|瓶)?$'));
    const reversed = text.match(new RegExp('^(\\d+)\\s*(?:小?袋|小?包|盒|瓶)?\\s*[*×x]\\s*' + quantity + '$'));
    const single = text.match(new RegExp('^' + quantity + '$'));
    if (!bulk && !reversed && !single) return null;
    const [number, unit, count] = reversed ? [reversed[2], reversed[3], Number(reversed[1])] : [(bulk || single)[1], (bulk || single)[2], bulk ? Number(bulk[3]) : 1];
    const each = Number(number) * sizeFactors[unit];
    if (!(each > 0 && count > 0 && Number.isFinite(each * count))) return null;
    return {total:each * count, count:bulk || reversed ? count : null, unit:/^(?:ml|l|毫升|升)$/.test(unit) ? 'mL' : 'g'};
  }

  function fraction(raw) {
    const match = normalized(raw).trim().match(/^(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?$/);
    if (!match || Number(match[2]) === 0) return null;
    const value = Number(match[1]) / Number(match[2] || 1);
    return value > 0 && Number.isFinite(value) ? value : null;
  }

  function packageIntake(label, portion) {
    const size = packageSize(label.net);
    const unit = ['100ml','servingMl'].includes(label.basisMode) ? 'mL' : 'g';
    const direct = portion.mode === 'direct';
    if (!direct && !size) return {field:'[data-label-field=net]', hint:'请先填写整包净含量和单位，例如 120 g 或 250 mL。'};
    if (!direct && label.basisMode && size.unit !== unit) return {field:'[data-label-field=net]', hint:'净含量与营养表的重量、容量单位不同，请核对包装，或按营养表单位直接填写食用量。'};
    const small = portion.mode === 'small';
    const enteredCount = String(portion.count ?? '').trim();
    const count = enteredCount ? Number(enteredCount) : size?.count;
    if (small && !(Number.isInteger(count) && count > 0)) return {field:'[data-portion=count]', hint:'请填写大包装内同规格小包的总数。'};
    if (small && size.count != null && count !== size.count) {
      return {field:'[data-portion=count]', hint:`包装规格写的是 ${size.count} 小包，手填的是 ${count} 小包。请核对净含量或总包数，也可以清空手填数以按包装规格计算。`};
    }
    const share = direct ? null : fraction(small ? portion.eaten : portion.share);
    if (small && share > count) {
      return {field:'[data-portion=eaten]', hint:`这一整包有 ${count} 小包。若吃了多份外包装，请直接填写总食用量。`};
    }
    if (!direct && !small && share > 1) {
      return {field:'[data-portion=share]', hint:'整包比例最多为 1。若吃了多份外包装，请直接填写总食用量。'};
    }
    const amount = direct ? Number(label.amount) : size.total * share / (small ? count : 1);
    if (!(amount > 0 && Number.isFinite(amount))) return {field:direct ? '[data-label-field=amount]' : small ? '[data-portion=eaten]' : '[data-portion=share]', hint:direct ? '' : small ? '请填写本次吃了几小包，也可以填半包 0.5。' : '请填写本次吃了整包的多少，例如 1/3。'};
    const fmt = n => Number(n.toFixed(3));
    const note = small ? `${portion.eaten} 小包（每小包 ${fmt(size.total / count)} ${size.unit}）` : direct ? '' : `整包的 ${portion.share}（整包 ${fmt(size.total)} ${size.unit}）`;
    const compatible = size && label.basisMode && size.unit === unit;
    let hint = note ? `${note}，本次摄入 ${fmt(amount)} ${size.unit}。` : '';
    if (direct && compatible) {
      const ratio = amount / size.total;
      const denominator = [2,3,4,5,6,8,10,12,16].find(d => Math.abs(ratio * d - Math.round(ratio * d)) < 0.00001);
      const share = Number.isInteger(ratio) ? ratio : denominator ? `${Math.round(ratio * denominator)}/${denominator}` : '';
      hint = share ? `相当于 ${share} 包` : `约占整包 ${fmt(ratio * 100)}%`;
      if (size.count) hint += `，约 ${fmt(ratio * size.count)} 小包`;
    }
    return {amount, unit:direct ? unit : size.unit, note:note || hint, hint};
  }

  window.Packaging = {readProduct, ingredientReview, readNutrition, packageIntake};
})();
