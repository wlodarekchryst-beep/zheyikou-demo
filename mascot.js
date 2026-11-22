(() => {
  'use strict';
  const poses = {
    wave: ['小鼠打招呼','挥着小手欢迎你'],
    stop: ['举牌 STOP','今天记录的能量已超过每日目标'],
    hungry: ['饿扁啦','到饭点了，记得拍下这一餐'],
    full: ['饱饱的','这一餐的照片已收到，记得核对份量'],
    fit: ['健美亮相','小鼠今天精神满满'],
    favorite: ['遇见最爱','今天记录了爱吃清单里的食物'],
  };
  const mealTimes = [9 * 60, 12 * 60 + 30, 18 * 60 + 30];

  function poseFor(now, energy, goal, records, photoTimes, favorites) {
    if (goal != null && energy.total > goal) return 'stop';
    const favoriteKeys = new Set(favorites.map(window.FavoriteFoods.key));
    if (records.some(record => !record.demo && record.kind === 'label' && favoriteKeys.has(window.FavoriteFoods.key(record)))) return 'favorite';
    if (goal == null || (energy.total ?? 0) >= goal) return 'fit';
    const minutes = now.getHours() * 60 + now.getMinutes();
    // Before the first reminder, a breakfast photo can already trigger the full pose.
    const meal = mealTimes.findLast(time => minutes >= time);
    const early = mealTimes.find(time => minutes < time && minutes >= time - 90);
    const photoInWindow = time => photoTimes.some(value => {
      const photo = new Date(value);
      const taken = photo.getHours() * 60 + photo.getMinutes();
      return photo.toDateString() === now.toDateString() && photo <= now && taken >= time - 90;
    });
    if (early != null && photoInWindow(early) || meal != null && photoInWindow(meal)) return 'full';
    return meal != null ? 'hungry' : 'fit';
  }

  function startWelcome() {
    if (location.hash && location.hash !== '#home') return;
    const dialog = document.getElementById('mouse-welcome');
    const skip = dialog.querySelector('button');
    let timer;
    dialog.addEventListener('close', () => {
      clearTimeout(timer);
      document.getElementById('main-content')?.focus({preventScroll:true});
    }, {once:true});
    skip.addEventListener('click', () => dialog.close(), {once:true});
    dialog.showModal();
    const image = dialog.querySelector('img');
    const loaded = image.decode ? image.decode() : Promise.resolve();
    timer = setTimeout(() => { if (dialog.open) dialog.close(); }, 3200);
    loaded.then(() => {
      if (!dialog.open) return;
      dialog.classList.add('waving');
      clearTimeout(timer);
      timer = setTimeout(() => dialog.close(), 1600);
    }).catch(() => { if (dialog.open) dialog.close(); });
  }

  window.MealMascot = {poses, poseFor, startWelcome};
})();
