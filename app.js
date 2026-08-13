const RADIO_URL='https://yalacom.github.io/radiotommart/v16.html';
const state={
  points:Number(localStorage.getItem('fit_points')||1250),
  xp:Number(localStorage.getItem('fit_xp')||7540),
  games:Number(localStorage.getItem('fit_games')||0),
  purchases:Number(localStorage.getItem('fit_purchases')||0),
  streak:Number(localStorage.getItem('fit_streak')||12),
  codeWon:localStorage.getItem('fit_code_won')==='1'
};
const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
function save(){
  localStorage.setItem('fit_points',state.points);localStorage.setItem('fit_xp',state.xp);localStorage.setItem('fit_games',state.games);localStorage.setItem('fit_purchases',state.purchases);localStorage.setItem('fit_streak',state.streak);localStorage.setItem('fit_code_won',state.codeWon?'1':'0');renderState();
}
function renderState(){
  qsa('[data-points]').forEach(e=>e.textContent=state.points.toLocaleString('ru-RU'));
  const level=23+Math.floor(Math.max(0,state.xp-7540)/10000); const inLevel=state.xp%10000;
  qsa('[data-level]').forEach(e=>e.textContent=level);
  qsa('[data-xp]').forEach(e=>e.textContent=inLevel.toLocaleString('ru-RU')+' / 10 000 XP');
  qsa('[data-xpbar]').forEach(e=>e.style.width=Math.max(3,inLevel/100)+'%');
  qsa('[data-gamesbar]').forEach(e=>e.style.width=Math.min(100,state.games*10)+'%');
  qsa('[data-shopbar]').forEach(e=>e.style.width=Math.min(100,state.purchases*20)+'%');
  qsa('[data-streak]').forEach(e=>e.textContent=state.streak);
  const result=qs('#yourRankScore');if(result)result.textContent=state.points.toLocaleString('ru-RU')+' P';
}
function route(name){
  qsa('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
  qsa('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===name));
  window.scrollTo({top:0,behavior:'smooth'});
  history.replaceState(null,'','#'+name);
}
function modal(title,html){qs('#modalTitle').textContent=title;qs('#modalBody').innerHTML=html;qs('#modal').classList.add('show')}
function closeModal(){qs('#modal').classList.remove('show')}
function toast(text){const e=qs('#toast');e.textContent=text;e.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove('show'),2600)}
function reward(points,xp,msg='Награда получена'){state.points+=points;state.xp+=xp;save();toast(`${msg}: +${points} P · +${xp} XP`)}
function openRadio(){window.open(RADIO_URL,'_blank','noopener')}
function showNews(i){
 const news=[
  ['FIT ONLINE запущен','Это первая полноценная версия внутреннего развлекательного портала. Теперь разделы открываются как отдельные экраны, мини-игры начисляют очки, а магазин действительно списывает поинты.'],
  ['Битва смен началась','Соперник выбирается случайно. Победа приносит очки и опыт. Результаты сохраняются прямо на устройстве до подключения общей базы.'],
  ['TOMMART RADIO в одном касании','Кнопки радио на главной и в меню открывают уже готовый эфир TOMMART в новой вкладке.']
 ][i];
 modal(news[0],`<p>${news[1]}</p><button class="btn btn-blue" onclick="closeModal()">ПОНЯТНО</button>`)
}
const people={
 'Алексей':['Склад №7','12 560','23','Легенда смены'],
 'Марина':['Склад №2','9 870','21','Командный игрок'],
 'Игорь':['Логистика','8 430','19','Мастер скорости'],
 'Светлана':['Офис','6 210','18','Король квиза'],
 'Дмитрий':['Приёмка','5 740','17','Без опозданий'],
 'Анна':['Комплектовка','4 980','16','Коллекционер']
};
function showProfile(name){const p=people[name];modal(name,`<div style="text-align:center"><div class="avatar" style="width:86px;height:86px;margin:10px auto;font-size:26px">${name[0]}</div><h3>${p[0]}</h3><p>${p[3]}</p><div class="profile-stats"><div class="profile-stat"><b>${p[1]}</b><small>ПОИНТОВ</small></div><div class="profile-stat"><b>${p[2]}</b><small>УРОВЕНЬ</small></div></div></div>`)}
function battleGame(){
 const enemies=['Смена №2','Приёмка','Комплектовка','Логистика'];const enemy=enemies[Math.floor(Math.random()*enemies.length)];const win=Math.random()>.38;state.games++;
 if(win){state.points+=80;state.xp+=130;save();modal('Битва смен',`<p>Соперник: <b>${enemy}</b></p><div class="result" style="color:var(--green);font-size:26px">ПОБЕДА</div><p>+80 поинтов и +130 XP уже начислены.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ЗАБРАТЬ</button>`)}
 else{save();modal('Битва смен',`<p>Соперник: <b>${enemy}</b></p><div class="result danger" style="font-size:22px">ПОРАЖЕНИЕ</div><p>Сегодня соперник оказался сильнее. Можно сыграть ещё раз.</p><button class="btn btn-pink" style="width:100%" onclick="closeModal();battleGame()">РЕВАНШ</button>`)}
}
function wheelGame(){
 const prizes=[['+25 P',25,20],['+50 P',50,50],['+100 P',100,90],['+250 XP',0,250],['ДЖЕКПОТ +300 P',300,180],['ПУСТО',0,0]];const p=prizes[Math.floor(Math.random()*prizes.length)];state.games++;state.points+=p[1];state.xp+=p[2];save();modal('Колесо судьбы',`<p>Колесо остановилось на:</p><div class="result" style="font-size:26px;color:${p[1]||p[2]?'var(--pink)':'var(--muted)'}">${p[0]}</div><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ГОТОВО</button>`)
}
let reactionStart=0,reactionTimer=null;
function reactionGame(){
 modal('Реакция',`<p>Нажми «СТАРТ». Затем жди, пока поле станет активным, и нажми как можно быстрее.</p><button id="reactBtn" class="btn btn-pink" style="width:100%;height:110px;font-size:20px" onclick="startReaction()">СТАРТ</button>`)
}
function startReaction(){const b=qs('#reactBtn');b.textContent='ЖДИ...';b.className='btn';b.onclick=()=>{toast('Рано! Попробуй ещё раз');startReaction()};clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>{reactionStart=performance.now();b.textContent='ЖМИ!';b.className='btn btn-green';b.onclick=finishReaction},1200+Math.random()*2200)}
function finishReaction(){const ms=Math.round(performance.now()-reactionStart);state.games++;let pts=ms<260?120:ms<380?70:35;state.points+=pts;state.xp+=pts;save();modal('Результат реакции',`<div class="result" style="font-size:28px;color:var(--blue)">${ms} мс</div><p>Награда: +${pts} P и +${pts} XP.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ГОТОВО</button>`)}
function codeGame(){if(state.codeWon){modal('Угадай код','<p>Сегодняшняя награда уже получена на этом устройстве.</p><button class="btn btn-blue" onclick="closeModal()">ЗАКРЫТЬ</button>');return}modal('Угадай код',`<p>Подсказка: сумма цифр равна <b>12</b>, первая цифра на 2 больше последней, а средняя цифра — <b>5</b>.</p><input id="codeInput" class="input" inputmode="numeric" maxlength="3" placeholder="Введите код"><button class="btn btn-pink" style="width:100%;margin-top:10px" onclick="checkCode()">ПРОВЕРИТЬ</button>`)}
function checkCode(){const v=qs('#codeInput').value.trim();if(v==='453'){state.codeWon=true;state.points+=100;state.xp+=250;save();modal('Код разгадан','<div class="result" style="color:var(--green);font-size:24px">ВЕРНО: 453</div><p>+100 поинтов и +250 XP начислены.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ЗАБРАТЬ</button>')}else{toast('Код неверный — попробуй ещё')}}
function buy(name,price){if(state.points<price){modal('Недостаточно поинтов',`<p>Для «${name}» нужно ${price.toLocaleString('ru-RU')} P. Сейчас у тебя ${state.points.toLocaleString('ru-RU')} P.</p><button class="btn btn-blue" onclick="closeModal();route('games')">ЗАРАБОТАТЬ В ИГРАХ</button>`);return}state.points-=price;state.purchases++;save();modal('Покупка оформлена',`<div class="result" style="color:var(--green)">${name}</div><p>Списано ${price.toLocaleString('ru-RU')} поинтов. Пока без базы это демонстрационная покупка, но логика уже работает.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ГОТОВО</button>`)}
function joinEvent(name){reward(35,60,'Участие зарегистрировано');modal(name,`<p>Ты записан в событие. Для демонстрации начислен бонус участника.</p><button class="btn btn-blue" style="width:100%" onclick="closeModal()">ОТЛИЧНО</button>`)}
function dailyBonus(){const key='fit_bonus_'+new Date().toISOString().slice(0,10);if(localStorage.getItem(key)){toast('Сегодняшний бонус уже забран');return}localStorage.setItem(key,'1');reward(50,75,'Ежедневный бонус')}
function updateTimer(){const e=qs('#eventTimer');if(!e)return;const now=new Date(),end=new Date();end.setHours(23,59,59,999);let s=Math.max(0,Math.floor((end-now)/1000));const h=String(Math.floor(s/3600)).padStart(2,'0');s%=3600;const m=String(Math.floor(s/60)).padStart(2,'0'),sec=String(s%60).padStart(2,'0');e.textContent=`${h}:${m}:${sec}`}
function init(){
 qsa('[data-route]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
 qs('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
 renderState();setInterval(updateTimer,1000);updateTimer();
 const hash=location.hash.replace('#','');route(['home','news','profiles','games','rating','achievements','shop','events'].includes(hash)?hash:'home');
}
document.addEventListener('DOMContentLoaded',init);