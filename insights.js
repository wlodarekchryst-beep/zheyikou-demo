(() => {
  'use strict';

  const N = window.Nutrition;
  const positive = value => N.numeric(value) && Number(value) > 0 ? Number(value) : null;

  function targets(profile) {
    return {
      energy: positive(profile.dailyEnergy),
      carbs: positive(profile.dailyCarbs),
      saturatedFat: positive(profile.dailySaturatedFat),
      sodium: profile.goal === 'sodium' ? positive(profile.target) : null,
    };
  }

  function tally(records, key) {
    const actual = records.filter(record => !record.demo);
    const values = actual.map(record => record.totals?.[key]).filter(N.numeric);
    return {
      total: values.length ? N.round(values.reduce((sum, value) => sum + Number(value), 0)) : null,
      known: values.length,
      missing: actual.length - values.length,
    };
  }

  const timeSlots = [
    {end:6, label:'凌晨（00:00–05:59）'},
    {end:11, label:'上午（06:00–10:59）'},
    {end:14, label:'午间（11:00–13:59）'},
    {end:18, label:'下午（14:00–17:59）'},
    {end:24, label:'晚上（18:00–23:59）'},
  ];

  function snackPattern(records, snack) {
    const key = name => String(name ?? '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    const name = key(snack.frequencyKey);
    if (!name || snack.demo) return {count:0, portion:null, slot:null};
    const matches = records.filter(record => !record.demo && record.kind === 'label'
      && key(record.frequencyKey) === name && record.unit === snack.unit && positive(record.amount) != null);
    const amounts = matches.map(record => Number(record.amount)).sort((a,b) => a - b);
    const middle = Math.floor(amounts.length / 2);
    const portion = amounts.length < 2 ? null
      : amounts.length % 2 ? amounts[middle] : (amounts[middle - 1] + amounts[middle]) / 2;
    const days = new Map(timeSlots.map(slot => [slot, new Set()]));
    for (const record of matches) {
      const date = new Date(record.time);
      const slot = timeSlots.find(item => date.getHours() < item.end);
      if (slot) days.get(slot).add(date.toDateString());
    }
    const ranked = [...days].sort((a,b) => b[1].size - a[1].size);
    const slot = ranked[0][1].size >= 2 && ranked[0][1].size > ranked[1][1].size ? ranked[0][0].label : null;
    return {count:matches.length, portion, slot};
  }

  function snackPlan(profile, today, recent, snack) {
    const pattern = snackPattern(recent, snack);
    const goal = targets(profile);
    const hasRecords = today.some(record => !record.demo);
    const reportPriorities = [
      {flag:profile.ldlHigh, value:profile.ldl, label:'低密度脂蛋白胆固醇', key:'saturatedFat'},
      {flag:profile.glucoseHigh, value:profile.glucose, label:'空腹血糖', key:'carbs'},
    ].filter(cue => !profile.reportExample && cue.flag && positive(cue.value) != null);
    const missingGoals = reportPriorities.filter(cue => goal[cue.key] == null).map(cue => cue.key);
    const checks = [];
    const missing = [];
    for (const [key, limit] of Object.entries(goal)) {
      if (limit == null) continue;
      const metric = tally(today, key);
      const rate = snack.rates?.[key];
      if (!N.numeric(rate) || metric.missing) { missing.push(key); continue; }
      if (Number(rate) === 0) continue;
      const left = Math.max(0, limit - (metric.total ?? 0));
      checks.push({key, left, limit, amount:left / Number(rate)});
    }
    checks.sort((a,b) => a.amount - b.amount);
    const base = pattern.portion ?? positive(snack.amount);
    const available = hasRecords && checks.length && !missing.length && !missingGoals.length && base != null
      ? Math.floor(Math.min(base, checks[0].amount) * 10 + 1e-8) / 10 : null;
    return {pattern, checks, missing, missingGoals, available, reportPriorities, goal, hasRecords};
  }

  window.DietInsights = {targets, tally, snackPattern, snackPlan};
})();
