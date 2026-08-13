const RADIO_URL='https://yalacom.github.io/radiotommart/v16.html';

const state={
  points:Number(localStorage.getItem('fit_points')||1250),
  xp:Number(localStorage.getItem('fit_xp')||7540),
  games:Number(localStorage.getItem('fit_games')||0),
  purchases:Number(localStorage.getItem('fit_purchases')||0),
  streak:Number(localStorage.getItem('fit_streak')||12),
  codeWon:localStorage.getItem('fit_code_won')==='1'
};

const qs=s=>document.querySelector(s);
const qsa=s=>[...document.querySelectorAll(s)];
let reactionStart=0,reactionTimer=null;
let battleState=null,battleEnemyTimer=null,battleClockTimer=null;
let wheelSpinning=false;

function save(){
  localStorage.setItem('fit_points',state.points);
  localStorage.setItem('fit_xp',state.xp);
  localStorage.setItem('fit_games',state.games);
  localStorage.setItem('fit_purchases',state.purchases);
  localStorage.setItem('fit_streak',state.streak);
  localStorage.setItem('fit_code_won',state.codeWon?'1':'0');
  renderState();
}

function renderState(){
  qsa('[data-points]').forEach(e=>e.textContent=state.points.toLocaleString('ru-RU'));
  const level=23+Math.floor(Math.max(0,state.xp-7540)/10000);
  const inLevel=state.xp%10000;
  qsa('[data-level]').forEach(e=>e.textContent=level);
  qsa('[data-xp]').forEach(e=>e.textContent=inLevel.toLocaleString('ru-RU')+' / 10 000 XP');
  qsa('[data-xpbar]').forEach(e=>e.style.width=Math.max(3,inLevel/100)+'%');
  qsa('[data-gamesbar]').forEach(e=>e.style.width=Math.min(100,state.games*10)+'%');
  qsa('[data-shopbar]').forEach(e=>e.style.width=Math.min(100,state.purchases*20)+'%');
  qsa('[data-streak]').forEach(e=>e.textContent=state.streak);
  const result=qs('#yourRankScore');
  if(result) result.textContent=state.points.toLocaleString('ru-RU')+' P';
}

function route(name){
  qsa('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
  qsa('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===name));
  window.scrollTo({top:0,behavior:'smooth'});
  history.replaceState(null,'','#'+name);
}

function modal(title,html){
  qs('#modalTitle').textContent=title;
  qs('#modalBody').innerHTML=html;
  qs('#modal').classList.add('show');
}

function cleanupGames(){
  if(reactionTimer){clearTimeout(reactionTimer);reactionTimer=null;}
  if(battleEnemyTimer){clearInterval(battleEnemyTimer);battleEnemyTimer=null;}
  if(battleClockTimer){clearInterval(battleClockTimer);battleClockTimer=null;}
  if(battleState) battleState.active=false;
}

function closeModal(){
  cleanupGames();
  qs('#modal').classList.remove('show');
}

function toast(text){
  const e=qs('#toast');
  e.textContent=text;
  e.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>e.classList.remove('show'),2600);
}

function reward(points,xp,msg='Награда получена'){
  state.points+=points;state.xp+=xp;save();toast(`${msg}: +${points} P · +${xp} XP`);
}

function openRadio(){window.open(RADIO_URL,'_blank','noopener');}

function showNews(i){
  const news=[
    ['FIT ONLINE запущен','Это первая полноценная версия внутреннего развлекательного портала. Разделы открываются отдельными экранами, мини-игры начисляют очки, а магазин списывает поинты.'],
    ['Битва смен обновлена','Теперь это настоящая мини-игра: за 8 секунд нужно натапать больше очков, чем соперник. Соперник играет параллельно.'],
    ['TOMMART RADIO в одном касании','Кнопки радио на главной и в меню открывают уже готовый эфир TOMMART в новой вкладке.']
  ][i];
  modal(news[0],`<p>${news[1]}</p><button class="btn btn-blue" onclick="closeModal()">ПОНЯТНО</button>`);
}

const people={
  'Алексей':['Склад №7','12 560','23','Легенда смены'],
  'Марина':['Склад №2','9 870','21','Командный игрок'],
  'Игорь':['Логистика','8 430','19','Мастер скорости'],
  'Светлана':['Офис','6 210','18','Король квиза'],
  'Дмитрий':['Приёмка','5 740','17','Без опозданий'],
  'Анна':['Комплектовка','4 980','16','Коллекционер']
};

function showProfile(name){
  const p=people[name];
  modal(name,`<div style="text-align:center"><div class="avatar" style="width:86px;height:86px;margin:10px auto;font-size:26px">${name[0]}</div><h3>${p[0]}</h3><p>${p[3]}</p><div class="profile-stats"><div class="profile-stat"><b>${p[1]}</b><small>ПОИНТОВ</small></div><div class="profile-stat"><b>${p[2]}</b><small>УРОВЕНЬ</small></div></div></div>`);
}

function battleGame(){
  cleanupGames();
  const enemies=['Смена №2','Приёмка','Комплектовка','Логистика','Ночная смена'];
  const enemy=enemies[Math.floor(Math.random()*enemies.length)];
  battleState={user:0,enemy:0,active:false,endAt:0,enemyName:enemy};
  modal('Битва смен',`
    <style>
      .battle-board{display:grid;gap:14px}.battle-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}.battle-side{padding:14px;border:1px solid #294158;border-radius:14px;background:#071019;text-align:center}.battle-side b{font-size:28px;display:block}.battle-side small{color:#8998a9}.battle-vsmark{font-weight:1000;color:#ff2b88}.battle-track{height:16px;background:#111c27;border-radius:20px;overflow:hidden;display:flex;border:1px solid #253b50}.battle-you{width:50%;background:linear-gradient(90deg,#0d65ca,#2d9cff);transition:.15s}.battle-enemy{width:50%;background:linear-gradient(90deg,#ff2b88,#9b1554);transition:.15s}.battle-time{text-align:center;font-weight:1000;font-size:18px}.battle-hit{width:100%;height:120px;font-size:22px;user-select:none;-webkit-user-select:none;touch-action:manipulation}.battle-hint{text-align:center;color:#8998a9;font-size:12px;margin:0}
    </style>
    <div class="battle-board">
      <p class="battle-hint">После старта у тебя 8 секунд. Жми кнопку как можно быстрее.</p>
      <div class="battle-vs">
        <div class="battle-side"><small>ТЫ</small><b id="battleUser">0</b></div>
        <div class="battle-vsmark">VS</div>
        <div class="battle-side"><small>${enemy}</small><b id="battleEnemy">0</b></div>
      </div>
      <div class="battle-track"><div id="battleYouBar" class="battle-you"></div><div id="battleEnemyBar" class="battle-enemy"></div></div>
      <div class="battle-time" id="battleTime">ГОТОВ?</div>
      <button id="battleButton" class="btn btn-pink battle-hit" onclick="startBattle()">НАЧАТЬ БИТВУ</button>
    </div>`);
}

function startBattle(){
  if(!battleState || battleState.active) return;
  battleState.user=0;battleState.enemy=0;battleState.active=true;battleState.endAt=performance.now()+8000;
  const btn=qs('#battleButton');
  if(!btn) return;
  btn.textContent='АТАКА!';
  btn.onclick=battleHit;
  updateBattleUI();
  battleEnemyTimer=setInterval(()=>{
    if(!battleState?.active) return;
    const roll=Math.random();
    battleState.enemy+=roll>.82?2:roll>.14?1:0;
    updateBattleUI();
  },260+Math.random()*100);
  battleClockTimer=setInterval(()=>{
    if(!battleState?.active) return;
    const left=Math.max(0,battleState.endAt-performance.now());
    const t=qs('#battleTime');
    if(t)t.textContent=(left/1000).toFixed(1)+' сек';
    if(left<=0) finishBattle();
  },50);
}

function battleHit(){
  if(!battleState?.active) return;
  battleState.user+=Math.random()>.9?2:1;
  if(navigator.vibrate) navigator.vibrate(8);
  updateBattleUI();
}

function updateBattleUI(){
  if(!battleState) return;
  const u=qs('#battleUser'),e=qs('#battleEnemy');
  if(u)u.textContent=battleState.user;
  if(e)e.textContent=battleState.enemy;
  const total=Math.max(1,battleState.user+battleState.enemy);
  const pct=Math.max(8,Math.min(92,battleState.user/total*100));
  const ub=qs('#battleYouBar'),eb=qs('#battleEnemyBar');
  if(ub)ub.style.width=pct+'%';
  if(eb)eb.style.width=(100-pct)+'%';
}

function finishBattle(){
  if(!battleState?.active) return;
  battleState.active=false;
  if(battleEnemyTimer){clearInterval(battleEnemyTimer);battleEnemyTimer=null;}
  if(battleClockTimer){clearInterval(battleClockTimer);battleClockTimer=null;}
  state.games++;
  const diff=battleState.user-battleState.enemy;
  const win=diff>0;
  const draw=diff===0;
  let p=0,x=20,title='ПОРАЖЕНИЕ',color='var(--pink)';
  if(win){p=Math.min(140,70+Math.max(0,diff)*3);x=130;title='ПОБЕДА';color='var(--green)';}
  else if(draw){p=35;x=60;title='НИЧЬЯ';color='var(--gold)';}
  state.points+=p;state.xp+=x;save();
  modal('Битва смен',`<p>Соперник: <b>${battleState.enemyName}</b></p><div class="result" style="font-size:27px;color:${color}">${title}</div><div class="profile-stats"><div class="profile-stat"><b>${battleState.user}</b><small>ТВОИ УДАРЫ</small></div><div class="profile-stat"><b>${battleState.enemy}</b><small>СОПЕРНИК</small></div></div><p>Награда: <b>+${p} P</b> и <b>+${x} XP</b>.</p><button class="btn btn-blue" style="width:100%" onclick="battleGame()">СЫГРАТЬ ЕЩЁ</button>`);
}

function wheelGame(){
  cleanupGames();
  wheelSpinning=false;
  modal('Колесо судьбы',`
    <style>
      .wheel-wrap{display:grid;place-items:center;gap:16px}.wheel-stage{position:relative;width:280px;height:280px;max-width:80vw;max-height:80vw}.wheel-pointer{position:absolute;z-index:3;left:50%;top:-8px;transform:translateX(-50%);width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-top:0;border-bottom:30px solid #fff;filter:drop-shadow(0 0 8px rgba(255,255,255,.35))}.fortune-wheel{width:100%;height:100%;border-radius:50%;border:8px solid #111b26;box-shadow:0 0 0 2px #34506a,0 20px 50px rgba(0,0,0,.45),0 0 35px rgba(255,43,136,.14);background:conic-gradient(#ff2b88 0 45deg,#153f67 45deg 90deg,#8b2bd9 90deg 135deg,#184f3c 135deg 180deg,#ff8c42 180deg 225deg,#1e73be 225deg 270deg,#9f174f 270deg 315deg,#394759 315deg 360deg);transition:transform 4.2s cubic-bezier(.12,.72,.08,1)}.wheel-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:#08111a;border:4px solid #fff;color:#fff;font-weight:1000;z-index:2}.wheel-result{min-height:28px;text-align:center;font-weight:900;color:#cfd8e2}
    </style>
    <div class="wheel-wrap">
      <div class="wheel-stage"><div class="wheel-pointer"></div><div id="fortuneWheel" class="fortune-wheel"></div><div class="wheel-center">FIT</div></div>
      <div id="wheelResult" class="wheel-result">Нажми «КРУТИТЬ»</div>
      <button id="wheelButton" class="btn btn-pink" style="width:100%" onclick="spinWheel()">КРУТИТЬ КОЛЕСО</button>
    </div>`);
}

const wheelPrizes=[
  {label:'+25 P',p:25,x:20},
  {label:'+50 P',p:50,x:40},
  {label:'+100 P',p:100,x:90},
  {label:'+250 XP',p:0,x:250},
  {label:'ДЖЕКПОТ +300 P',p:300,x:180},
  {label:'+75 P',p:75,x:60},
  {label:'+150 XP',p:0,x:150},
  {label:'ПУСТО',p:0,x:0}
];

function spinWheel(){
  if(wheelSpinning) return;
  wheelSpinning=true;
  const wheel=qs('#fortuneWheel'),btn=qs('#wheelButton'),out=qs('#wheelResult');
  if(!wheel||!btn||!out)return;
  btn.disabled=true;btn.textContent='КРУТИТСЯ...';out.textContent='';
  const idx=Math.floor(Math.random()*wheelPrizes.length);
  const segment=360/wheelPrizes.length;
  const turns=6+Math.floor(Math.random()*3);
  const target=turns*360+(360-(idx*segment+segment/2));
  requestAnimationFrame(()=>wheel.style.transform=`rotate(${target}deg)`);
  setTimeout(()=>{
    const p=wheelPrizes[idx];
    state.games++;state.points+=p.p;state.xp+=p.x;save();
    out.innerHTML=`Выпало: <b style="color:var(--pink)">${p.label}</b>`;
    btn.disabled=false;btn.textContent='КРУТИТЬ ЕЩЁ';wheelSpinning=false;
    toast(p.p||p.x?`Выигрыш: ${p.label}`:'Пустой сектор');
  },4300);
}

function reactionGame(){
  cleanupGames();
  modal('Реакция',`<p>Нажми «СТАРТ». Затем жди зелёного сигнала и нажми как можно быстрее.</p><button id="reactBtn" class="btn btn-pink" style="width:100%;height:120px;font-size:20px;touch-action:manipulation" onclick="startReaction()">СТАРТ</button>`);
}

function startReaction(){
  if(reactionTimer){clearTimeout(reactionTimer);reactionTimer=null;}
  const b=qs('#reactBtn');if(!b)return;
  b.textContent='ЖДИ...';b.className='btn';b.style.background='#111923';
  b.onclick=earlyReaction;
  reactionTimer=setTimeout(()=>{
    reactionStart=performance.now();
    b.textContent='ЖМИ!';b.className='btn btn-green';b.style.background='linear-gradient(135deg,#168f57,#42dd8b)';
    b.onclick=finishReaction;
    reactionTimer=null;
  },1200+Math.random()*2200);
}

function earlyReaction(){
  if(reactionTimer){clearTimeout(reactionTimer);reactionTimer=null;}
  const b=qs('#reactBtn');if(!b)return;
  b.textContent='СЛИШКОМ РАНО — ЕЩЁ РАЗ';b.className='btn btn-pink';b.style.background='';b.onclick=startReaction;
}

function finishReaction(){
  const ms=Math.round(performance.now()-reactionStart);
  state.games++;
  const pts=ms<220?140:ms<280?110:ms<380?75:ms<520?45:25;
  state.points+=pts;state.xp+=pts;save();
  modal('Результат реакции',`<div class="result" style="font-size:28px;color:var(--blue)">${ms} мс</div><p>Награда: +${pts} P и +${pts} XP.</p><button class="btn btn-blue" style="width:100%" onclick="reactionGame()">ЕЩЁ РАЗ</button>`);
}

function codeGame(){
  if(state.codeWon){modal('Угадай код','<p>Сегодняшняя награда уже получена на этом устройстве.</p><button class="btn btn-blue" onclick="closeModal()">ЗАКРЫТЬ</button>');return;}
  modal('Угадай код',`<p>Подсказка: сумма цифр равна <b>12</b>, средняя цифра — <b>5</b>, а первая цифра на <b>1</b> больше последней.</p><input id="codeInput" class="input" inputmode="numeric" maxlength="3" placeholder="Введите код"><button class="btn btn-pink" style="width:100%;margin-top:10px" onclick="checkCode()">ПРОВЕРИТЬ</button>`);
}

function checkCode(){
  const input=qs('#codeInput');if(!input)return;
  const v=input.value.trim();
  if(v==='453'){
    state.codeWon=true;state.points+=100;state.xp+=250;save();
    modal('Код разгадан','<div class="result" style="color:var(--green);font-size:24px">ВЕРНО: 453</div><p>+100 поинтов и +250 XP начислены.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ЗАБРАТЬ</button>');
  }else{
    toast('Код неверный — попробуй ещё');
    input.focus();
  }
}

function buy(name,price){
  if(state.points<price){
    modal('Недостаточно поинтов',`<p>Для «${name}» нужно ${price.toLocaleString('ru-RU')} P. Сейчас у тебя ${state.points.toLocaleString('ru-RU')} P.</p><button class="btn btn-blue" onclick="closeModal();route('games')">ЗАРАБОТАТЬ В ИГРАХ</button>`);return;
  }
  state.points-=price;state.purchases++;save();
  modal('Покупка оформлена',`<div class="result" style="color:var(--green)">${name}</div><p>Списано ${price.toLocaleString('ru-RU')} поинтов. Пока без базы это демонстрационная покупка.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ГОТОВО</button>`);
}

function joinEvent(name){
  reward(35,60,'Участие зарегистрировано');
  modal(name,`<p>Ты записан в событие. Для демонстрации начислен бонус участника.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ОТЛИЧНО</button>`);
}

function dailyBonus(){
  const key='fit_bonus_'+new Date().toISOString().slice(0,10);
  if(localStorage.getItem(key)){toast('Сегодняшний бонус уже забран');return;}
  localStorage.setItem(key,'1');reward(50,75,'Ежедневный бонус');
}

function updateTimer(){
  const e=qs('#eventTimer');if(!e)return;
  const now=new Date(),end=new Date();end.setHours(23,59,59,999);
  let s=Math.max(0,Math.floor((end-now)/1000));
  const h=String(Math.floor(s/3600)).padStart(2,'0');s%=3600;
  const m=String(Math.floor(s/60)).padStart(2,'0'),sec=String(s%60).padStart(2,'0');
  e.textContent=`${h}:${m}:${sec}`;
}

function init(){
  qsa('[data-route]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
  qs('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  renderState();
  setInterval(updateTimer,1000);updateTimer();
  const hash=location.hash.replace('#','');
  route(['home','news','profiles','games','rating','achievements','shop','events'].includes(hash)?hash:'home');
}

document.addEventListener('DOMContentLoaded',init);
