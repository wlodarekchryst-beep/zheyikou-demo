(() => {
  'use strict';

  const N = window.Nutrition;
  const I = window.DietInsights;
  const days = ['周日','周一','周二','周三','周四','周五','周六'];
  const units = ['g','mL'];
  const clockPattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const normalize = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
  const key = food => JSON.stringify([normalize(food.frequencyKey || food.name), food.unit]);
  const amountValid = value => N.numeric(value) && Number(value) > 0 && Number(value) <= 5000;

  function dayStart(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function canPlan(food) {
    return food && !food.demo && normalize(food.frequencyKey || food.name)
      && units.includes(food.unit) && amountValid(food.amount)
      && Object.keys(N.nutrients).some(metric => N.numeric(food.rates?.[metric]));
  }

  function loadPlans(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(plan => canPlan(plan) && typeof plan.id === 'string'
      && typeof plan.start === 'number' && Number.isFinite(+new Date(plan.start))
      && clockPattern.test(plan.time) && Array.isArray(plan.days) && plan.days.length
      && plan.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6));
  }

  function patterns(records, now = new Date()) {
    const from = addDays(dayStart(now), -27);
    const groups = new Map();
    for (const food of records) {
      if (food.kind !== 'label' || !canPlan(food) || !food.frequencyKey || !Number.isFinite(food.time) || food.time < +from || food.time > +now) continue;
      const id = key(food);
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(food);
    }
    return [...groups.values()].map(entries => {
      const sorted = entries.sort((a,b) => b.time - a.time);
      const latest = sorted[0];
      const pattern = I.snackPattern(sorted, latest);
      const dateCount = new Set(sorted.map(record => +dayStart(record.time))).size;
      return {latest, pattern, dateCount};
    }).sort((a,b) => b.dateCount - a.dateCount || b.latest.time - a.latest.time);
  }

  function nextSlot(plan, records, now = new Date()) {
    const today = dayStart(now);
    const weekStart = addDays(today, -((today.getDay() + 6) % 7));
    const weekEnd = addDays(weekStart, 7);
    const [hours, minutes] = plan.time.split(':').map(Number);
    const slots = [];
    for (let offset = 0; offset < 14; offset++) {
      const date = addDays(weekStart, offset);
      if (!plan.days.includes(date.getDay()) || +date < +dayStart(plan.start)) continue;
      const time = new Date(date);
      time.setHours(hours, minutes);
      slots.push({day:+date, at:+time, used:false});
    }
    const knownDays = new Set();
    const id = key(plan);
    for (const record of records) {
      if (record.demo || record.kind !== 'label' || !record.frequencyKey || !amountValid(record.amount)
        || !Number.isFinite(record.time) || record.time < +weekStart || record.time < +dayStart(plan.start)
        || record.time > +now || key(record) !== id) continue;
      knownDays.add(+dayStart(record.time));
    }
    for (const date of [...knownDays].sort((a,b) => a - b)) {
      const match = slots.find(slot => !slot.used && slot.day >= date && slot.day < +weekEnd);
      if (match) match.used = true;
    }
    return slots.find(slot => !slot.used && slot.day >= +today);
  }

  function portion(plan, profile, today) {
    // An empty history makes the shared calculator use the saved portion as its upper bound.
    const result = I.snackPlan(profile, today, [], plan);
    const names = values => values.map(metric => N.nutrients[metric].label).join('、');
    if (!result.hasRecords) return {message:'记录今天吃过的食物后，可按参考量试算。'};
    if (result.missingGoals.length) return {message:`请在档案里核对${names(result.missingGoals)}的参考量。`};
    if (!Object.values(result.goal).some(value => value != null)) return {message:'请先在档案里填写你已确定的每日参考量。'};
    if (result.missing.length) return {message:`请补齐标签或当天记录中的${names(result.missing)}。`};
    if (result.available === 0) return {message:'按已记录摄入，相关项目已达到参考量，或可估算的份量很小。你可以调整计划。'};
    if (result.available == null) return {message:'请核对标签和参考量，当前数据暂不能计算份量。'};
    const constraint = N.nutrients[result.checks[0].key];
    return {amount:result.available, message:`按今天已记录的摄入，${constraint.label}距离参考量还差 ${N.round(result.checks[0].left)} ${constraint.unit}。`};
  }

  window.FavoriteFoods = {days, clockPattern, key, canPlan, amountValid, loadPlans, patterns, nextSlot, portion};
})();
