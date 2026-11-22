(() => {
  'use strict';

  const nutrients = {
    energy: {label: '能量', unit: 'kcal'},
    protein: {label: '蛋白质', unit: 'g'},
    carbs: {label: '碳水化合物', unit: 'g'},
    fat: {label: '脂肪', unit: 'g'},
    saturatedFat: {label: '饱和脂肪', unit: 'g'},
    transFat: {label: '反式脂肪', unit: 'g'},
    sugars: {label: '糖', unit: 'g'},
    fiber: {label: '膳食纤维', unit: 'g'},
    sodium: {label: '钠', unit: 'mg'},
  };
  const mealNutrients = ['energy', 'protein', 'carbs', 'fat', 'sodium'];
  // USDA SR28. Composition is per 100 g of edible food. Source IDs are NDB numbers.
  const foods = [
    ["rice","米饭","白米饭|熟米饭|白饭","20045",150,130,2.69,28.17,0.28,1],
    ["brownRice","糙米饭","熟糙米饭","20037",150,123,2.74,25.58,0.97,4],
    ["chickenMeat","鸡肉","熟鸡肉|鸡肉块","05013",100,190,28.93,0,7.41,86],
    ["chicken","鸡胸肉","鸡胸|烤鸡胸肉（原味）|熟鸡胸肉","05064",100,165,31.02,0,3.57,74],
    ["chickenThigh","鸡腿肉","去皮鸡腿肉","05098",100,179,24.76,0,8.15,106],
    ["pork","猪肉","熟猪肉|猪肉片","10188",100,238,26.36,0,13.89,57],
    ["leanPork","瘦猪肉","猪瘦肉","10093",100,201,27.51,0,9.21,55],
    ["beef","牛肉","熟牛肉|牛肉片","13361",100,230,28.4,0,12.42,62],
    ["leanBeef","瘦牛肉","牛瘦肉","13364",100,203,29.9,0,8.37,64],
    ["shrimp","虾","虾仁|熟虾|大虾","15151",80,119,22.78,1.52,1.7,947],
    ["cod","大西洋鳕鱼","鳕鱼","15016",100,105,22.83,0,0.86,78],
    ["salmon","大西洋三文鱼","三文鱼","15237",100,206,22.1,0,12.35,61],
    ["carp","鲤鱼","","15009",100,162,22.86,0,7.17,63],
    ["tilapia","罗非鱼","","15262",100,128,26.15,0,2.65,56],
    ["bass","海鲈鱼","海鲈","15092",100,124,23.63,0,2.56,87],
    ["broccoli","西兰花","熟西兰花（无额外用油）|西蓝花","11091",100,35,2.38,7.18,0.41,41],
    ["carrot","胡萝卜","熟胡萝卜","11125",60,35,0.76,8.22,0.18,58],
    ["egg","鸡蛋","水煮鸡蛋|水煮蛋|煮鸡蛋","01129",50,155,12.58,1.12,10.61,124],
    ["tofu","豆腐","豆腐（原味）","16427",100,76,8.08,1.87,4.78,7],
    ["softTofu","嫩豆腐","软豆腐","16127",100,61,7.17,1.18,3.69,8],
    ["firmTofu","硬豆腐","老豆腐","16126",100,78,9.04,2.85,4.17,12],
    ["noodle","小麦面条","面条|熟面条|熟面条（不含汤料）","20121",160,158,5.8,30.86,0.93,1],
    ["riceNoodle","米粉","米线|熟米粉","20134",160,108,1.79,24.01,0.2,19],
    ["soba","荞麦面","荞麦面条","20115",160,99,5.06,21.44,0.1,60],
    ["potato","土豆","熟土豆|马铃薯","11365",100,87,1.87,20.13,0.1,4],
    ["bokChoy","小白菜","上海青|青江菜","11117",90,12,1.56,1.78,0.16,34],
    ["spinach","菠菜","熟菠菜","11458",90,23,2.97,3.75,0.26,70],
    ["napa","大白菜","白菜","11120",90,14,1.5,2.41,0.17,9],
    ["cabbage","卷心菜","包菜|圆白菜|洋白菜","11110",90,23,1.27,5.51,0.06,8],
    ["tomato","番茄","西红柿","11530",80,18,0.95,4.01,0.11,11],
    ["corn","甜玉米","玉米|玉米粒","11168",100,96,3.41,20.98,1.5,1],
  ].map(([id,name,aliases,ndb,serving,energy,protein,carbs,fat,sodium]) => ({id,name,aliases,ndb,serving,energy,protein,carbs,fat,sodium}));
  const normalizeName = name => String(name || '').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  const foodNames = new Map(foods.flatMap(food => [food.name,...food.aliases.split('|').filter(Boolean)].map(name => [normalizeName(name),food])));
  const matchFood = name => foodNames.get(normalizeName(name));
  // Volume conversions use each product's own USDA household weight (tablespoon ~15 mL, teaspoon ~5 mL).
  const seasonings = [
    ["salt","食盐","02047",0,0,0,0,38758,1.2],
    ["soy","酱油","16123",53,8.14,4.93,0.57,5493,1.06667],
    ["lowSoy","减盐酱油","16424",57,9.05,5.59,0.3,3598,0.94667],
    ["oyster","蚝油","06176",51,1.35,10.92,0.25,2733,1.2],
    ["fishSauce","鱼露","06179",35,5.06,3.64,0.01,7851,1.2],
    ["hoisin","海鲜酱","06175",220,3.31,44.08,3.39,1615,1.06667],
    ["ketchup","番茄沙司","11935",101,1.04,27.4,0.1,907,1.13333],
    ["chili","是拉差辣椒酱","06631",93,1.93,19.16,0.93,2124,1.3],
    ["sesamePaste","芝麻酱","12166",595,17,21.19,53.76,115,1],
    ["mayo","蛋黄酱","04025",680,0.96,0.57,74.85,635,0.92],
    ["teriyaki","照烧酱","06112",89,5.93,15.56,0.02,3833,1.2],
    ["bbq","烧烤酱","06150",172,0.82,40.77,0.63,1027,1.13333],
    ["oil","大豆油","04044",884,0,0,100,0,0.90667],
    ["oliveOil","橄榄油","04053",884,0,0,100,2,0.9],
    ["sesameOil","芝麻油","04058",884,0,0,100,0,0.9],
    ["vinegar","白醋","02053",18,0,0.04,0,2,0.99333],
    ["sugar","白砂糖","19335",387,0,99.98,0,1,0.84],
    ["pepper","黑胡椒粉","02030",251,10.39,63.95,3.26,20,null],
    ["honey","蜂蜜","19296",304,0.3,82.4,0,4,1.4],
  ].map(([id,name,ndb,energy,protein,carbs,fat,sodium,density]) => ({id,name,ndb,energy,protein,carbs,fat,sodium,density}));

  function seasoningEntry(row) {
    if (!(numeric(row.amount) && Number(row.amount) > 0)) return null;
    const custom = row.id === 'custom';
    const food = custom ? {...row.values} : seasonings.find(item => item.id === row.id);
    if (!food || custom && (!row.name.trim() || !mealNutrients.some(key => numeric(food[key])))) return null;
    if (custom && row.energyUnit === 'kJ' && numeric(food.energy)) food.energy = Number(food.energy) / 4.184;
    const amount = Number(row.amount);
    const factor = !custom && row.unit === 'mL' ? food.density : 1;
    if (!(factor > 0)) return null;
    return {name:custom ? row.name.trim() : food.name, amount, unit:row.unit, food, quantity:amount * factor};
  }
  const goals = {
    balance: {label: '均衡饮食', short: '均衡', description: '关注主食、蛋白质和蔬菜的搭配。'},
    protein: {label: '关注蛋白质', short: '蛋白质', description: '优先了解这一餐的蛋白质来源。'},
    sodium: {label: '关注钠摄入', short: '钠摄入', description: '优先查看实际份量的钠与调味信息。'},
    energy: {label: '关注能量', short: '能量', description: '优先查看不同份量对应的能量。'},
  };
  const fields = {
    height: {label: '身高', unit: 'cm', min: 50, max: 280},
    weight: {label: '体重', unit: 'kg', min: 15, max: 500},
    bodyFat: {label: '体脂率', unit: '%', min: 1, max: 80},
    ldl: {label: '低密度脂蛋白胆固醇', unit: 'mmol/L', min: 0.1, max: 30},
    glucose: {label: '空腹血糖', unit: 'mmol/L', min: 0.1, max: 50},
  };
  const blankProfile = {
    goal:'balance', target:'', height:'', weight:'', bodyFat:'', ldl:'', glucose:'', review:false,
    ldlHigh:false, glucoseHigh:false, reportExample:false, dailyEnergy:'', dailyCarbs:'', dailySaturatedFat:'',
    purposes:[], weightPurpose:'', trainingPurpose:'', ingredientFocus:'',
  };
  const blankLabel = {name:'', brand:'', net:'', basisMode:'', serving:'', amount:'', energyUnit:'kJ', ...Object.fromEntries(Object.keys(nutrients).map(key => [key,''])), ingredients:'', allergenNote:'', nrv:{}};
  const sampleLabel = {...blankLabel, name:'海盐苏打饼干', brand:'示例食品', net:'60 g', basisMode:'100g', amount:30, energy:1840, protein:8, carbs:68, fat:16, sodium:600, ingredients:'小麦粉、植物油、食用盐、碳酸氢钠', allergenNote:'本生产线也加工含乳制品的食品。'};
  const sampleMeal = [{id:'rice', grams: 150}, {id:'chicken', grams: 100}, {id:'broccoli', grams: 90}, {id:'carrot', grams: 30}];
  const sampleProfile = {...blankProfile, height: 170, weight: 65, bodyFat: 22, ldl: 3.4, goal: 'sodium', review: true};
  const numeric = value => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= 0;
  const round = value => Math.round((value + Number.EPSILON) * 10) / 10;

  function readReport(raw) {
    const text = raw.normalize('NFKC').replace(/(?<=\p{Script=Han})[ \t]+(?=\p{Script=Han})/gu, '')
      .replace(/(?<=\d)[ \t]*[.·][ \t]*(?=\d)/g, '.');
    const result = {};
    const names = {
      height: ['身高|\\bheight\\b', 'cm|厘米'], weight: ['(?<!目标|理想|标准)体重(?!指数)|\\bweight\\b', 'kg|千克|公斤'], bodyFat: ['体脂肪?率|体脂百分比|\\bPBF\\b', '%'],
      ldl: ['低密度脂蛋白(?:胆固醇)?|\\bLDL(?:\\s*[-－]?\\s*C)?\\b', 'mmol\\s*/\\s*L'],
      glucose: ['空腹(?:血糖|葡萄糖)|\\b(?:FPG|FBG)\\b', 'mmol\\s*/\\s*L'],
    };
    for (const [key, [name, unit]] of Object.entries(names)) {
      const marker = '(?:↑|↓|偏高|偏低|升高|降低|\\(?[HL]\\)?(?![a-z]))';
      const prefix = '(?:\\s*\\([a-z][a-z0-9 -]*\\))?\\s*[:|]?\\s*(?:结果\\s*[:|]?\\s*)?';
      const value = '(\\d+(?:\\.\\d+)?)(?![\\d.]|\\s*[-~～至—–]\\s*\\d)';
      const gap = '\\s*[|:]?\\s*';
      const suffix = '(?![a-z])';
      const after = new RegExp(`(?:${name})${prefix}${value}${gap}(?:${marker}${gap})?(?:${unit})${suffix}(?:[ \\t]*${marker})?`, 'ig');
      const before = new RegExp(`(?:${name})${prefix}[(\\[]?(?:${unit})${suffix}[)\\]]?${gap}${value}(?:[ \\t]*${marker})?`, 'ig');
      const reference = '\\d+(?:\\.\\d+)?\\s*[-~～至—–]\\s*\\d+(?:\\.\\d+)?';
      const resultThenRange = new RegExp(`(?:${name})${prefix}${value}[ \\t|]+(?:${marker}[ \\t|]+)?${reference}[ \\t|]+(?:${unit})${suffix}`, 'ig');
      const matches = [...text.matchAll(after), ...text.matchAll(before), ...text.matchAll(resultThenRange)];
      const valid = matches.filter(m => Number(m[1]) >= fields[key].min && Number(m[1]) <= fields[key].max);
      if (valid.length && new Set(valid.map(m => Number(m[1]))).size === 1) {
        result[key] = Number(valid[0][1]);
        if (key === 'ldl' || key === 'glucose') result[`${key}High`] = valid.some(m => /↑|偏高|升高|\bH\b/i.test(m[0]));
      }
    }
    const flaggedText = text.replace(/(?:未见|未发现|无)(?:明显)?异常/g, '');
    result.review = /(?:↑|↓|偏高|偏低|异常)/.test(flaggedText);
    return result;
  }

  function labelRates(label) {
    if (!['100g','100ml','serving','servingMl'].includes(label.basisMode)) return null;
    const basis = label.basisMode.startsWith('serving') ? Number(label.serving) : 100;
    if (!Number.isFinite(basis) || basis <= 0) return null;
    return Object.fromEntries(Object.keys(nutrients).map(key => {
      if (!numeric(label[key])) return [key, null];
      const factor = key === 'energy' && label.energyUnit === 'kJ' ? 1 / 4.184 : 1;
      return [key, Number(label[key]) * factor / basis];
    }));
  }

  function calculateLabel(label) {
    const rates = labelRates(label);
    if (!rates || !numeric(label.amount) || Number(label.amount) <= 0) return null;
    const values = Object.fromEntries(Object.entries(rates).map(([key, rate]) => [
      key, rate == null ? null : round(rate * Number(label.amount)),
    ]));
    return Object.values(values).some(value => value != null) ? values : null;
  }

  function calculateMeal(rows, added = []) {
    const selected = rows.filter(row => row.id && Number(row.grams) > 0).map(row => ({food: foods.find(food => food.id === row.id), quantity: Number(row.grams)})).filter(row => row.food);
    if (!selected.length) return null;
    const entries = selected.concat(added);
    return Object.fromEntries(mealNutrients.map(key => [key,
      entries.some(row => !numeric(row.food[key])) ? null : round(entries.reduce((sum, row) => sum + Number(row.food[key]) * row.quantity / 100, 0)),
    ]));
  }

  function advice(goal, kind, totals, amount, unit, rows) {
    const smaller = round(amount / 2);
    const topProtein = rows.map(row => ({...row, food: foods.find(item => item.id === row.id)}))
      .filter(row => row.food && Number(row.grams) > 0)
      .sort((a, b) => b.food.protein * b.grams - a.food.protein * a.grams)[0];
    if (goal === 'sodium') {
      if (kind === 'meal') return ['核对这一餐的钠', totals?.sodium != null ? `已填食材和调料约含钠 ${totals.sodium} mg。酱汁只填实际吃下的量。` : '部分项目缺少钠数值，请对照调料标签核对。'];
      if (totals?.sodium != null) return ['按实际份量看钠', `当前份量含钠 ${totals.sodium} mg。如果想少摄入一些钠，改成 ${smaller} ${unit} 时约为 ${round(totals.sodium / 2)} mg。`];
      return ['核对标签上的钠', '补上营养成分表中的钠含量和标示单位后，就能比较不同份量。'];
    }
    if (goal === 'protein') {
      if (kind === 'meal' && topProtein && totals?.protein != null) return ['看看蛋白质主要来自哪道菜', `按当前份量，${topProtein.name?.trim() || topProtein.food.name}约提供 ${round(topProtein.food.protein * topProtein.grams / 100)} g 蛋白质。可以修改份量查看变化。`];
      if (totals?.protein != null) return ['按食用量查看蛋白质', `这次食用量对应 ${totals.protein} g 蛋白质。选购时可以用相同食用量比较两件食品。`];
      return ['确认蛋白质标示', '先检查营养成分表上是否填写了蛋白质数值。'];
    }
    if (goal === 'energy') {
      if (totals?.energy != null) return ['先看实际吃掉多少', kind === 'label' ? `当前份量约 ${totals.energy} kcal，半份约 ${round(totals.energy / 2)} kcal。` : `当前餐盘约 ${totals.energy} kcal。剩下的主食或配菜可以从份量里扣除，再看更新结果。`];
      return ['补充能量数值', '确认包装上写的是千焦还是千卡，再按实际食用量换算。'];
    }
    return kind === 'meal' ? ['检查餐盘搭配', '可以对照看看这一餐有没有主食、蛋白质来源和蔬菜，再根据实际吃掉的份量记录。'] : ['按这一餐的搭配决定份量', '先确认实际吃掉多少，再和同餐的其他食物一起看。可以切换份量观察能量和营养的变化。'];
  }

  window.Nutrition = {nutrients, mealNutrients, foods, matchFood, seasonings, seasoningEntry, goals, fields, blankProfile, blankLabel, sampleLabel, sampleMeal, sampleProfile, readReport, labelRates, calculateLabel, calculateMeal, advice, round, numeric};
})();
