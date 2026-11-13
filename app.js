'use strict';
const STORE='tokyo-visit-2026-v2';const OLD_STORE='tokyo-visit-2026-v1';const OLD_ARCHIVE='tokyo-visit-2026-v1-archive';
const COPY=(x)=>JSON.parse(JSON.stringify(x));
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const weekday=d=>WEEK[new Date(d+'T12:00:00+09:00').getDay()];
const displayDay=i=>'11/'+String(15+i).padStart(2,'0')+'（'+['日','一','二','三','四','五','六'][i]+'）';
const kindNames={official:'正式',plan:'交通／休息',free:'自由活動',meal:'用餐'};
const statusNames={confirmed:'已確認',reserved:'已預約',planned:'規劃中',unconfirmed:'待確認',cancelled:'已取消'};
const dayIndex=d=>TRIP_DATES.indexOf(d);
const makeId=prefix=>prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
const sortEvents=ev=>ev.slice().sort((a,b)=>(a.sortTime||a.time||'').localeCompare(b.sortTime||b.time||''));
const getEvent=id=>db.events.find(x=>x.id===id);
let photoLink='',db,selectedDay=0,tab='home',eventEditor=null,questionEditor=null,editingTravel=false,editingMeal=null,foodFilter='all',openLocation='hotel',updatingWorker=null,toastTimer=null;
function baseData(){return {schema:2,seedRev:SEED_REV,events:COPY(DEFAULT_EVENTS),questions:COPY(DEFAULT_QUESTIONS),meetings:COPY(DEFAULT_MEETINGS),meals:Object.fromEntries(Object.keys(DEFAULT_MEALS).map(day=>[day,[]])),deletedEventIds:[],deletedQuestionIds:[],deletedMealIds:[],notes:{},shopping:COPY(DEFAULT_SHOPPING),expenses:[],foodSaved:[],giftChecked:[],legacyImported:false};}
function normalize(d){const x=baseData();if(!d||!Array.isArray(d.events))return x;return {...x,...d,events:Array.isArray(d.events)?d.events:x.events,questions:d.questions&&typeof d.questions==='object'?d.questions:x.questions,meetings:d.meetings&&typeof d.meetings==='object'?d.meetings:x.meetings,meals:d.meals&&typeof d.meals==='object'?d.meals:x.meals,deletedEventIds:Array.isArray(d.deletedEventIds)?d.deletedEventIds:[],deletedQuestionIds:Array.isArray(d.deletedQuestionIds)?d.deletedQuestionIds:[],deletedMealIds:Array.isArray(d.deletedMealIds)?d.deletedMealIds:[],notes:d.notes&&typeof d.notes==='object'?d.notes:{},shopping:Array.isArray(d.shopping)?d.shopping:x.shopping,expenses:Array.isArray(d.expenses)?d.expenses:[],foodSaved:Array.isArray(d.foodSaved)?d.foodSaved:[],giftChecked:Array.isArray(d.giftChecked)?d.giftChecked:[]};}
function appendArchivedQuestion(d,day,q){
 const heading='【舊版提問紀錄已轉為自由筆記】';
 const lines=[heading,'原問題：'+String(q.text||''),q.asked?'狀態：已詢問':'',q.answer?'日方回答：'+q.answer:'',q.followup?'後續事項：'+q.followup:''].filter(Boolean).join('\n');
 const key='ask'+day,old=String(d.notes[key]||'');
 if(!old.includes(lines))d.notes[key]=(old?old+'\n\n':'')+lines;
}
function refreshSeed(d){ // Refresh only untouched default items. All user edits/custom entries survive.
 const oldEvents=new Map(d.events.map(e=>[e.id,e]));
 // Remove only retired, untouched preset train times. If a user edited them, preserve as custom records.
 d.events=d.events.filter(e=>!RETIRED_DEFAULT_EVENT_IDS.includes(e.id)||e.edited);
 const defaults=DEFAULT_EVENTS.filter(e=>!d.deletedEventIds.includes(e.id)).map(e=>{let old=oldEvents.get(e.id);return old?.edited?old:COPY(e)});
 d.events=[...defaults,...d.events.filter(e=>!DEFAULT_EVENTS.some(s=>s.id===e.id))];
 // Source refresh: official 2026-11-12 question list only for IIS (day 1) and Toda (day 3).
 // Any answers/individual questions from JAMA, RTRI, NTSEL become plain notes rather than disappearing.
 for(const key of ['1','2','3','4','5']){
  const old=Array.isArray(d.questions[key])?d.questions[key]:[];
  const wanted=DEFAULT_QUESTIONS[key]||[];
  const wantedIds=new Set(wanted.map(q=>q.id));
  const found=new Map(old.map(q=>[q.id,q]));
  if(key==='1'||key==='3'){
   const refreshed=wanted.filter(q=>!d.deletedQuestionIds.includes(q.id)).map(q=>{
    const prev=found.get(q.id);if(!prev)return COPY(q);
    // Explicit edits to the question text win, while legacy default wording is upgraded.
    const userChangedText=!!prev.text&&prev.text!==PREVIOUS_DEFAULT_QUESTION_TEXT[q.id]&&prev.text!==q.text;
    return {...COPY(q),asked:!!prev.asked,answer:prev.answer||'',followup:prev.followup||'',text:userChangedText?prev.text:q.text,edited:!!prev.edited||userChangedText};
   });
   for(const q of old.filter(q=>!wantedIds.has(q.id))){
    if(PREVIOUS_DEFAULT_QUESTION_TEXT[q.id]){
     if(q.answer||q.followup||q.asked)appendArchivedQuestion(d,key,q);
    }else refreshed.push(q); // User-added questions stay with the two relevant visits.
   }
   d.questions[key]=refreshed;
  }else{
   for(const q of old){
    const isOldPreset=Object.prototype.hasOwnProperty.call(PREVIOUS_DEFAULT_QUESTION_TEXT,q.id);
    if(!isOldPreset||q.answer||q.followup||q.asked||
       (q.text&&q.text!==PREVIOUS_DEFAULT_QUESTION_TEXT[q.id]))appendArchivedQuestion(d,key,q);
   }
   d.questions[key]=[];
  }
 }
 // V2.7: Old default meal suggestions duplicated the 23 curated restaurants.
 // Remove only unedited legacy presets; keep every custom or edited meal untouched.
 for(const key of Object.keys(DEFAULT_MEALS)){
  const old=Array.isArray(d.meals[key])?d.meals[key]:[];
  d.meals[key]=old.filter(m=>m&&(!/^meal-\d+-\d+$/.test(String(m.id))||m.edited));
 }
 for(const key of Object.keys(DEFAULT_MEETINGS))if(!d.meetings[key])d.meetings[key]=COPY(DEFAULT_MEETINGS[key]);
 d.seedRev=SEED_REV;return d;
}
function legacyUpgrade(old){const x=baseData();x.legacyImported=true;
 if(Array.isArray(old.shopping))x.shopping=old.shopping.map((s,i)=>({...s,id:'legacy-shop-'+i}));
 if(Array.isArray(old.expenses))x.expenses=COPY(old.expenses);
 if(old.notes&&typeof old.notes==='object')x.notes=COPY(old.notes);
 if(Array.isArray(old.events)){
  for(const e of old.events){const signature=[e.day,e.time,e.title].join('|');if(LEGACY_DEFAULT_EVENT_KEYS.has(signature))continue;
   const id=makeId('legacy-event');x.events.push({id,day:Number(e.day)||0,time:e.time||'12:00',end:e.end||'',title:e.title||'舊版自訂行程',place:e.place||'',kind:e.kind==='official'?'plan':(e.kind==='optional'?'free':e.kind||'free'),status:'unconfirmed',detail:(e.detail||'')+'\n【由舊版保留，請核對是否仍需安排】',edited:true,legacy:true});
  }
 }
 if(old.checkedQuestions&&typeof old.checkedQuestions==='object'){for(const [key,checked] of Object.entries(old.checkedQuestions)){if(!checked)continue;const [day,idx]=key.split(':').map(Number);const sourceQ=old.questions?.[day]?.[idx];const match=(x.questions[day]||[]).find(q=>q.text===sourceQ);if(match){match.asked=true;match.edited=true}}}
 if(old.questions&&typeof old.questions==='object'){
  for(const key of Object.keys(old.questions)){
   if(!Array.isArray(old.questions[key]))continue;
   for(const [index,q] of old.questions[key].entries()){
    const checked=!!old.checkedQuestions?.[key+':'+index];
    const preset=(LEGACY_DEFAULT_QUESTIONS[key]||[]).includes(q);
    if(['2','4','5'].includes(key)){
      if(!preset||checked)appendArchivedQuestion(x,key,{text:String(q),asked:checked});
      continue;
    }
    if(preset)continue;
    (x.questions[key]??=[]).push({id:makeId('legacy-q'),text:String(q),asked:checked,answer:'',followup:'',edited:true});
   }
  }
 }
 return x;
}
function safeLocalRead(key){try{const v=localStorage.getItem(key);return v?JSON.parse(v):null}catch{return null}}
function initData(){const existing=safeLocalRead(STORE);if(existing){db=normalize(existing);if(db.seedRev!==SEED_REV){db=refreshSeed(db);save({silent:true})}return}
 const legacy=safeLocalRead(OLD_STORE);if(legacy&&Array.isArray(legacy.events)){try{localStorage.setItem(OLD_ARCHIVE,JSON.stringify(legacy))}catch{}db=legacyUpgrade(legacy)}else db=baseData();save({silent:true});}
function save({silent=false}={}){try{localStorage.setItem(STORE,JSON.stringify(db));return true}catch{if(!silent)toast('儲存失敗：請立即匯出備份並檢查 Safari 儲存空間');return false}}
function toast(m){const el=$('#toast');el.textContent=m;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
function japanNow(){const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});const p=Object.fromEntries(fmt.formatToParts(new Date()).map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,year:Number(p.year),month:Number(p.month),day:Number(p.day),hour:Number(p.hour),minute:Number(p.minute)};}
function diffMinutes(day,t){const j=japanNow();const tms=Date.UTC(2026,10,15+day,Number(t.slice(0,2)),Number(t.slice(3)));const nms=Date.UTC(j.year,j.month-1,j.day,j.hour,j.minute);return Math.round((tms-nms)/60000)}
function countdown(n){if(n<0)return'時間已過';if(n<60)return`${n} 分鐘`;if(n<1440)return`${Math.floor(n/60)} 小時 ${n%60} 分`;return`${Math.floor(n/1440)} 天 ${Math.floor(n%1440/60)} 小時`;}
function meetingList(){return Object.entries(db.meetings).map(([d,m])=>({day:Number(d),...m,event:getEvent(m.eventId)})).filter(x=>x.event&&x.event.status!=='cancelled'&&!db.deletedEventIds.includes(x.eventId)).sort((a,b)=>a.day-b.day);}
function firstUpcomingMeeting(){return meetingList().find(x=>diffMinutes(x.day,x.event.time)>=0)||null;}
function mapsLink(q,app='google',dir=true){const s=String(q||'').trim();return app==='apple'?'https://maps.apple.com/?'+(dir?'daddr=':'q=')+encodeURIComponent(s)+(dir?'&dirflg=r':''):'https://www.google.com/maps/'+(dir?'dir/?api=1&destination=':'search/?api=1&query=')+encodeURIComponent(s)+(dir?'&travelmode=transit':'');}
function online(){return navigator.onLine}
function mapButtons(q){return `<div class="actions"><a class="btn secondary" href="${attr(mapsLink(q,'google'))}" data-external="true" target="_blank" rel="noopener noreferrer">Google 路線</a><a class="btn secondary" href="${attr(mapsLink(q,'apple'))}" data-external="true" target="_blank" rel="noopener noreferrer">Apple 路線</a><button type="button" class="btn ghost" data-action="copy" data-value="${attr(q)}">複製地點</button></div>`;}
function spotSearchLinks(spot){
 const query=[spot.addr,spot.name].filter(Boolean).join(' ');
 const site=spot.source?`<a class="btn ghost smallbtn" href="${attr(spot.source)}" target="_blank" rel="noopener noreferrer">店家／參考資料</a>`:'';
 return `<div class="actions"><a class="btn secondary smallbtn" href="${attr(mapsLink(query,'google',false))}" target="_blank" rel="noopener noreferrer">Google 地圖</a><a class="btn secondary smallbtn" href="${attr(mapsLink(query,'apple',false))}" target="_blank" rel="noopener noreferrer">Apple 地圖</a>${site}</div>`;
}
function photoWidget(link){return `<div class="photo-block"><div class="actions photo-actions"><button type="button" class="btn secondary smallbtn" data-action="camera-photo" data-photo-link="${attr(link)}">拍照</button><button type="button" class="btn ghost smallbtn" data-action="add-photo" data-photo-link="${attr(link)}">選取照片</button></div><div class="photo-strip" data-photo-strip="${attr(link)}"><span class="mini-note">載入照片中……</span></div></div>`;}
function foodCard(spot,legacy=false){
 const saved=db.foodSaved.includes(spot.id);
 return `<section class="rec-item"><div class="rec-tags"><span class="pill ${spot.id==='food-komani'?'confirmed':'planned'}">${esc(spot.slot)}</span><span class="mini-note">${esc(spot.area)}</span>${legacy?'<span class="pill unconfirmed">舊版額外收藏</span>':''}</div><div class="rec-title">${esc(spot.name)}</div><div class="rec-text"><b>吃什麼：</b>${esc(spot.food)}</div><div class="rec-text"><b>營業參考：</b>${esc(spot.hours)}</div><p class="rec-tip">${esc(spot.tip)}</p><div class="mini-note">${esc(spot.addr)}</div>${spotSearchLinks(spot)}<button class="btn ${saved?'secondary':'ghost'} smallbtn" data-action="toggle-food" data-id="${attr(spot.id)}">${saved?'✓ 已加入想吃':'＋ 加入想吃'}</button>${photoWidget('food:'+spot.id)}</section>`;
}
function customMealCard(m){
 const saved=db.foodSaved.includes(m.id);
 return `<section class="rec-item"><div class="rec-tags"><span class="pill unconfirmed">自行新增／舊版修改</span><span class="mini-note">${esc(m.area)}</span></div><div class="rec-title">${esc(m.name)}</div><p class="hint">這是你的個人候選，尚未訂位。若名稱是料理類型而非店名，導航僅供搜尋。</p>${spotSearchLinks({addr:m.area,name:m.name})}<div class="actions"><button class="btn ${saved?'secondary':'ghost'} smallbtn" data-action="toggle-food" data-id="${attr(m.id)}">${saved?'♥ 已收藏':'♡ 收藏'}</button><button class="btn secondary smallbtn" data-action="edit-meal" data-id="${attr(m.id)}">編輯</button><button class="btn danger smallbtn" data-action="delete-meal" data-id="${attr(m.id)}">刪除</button></div>${photoWidget('foodcustom:'+m.id)}</section>`;
}
function renderFoodSpots(day){
 const spots=FOOD_SPOTS[day]||[];
 const custom=db.meals[day]||[];
 const legacy=(LEGACY_EXTRA_FOOD[day]||[]).filter(s=>db.foodSaved.includes(s.id));
 const savedSpots=spots.filter(s=>db.foodSaved.includes(s.id));
 const savedCustom=custom.filter(s=>db.foodSaved.includes(s.id));
 const visibleSpots=foodFilter==='saved'?savedSpots:foodFilter==='custom'?[]:spots;
 const visibleCustom=foodFilter==='saved'?savedCustom:custom;
 const visibleLegacy=foodFilter==='custom'?[]:legacy;
 const selectedCount=visibleSpots.length+visibleCustom.length+visibleLegacy.length;
 return `<div class="card" id="food-spots"><div class="sectionhead"><h2>沿途餐廳推薦</h2><span class="pill">原名單 ${spots.length} 間</span></div><p class="hint">保留資料庫 23 間，依日期／地區排列；所有餐廳皆未訂位。原本的「我的餐廳備選」已整合到「自行新增」，舊版手動編輯項目及收藏不會遺失。</p><div class="food-filters" role="group" aria-label="餐廳篩選">${[['all','全部餐廳'],['saved','我的收藏'],['custom','自行新增']].map(([val,label])=>`<button type="button" class="btn ${foodFilter===val?'':'secondary'} smallbtn" aria-pressed="${foodFilter===val}" data-action="food-filter" data-value="${val}">${label}</button>`).join('')}</div><div class="actions" style="margin-top:5px"><button class="btn secondary smallbtn" data-action="edit-meal" data-id="new">＋ 新增自己的餐廳</button><span class="hint">本頁顯示 ${selectedCount} 筆</span></div>${day===1&&foodFilter==='all'?'<div class="notice info"><strong>東京大學 12:00 結束：</strong>校區內「食堂コマニ」是附近午餐首選；兩國及押上的候選並不在東大旁。</div>':''}${editingMeal!==null?renderMealForm(editingMeal):''}${visibleSpots.length?visibleSpots.map(s=>foodCard(s)).join(''):''}${visibleCustom.length?`<div class="subsection"><h3>自行新增／舊版個人修改（${visibleCustom.length}）</h3>${visibleCustom.map(customMealCard).join('')}</div>`:''}${visibleLegacy.length?`<details class="legacy-more"><summary>舊版額外收藏（${visibleLegacy.length}，非原資料庫 23 間）</summary>${visibleLegacy.map(s=>foodCard(s,true)).join('')}</details>`:''}${selectedCount===0&&editingMeal===null?'<div class="empty">此分類目前沒有餐廳。可切到「全部餐廳」，或新增自己的餐廳。</div>':''}</div>`;
}
function renderGiftStores(){
 const listed=new Set(GIFT_STORES.flatMap(v=>v.items.map(x=>x.id)).concat(GIFT_STORES.map(v=>v.id)));
 const legacyChecked=(db.giftChecked||[]).filter(id=>!listed.has(id));
 return `<div class="card" id="gift-stores"><div class="sectionhead"><h2>伴手禮購物地點</h2><span class="pill">${GIFT_STORES.length} 處</span></div><p class="muted">依原資料庫的 7 個<strong>購物地點</strong>整理品牌、季節商品與沿途日期。公司 20–30 人份優先考慮常溫、獨立包裝及保存期限至少兩週的選項。</p><div class="notice info"><strong>東京站注意：</strong>Gift Palette 和大丸屬改札外；GRANSTA 部分品牌在 JR 改札內。不要把兩種地點當成同一處入口。</div>${GIFT_STORES.map(spot=>{
 const checked=db.giftChecked.includes(spot.id);
 return `<section class="rec-item"><div class="rec-tags"><span class="pill">${esc(spot.best)}</span><span class="mini-note">${esc(spot.area)}</span></div><div class="rec-title">${esc(spot.name)}</div><div class="rec-text"><b>適合日期：</b>${esc(spot.days)}</div><div class="rec-text"><b>參考營業：</b>${esc(spot.hours)}</div><div class="rec-text"><b>位置／閘門：</b>${esc(spot.gate)}</div><p class="rec-tip">${esc(spot.tip)}</p>${spotSearchLinks(spot)}<label class="gift-check"><input type="checkbox" data-giftid="${attr(spot.id)}" ${checked?'checked':''}><span>${checked?'✓ 已逛過此地點':'標記已逛過此地點'}</span></label>${photoWidget('gift:'+spot.id)}<details class="gift-products"><summary>推薦品牌／商品（${spot.items.length} 項）</summary>${spot.items.map(it=>{
 const bought=db.giftChecked.includes(it.id);
 return `<div class="gift-product"><div class="gift-product-name">${esc(it.name)}</div><div class="rec-text">${esc(it.desc)}</div>${it.qty?`<div class="mini-note">${esc(it.qty)}</div>`:''}${it.note?`<div class="mini-note">${esc(it.note)}</div>`:''}<label class="gift-check"><input type="checkbox" data-giftid="${attr(it.id)}" ${bought?'checked':''}><span>${bought?'✓ 已購入':'標記已購入'}</span></label>${photoWidget('giftitem:'+it.id)}</div>`;
 }).join('')}</details></section>`;
 }).join('')}${legacyChecked.length?`<div class="notice info"><strong>舊版勾選紀錄已保留：</strong>${legacyChecked.map(id=>esc(LEGACY_GIFT_LABELS[id]||id)).join('、')}。這些不屬於本次 7 處核心清單，原始勾選仍會存在備份中。</div>`:''}</div>`;
}
function statusPill(e){let label=e.status==='confirmed'&&e.kind==='official'?'正式已確認':statusNames[e.status]||'規劃中';return `<span class="pill ${esc(e.status||'planned')}">${esc(label)}</span>`;}
function renderStrip(){const container=$('#days');container.classList.toggle('hidden',!['day','ask'].includes(tab));if(!['day','ask'].includes(tab))return;const today=dayIndex(japanNow().date);container.innerHTML=TRIP_DATES.map((d,i)=>`<button class="daybtn ${selectedDay===i?'active':''} ${today===i?'today':''}" data-action="choose-day" data-day="${i}"><small>${WEEK[i]}</small><b>${15+i}</b></button>`).join('');}
function render(){document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const subs={home:'今日重點與出發提醒',day:displayDay(selectedDay)+' · 行程',ask:displayDay(selectedDay)+' · 參訪紀錄',shop:'伴手禮地點、購物與待辦',cost:'日圓支出紀錄',more:'離線資訊與資料備份'};$('#subhead').textContent=subs[tab]+' · 日本時間';renderStrip();$('#connection').textContent=online()?'連線中':'離線';$('#connection').classList.toggle('off',!online());$('#view').innerHTML=({home:renderHome,day:renderDay,ask:renderAsk,shop:renderShopping,cost:renderCosts,more:renderMore})[tab]();PhotoVault.hydrate($('#view'));}
function renderHome(){const j=japanNow();const di=dayIndex(j.date);const useDay=di>=0?di:(j.date<TRIP_DATES[0]?0:6);const upcoming=firstUpcomingMeeting();const meetDay=upcoming?.day;const e=upcoming?.event;
 const departure=upcoming?.depart?.match(/^\d\d:\d\d$/)?upcoming.depart:null;
 const next=[...db.events].filter(x=>x.day===useDay&&x.status!=='cancelled'&&diffMinutes(x.day,x.sortTime||x.time)>-30).sort((a,b)=>(a.sortTime||a.time).localeCompare(b.sortTime||b.time))[0];
 return `<div class="card hero"><div class="eyelabel">JAPAN TIME · ${esc(j.date)} ${esc(j.time)}</div><div class="title" style="font-size:22px">${di>=0?'今天 '+displayDay(di):j.date<TRIP_DATES[0]?'距離日本參訪出發':'東京參訪已結束'}</div><p class="muted">${di>=0?'所有每日行程時間依日本當地時間顯示；航班另標臺灣時間。':'可先切換七天行程，查看集合點與需要確認的交通時間。'}</p><div class="actions"><button class="btn secondary" data-action="go-day" data-day="${useDay}">查看 ${displayDay(useDay)} 行程</button><button class="btn secondary" data-action="tab" data-tab="more">離線地址卡</button></div></div>
 ${e?`<div class="card"><div class="row between"><span class="eyelabel">下一場正式集合</span><span class="pill confirmed">${displayDay(meetDay)}</span></div><div class="title">${esc(e.title)}</div><div class="grid2"><div><div class="eyelabel">集合時間</div><div class="big mono">${esc(e.time)}</div></div><div><div class="eyelabel">距離集合</div><div class="big" style="font-size:19px">${countdown(diffMinutes(meetDay,e.time))}</div></div></div><p><strong>集合地點：</strong>${esc(e.place)}</p><div class="statbox"><div class="eyelabel">最晚出發時間（自行確認）</div><div class="big">${departure?esc(departure):'尚未設定'}</div>${departure?`<div class="hint">距出發剩下 ${countdown(diffMinutes(meetDay,departure))}；僅在開啟 App 時更新</div>`:'<div class="hint">目前沒有足夠資料推算最晚出門時間，請先確認電車路線與車次。</div>'}</div><div class="actions"><button class="btn" data-action="edit-depart" data-day="${meetDay}">設定出發提醒</button><button class="btn secondary" data-action="calendar" data-day="${meetDay}">匯出日曆提醒</button></div>${mapButtons(e.nav||e.place)}<p class="hint">站名／出口文字搜尋不保證地圖直接定位出口入口。出發前仍需核對站內出口指示。</p></div>`:'<div class="card">目前沒有待參加的正式集合。</div>'}
 ${next&&next.id!==e?.id?`<div class="card"><div class="eyelabel">當日接下來的行程</div><div class="title">${esc(next.time)}　${esc(next.title)}</div><div class="muted">${esc(next.place)} · ${kindNames[next.kind]||'行程'}</div><button class="btn secondary" style="margin-top:10px" data-action="go-day" data-day="${useDay}">查看當天完整時間軸</button></div>`:''}
 <div class="card"><h2>下一步注意事項</h2><ul class="list-plain">${(DEFAULT_ALERTS[useDay]||[]).slice(0,3).map(x=>`<li><strong>${esc(x[0])}：</strong>${esc(x[1])}</li>`).join('')}</ul></div>
 <div class="card"><h2>快速入口</h2><div class="grid2"><button class="btn secondary" data-action="tab" data-tab="ask">參訪提問與筆記</button><button class="btn secondary" data-action="go-food" data-day="${useDay}">今日沿途餐廳</button><button class="btn secondary" data-action="tab" data-tab="shop">伴手禮地點</button><button class="btn secondary" data-action="show-location" data-location="hotel">飯店日文地址</button><button class="btn secondary" data-action="tab" data-tab="cost">費用紀錄</button><button class="btn secondary" data-action="photo-album">照片總覽</button></div></div><div class="footer-note">今日倒數為 App 開啟時的資訊，不提供 iOS 背景推播。建議以日曆提醒作為實際出發通知。</div>`;
}
function renderDay(){const ev=sortEvents(db.events.filter(e=>e.day===selectedDay));const mm=db.meetings[selectedDay];return `<div class="sectionhead"><h2>${displayDay(selectedDay)} 行程</h2><button class="btn" data-action="edit-event" data-id="new">＋ 新增</button></div><div class="quicknav" style="margin-bottom:12px"><a class="btn secondary" href="#food-spots">今日沿途餐廳（${(FOOD_SPOTS[selectedDay]||[]).length}）</a><button class="btn ghost" data-action="tab" data-tab="shop">伴手禮地點</button></div>
 ${eventEditor!==null?renderEventForm(eventEditor):''}
 ${[0,6].includes(selectedDay)?renderTransitCard(selectedDay):''}
 <div class="card"><h2>行程時間軸 <span class="muted">（全部可編輯）</span></h2>${ev.length?ev.map(renderEvent).join(''):'<div class="empty">尚未安排活動，請新增。</div>'}</div>
 <details class="card quiet-details"><summary>當日提醒與備案 <span class="mini-note">${(DEFAULT_ALERTS[selectedDay]||[]).length} 項</span></summary><div class="details-content">${(DEFAULT_ALERTS[selectedDay]||[]).map(a=>`<div class="compact-notice"><strong>${esc(a[0])}：</strong>${esc(a[1])}</div>`).join('')}<p class="hint">活動時間、車次僅供參考，需依當日公告。</p></div></details>
 ${renderFoodSpots(selectedDay)}
 <div class="card"><h2>當日備忘</h2><textarea data-note="day${selectedDay}" placeholder="臨時改約、交通方式、用餐備案……">${esc(db.notes['day'+selectedDay]||'')}</textarea>${photoWidget('day:'+selectedDay)}<p class="hint">輸入時自動儲存於本機，建議定期備份。</p></div>`;
}
function transitLinks(guide){
 if(!guide)return'';
 const q=(a,b)=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(a)+'&destination='+encodeURIComponent(b)+'&travelmode=transit';
 return `<div class="actions"><a class="btn secondary smallbtn" href="${attr(q(guide.origin,guide.destination))}" target="_blank" rel="noopener noreferrer" data-external="true">查看電車路線</a></div>`;
}
function renderTransitSteps(guide){
 return `<div class="transit-steps">${(guide.steps||[]).map((s,i)=>`<div class="transit-step"><span class="transit-number">${i+1}</span><span>${esc(s)}</span></div>`).join('')}</div>${guide.fare?`<p class="muted"><strong>${esc(guide.fare)}</strong> · 參考車資，非實際扣款</p>`:''}${guide.duration?`<p class="muted">${esc(guide.duration)}</p>`:''}<p class="hint">${esc(guide.note||'')}</p>${transitLinks(guide)}`;
}
function renderTransitCard(day){const g=TRANSIT_GUIDES[day];if(!g)return'';return `<details class="card quiet-details transit-card"><summary>交通參考 <span class="mini-note">${esc(g.title)}</span></summary><div class="details-content">${renderTransitSteps(g)}</div></details>`;}
function renderMeetingDetails(day,m){const guide=TRANSIT_GUIDES[day],e=getEvent(m.eventId),edit=editingTravel===Number(day);if(!e)return'';
 return `<details class="meeting-details" ${edit?'open':''}><summary>交通、出發設定 ${m.depart?`<span class="mini-note">最晚出發 ${esc(m.depart)}</span>`:''}</summary><div class="details-content">${guide?renderTransitSteps(guide):`<p class="muted">${esc(m.route||'')}</p>`}<div class="meeting-detail-row"><div><span class="eyelabel">最晚出發（自行確認）</span><strong>${esc(m.depart||'未設定')}</strong></div><div><span class="eyelabel">出發地</span><strong>${esc(m.origin||'未設定')}</strong></div></div>${m.route&&m.route!==DEFAULT_MEETINGS[day]?.route?`<p class="hint">我的交通備註：${esc(m.route)}</p>`:''}${m.note&&m.note!==DEFAULT_MEETINGS[day]?.note?`<p class="hint">我的提醒：${esc(m.note)}</p>`:''}${e.edited&&e.detail?`<p class="hint">自訂集合內容：${esc(e.detail)}</p>`:''}<div class="actions"><button class="btn secondary smallbtn" data-action="edit-depart" data-day="${day}">${edit?'收合設定':'編輯出發設定'}</button><button class="btn ghost smallbtn" data-action="calendar" data-day="${day}">行事曆提醒</button>${e.locationId?`<button class="btn ghost smallbtn" data-action="show-location" data-location="${attr(e.locationId)}">日文集合卡</button>`:''}</div>${edit?`<form id="travel-form" data-day="${day}" class="subsection"><label>最晚離開出發地時間（日本時間；需自行確認）</label><input name="depart" type="time" value="${attr(m.depart||'')}"><label>出發地</label><input name="origin" value="${attr(m.origin||'')}"><label>個人交通方式／轉乘備註</label><textarea name="route">${esc(m.route||'')}</textarea><label>其他風險提醒</label><textarea name="note">${esc(m.note||'')}</textarea><div class="actions"><button class="btn" type="submit">儲存</button><button class="btn secondary" type="button" data-action="cancel-edit-travel">取消</button></div></form>`:''}</div></details>`;
}
function renderEvent(e){const tz=e.timezone==='Asia/Taipei'?'臺灣時間':'日本時間';const meeting=db.meetings[selectedDay];const isMeeting=meeting&&meeting.eventId===e.id;
 return `<div class="event ${e.kind==='official'?'official':''}"><div class="timecol"><div class="time">${esc(e.time)}</div>${e.end?`<div class="subtime">至 ${esc(e.end)}</div>`:''}<div class="subtime">${e.timezone==='Asia/Taipei'?'臺灣':''}</div></div><div class="eventbody"><div class="evt-title">${esc(e.title)}</div><div class="row wrap"><span class="pill">${esc(kindNames[e.kind]||'活動')}</span>${statusPill(e)}</div><p class="event-place">${esc(e.place||'未填')}</p>${isMeeting?'':`<details class="event-expand"><summary>詳細資訊</summary><div class="details-content">${e.detail?`<p class="muted preline">${esc(e.detail)}</p>`:''}${e.timezone==='Asia/Taipei'?`<div class="hint">${tz}，與日本相差 1 小時</div>`:''}</div></details>`}${isMeeting?renderMeetingDetails(selectedDay,meeting):''}<div class="actions">${e.place?`<a class="btn ghost smallbtn" data-external="true" href="${attr(mapsLink(e.nav||e.ja||e.place,'google'))}" target="_blank" rel="noopener noreferrer">導航</a>`:''}<button class="btn secondary smallbtn" data-action="edit-event" data-id="${attr(e.id)}">編輯</button><button class="btn danger smallbtn" data-action="delete-event" data-id="${attr(e.id)}">刪除</button></div></div></div>`;
}
function renderEventForm(id){const e=id==='new'?{time:'12:00',end:'',title:'',place:'',detail:'',kind:'free',status:'planned',ja:'',nav:'',timezone:'Asia/Tokyo'}:getEvent(id);if(!e)return'';return `<div class="card" id="event-editor"><h2>${id==='new'?'新增行程':'編輯行程'}</h2><form id="event-form" data-id="${attr(id)}"><div class="grid2"><div class="field"><label>開始時間</label><input type="time" name="time" value="${attr(e.time)}" required></div><div><label>結束時間</label><input type="time" name="end" value="${attr(e.end||'')}"></div></div><label>名稱</label><input name="title" value="${attr(e.title)}" required maxlength="140"><label>地點／集合位置</label><input name="place" value="${attr(e.place)}"><div class="grid2"><div><label>類別</label><select name="kind">${Object.entries(kindNames).map(([k,v])=>`<option value="${k}" ${e.kind===k?'selected':''}>${v}</option>`).join('')}</select></div><div><label>狀態</label><select name="status">${Object.entries(statusNames).map(([k,v])=>`<option value="${k}" ${e.status===k?'selected':''}>${v}</option>`).join('')}</select></div></div><label>時區</label><select name="timezone"><option value="Asia/Tokyo" ${e.timezone!=='Asia/Taipei'?'selected':''}>日本時間（JST）</option><option value="Asia/Taipei" ${e.timezone==='Asia/Taipei'?'selected':''}>臺灣時間（TST）</option></select><label>導航搜尋字串（日文最佳）</label><input name="nav" value="${attr(e.nav||e.ja||e.place)}"><label>詳細備註</label><textarea name="detail">${esc(e.detail)}</textarea><div class="actions"><button class="btn" type="submit">儲存行程</button><button class="btn secondary" type="button" data-action="cancel-event">取消</button></div></form></div>`;}
function renderMealForm(id){const m=id==='new'?{area:'',name:''}:(db.meals[selectedDay]||[]).find(x=>x.id===id);if(!m)return'';return `<form id="meal-form" data-id="${attr(id)}" style="margin:10px 0"><label>區域</label><input name="area" value="${attr(m.area)}" required><label>餐廳／候選料理</label><textarea name="name" required>${esc(m.name)}</textarea><div class="actions"><button class="btn" type="submit">儲存</button><button class="btn secondary" type="button" data-action="cancel-meal">取消</button></div></form>`;}
function renderAsk(){
 const owned=selectedDay===1||selectedDay===3;
 const q=owned?(db.questions[selectedDay]||[]):[];
 const meeting=db.meetings[selectedDay];
 const visitName=meeting?(getEvent(meeting.visitId)?.title||'參訪紀錄'):'';
 const topics=selectedDay===1?'低噪音工具、模組化臨時隔音牆（SPTW）、固體傳播音、人員干擾感、都市噪音預測':selectedDay===3?'Edge Silencer、凍結樁頭處理、TANC、工地噪音量測與自主管理':'';
 if(!owned){
  const title=meeting?esc(visitName):'個人行程／交通筆記';
  return `<div class="sectionhead"><h2>${displayDay(selectedDay)} 現場筆記</h2></div><div class="card"><h2>${title}</h2><p class="muted">${meeting?'這場參訪不需要你準備問題，直接記錄重要資訊即可。':'可記錄交通、購物、行李與其他個人事項。'}內容會自動儲存於本機。</p><label for="free-note">參訪內容、數據、日方說明與待辦事項</label><textarea id="free-note" data-note="ask${selectedDay}" rows="13" placeholder="在此輸入現場筆記、重點、照片編號、待追蹤事項……">${esc(db.notes['ask'+selectedDay]||'')}</textarea>${photoWidget('visit:'+selectedDay)}</div>`;
 }
 return `<div class="sectionhead"><h2>${displayDay(selectedDay)} 交流問題（${q.length} 題）</h2><button class="btn" data-action="edit-question" data-id="new">＋ 新增</button></div><div class="card"><strong>${esc(visitName)}</strong><p class="muted">本頁以最新《日本參訪說明》為依據；4 題主要議題及 ${selectedDay===1?'1':'3'} 題延伸議題。逐題可以記錄日方回答。</p><div class="hint">重點：${esc(topics)}</div></div>${questionEditor!==null?renderQuestionForm(questionEditor):''}
 <div class="card">${q.length?q.map((v,i)=>`<div class="question"><div class="row" style="align-items:flex-start"><input type="checkbox" aria-label="此題已詢問" data-asked="${attr(v.id)}" ${v.asked?'checked':''}><div class="grow"><div class="row wrap"><span class="pill ${v.category==='extended'?'unconfirmed':'confirmed'}">${v.category==='extended'?'延伸議題':'主要議題'}</span></div><div class="qa-title ${v.asked?'readonly':''}">${i+1}. ${esc(v.title||v.text)}</div></div></div>${v.title?`<details class="question-details"><summary>查看完整問句與交流目的</summary><p class="preline">${esc(v.text)}</p>${v.purpose?`<p class="muted preline"><strong>交流目的：</strong>${esc(v.purpose)}</p>`:''}</details>`:''}<div class="qa-input"><label for="answer-${attr(v.id)}">日方回答／技術數據</label><textarea id="answer-${attr(v.id)}" rows="3" data-qfield="answer" data-qid="${attr(v.id)}" placeholder="量測條件、降噪 dB、回答摘要……">${esc(v.answer||'')}</textarea></div><div class="qa-input"><label for="follow-${attr(v.id)}">後續追蹤事項</label><textarea id="follow-${attr(v.id)}" rows="2" data-qfield="followup" data-qid="${attr(v.id)}" placeholder="索取簡報、相關文獻、適用於臺灣的建議……">${esc(v.followup||'')}</textarea></div><div class="actions"><button class="btn secondary smallbtn" data-action="edit-question" data-id="${attr(v.id)}">修改問題</button><button class="btn danger smallbtn" data-action="delete-question" data-id="${attr(v.id)}">刪除</button></div></div>`).join(''):'<div class="empty">沒有預設提問，可自行新增。</div>'}</div><div class="card"><h2>其他現場筆記</h2><textarea rows="7" data-note="ask${selectedDay}" placeholder="其他補充、照片編號、與會人員、待辦……">${esc(db.notes['ask'+selectedDay]||'')}</textarea>${photoWidget('visit:'+selectedDay)}</div>`;
}
function renderQuestionForm(id){const q=id==='new'?{text:''}:(db.questions[selectedDay]||[]).find(x=>x.id===id);return `<div class="card"><h2>${id==='new'?'新增提問':'修改提問'}</h2><form id="question-form" data-id="${attr(id)}"><textarea name="text" required placeholder="輸入想向日方提問的內容……">${esc(q?.text||'')}</textarea><div class="actions"><button class="btn" type="submit">儲存</button><button class="btn secondary" type="button" data-action="cancel-question">取消</button></div></form></div>`;}
function isGiftGoal(s){return s.category==='gift'||(s.category!=='task'&&(s.id==='shop-3'||s.id==='shop-4'));}
function renderShoppingItems(items){return items.map(s=>`<div class="shopping-entry"><div class="shopping-entry-main"><input type="checkbox" data-shopid="${attr(s.id)}" aria-label="完成 ${attr(s.text)}" ${s.done?'checked':''}><div class="grow ${s.done?'done':''}">${esc(s.text)}</div></div><div class="shopping-entry-actions"><button class="btn ghost smallbtn" data-action="toggle-shop-category" data-id="${attr(s.id)}">${isGiftGoal(s)?'移至待辦':'移至伴手禮'}</button><button class="btn secondary smallbtn" data-action="edit-shop" data-id="${attr(s.id)}">編輯</button><button class="btn danger smallbtn" data-action="delete-shop" data-id="${attr(s.id)}" aria-label="刪除 ${attr(s.text)}">×</button></div></div>`).join('')||'<div class="empty">目前沒有項目</div>';}
function renderShopping(){
 const goals=db.shopping.filter(isGiftGoal),todo=db.shopping.filter(s=>!isGiftGoal(s));
 const doneGoals=goals.filter(s=>s.done).length;
 const totalItems=GIFT_STORES.reduce((sum,s)=>sum+s.items.length,0);
 const bought=GIFT_STORES.reduce((sum,s)=>sum+s.items.filter(it=>db.giftChecked.includes(it.id)).length,0);
 const visited=GIFT_STORES.filter(s=>db.giftChecked.includes(s.id)).length;
 return `<div class="card" id="shopping-goals"><div class="sectionhead"><h2>伴手禮購物目標</h2><span class="pill">${doneGoals}/${goals.length} 完成</span></div><p class="hint">「購物目標完成」與「單項商品已購買」分開計算。公司 20–30 人份建議確認總數量、保存期限與獨立包裝。</p>${renderShoppingItems(goals)}<div class="actions"><button class="btn secondary smallbtn" data-action="add-goal">＋ 新增採買目標</button></div><div class="gift-summary"><span>已逛購物地點：<b>${visited}/${GIFT_STORES.length}</b></span><span>已購商品項目：<b>${bought}/${totalItems}</b></span></div></div>${renderGiftStores()}<div class="card"><div class="sectionhead"><h2>其他購物／旅行待辦（${todo.filter(s=>s.done).length}/${todo.length}）</h2><button class="btn secondary smallbtn" data-action="add-shop">＋ 新增</button></div>${renderShoppingItems(todo)}</div>`;
}
function renderCosts(){const sum=t=>db.expenses.filter(x=>x.type===t).reduce((s,x)=>s+Number(x.amount||0),0);return `<div class="card"><div class="statrow"><div class="statbox"><div class="eyelabel">公務支出（JPY）</div><div class="money mono">¥${sum('公務').toLocaleString('ja-JP')}</div></div><div class="statbox"><div class="eyelabel">私人支出（JPY）</div><div class="money mono">¥${sum('私人').toLocaleString('ja-JP')}</div></div></div></div><div class="card"><h2>新增費用</h2><form id="cost-form"><div class="grid2"><div><label>日期</label><select name="day">${TRIP_DATES.map((d,i)=>`<option value="${i}" ${i===selectedDay?'selected':''}>${displayDay(i)}</option>`).join('')}</select></div><div><label>類別</label><select name="type"><option>公務</option><option>私人</option></select></div></div><div class="grid2"><div><label>日圓金額</label><input name="amount" type="number" min="1" step="1" required></div><div><label>付款方式</label><select name="method"><option>現金</option><option>信用卡</option><option>交通 IC 卡</option><option>其他</option></select></div></div><label>用途／店名</label><input name="title" required placeholder="筑波快線、晚餐、伴手禮……"><button class="btn" type="submit">新增紀錄</button></form></div><div class="card"><div class="sectionhead"><h2>費用明細</h2><button class="btn secondary smallbtn" data-action="export-csv">匯出 CSV</button></div>${db.expenses.length?db.expenses.slice().reverse().map(e=>`<div class="checkline"><div class="grow"><strong>${esc(e.title)}</strong><div class="muted">${displayDay(Number(e.day))} · ${esc(e.type)} · ${esc(e.method)}</div></div><strong class="num">¥${Number(e.amount).toLocaleString('ja-JP')}</strong><button class="btn danger smallbtn" data-action="delete-cost" data-id="${attr(e.id)}">×</button></div>${photoWidget('expense:'+e.id)}`).join(''):'<p class="muted">尚無費用紀錄。</p>'}</div>`;}
function renderLocationCard(loc){if(!loc)return'';return `<div class="jp-card"><div class="eyelabel">出示給日本人／計程車司機</div><div class="jp-name">${esc(loc.ja)}</div><div class="jp-address">${esc(loc.address)}</div><hr class="divider"><div class="jp-name" style="font-size:17px">こちらまでお願いします。</div><div class="muted">請帶我到這裡。</div><div class="actions"><button class="btn secondary" data-action="copy" data-value="${attr(loc.ja+'\n'+loc.address+'\nこちらまでお願いします。')}">複製日文地址</button></div>${mapButtons(loc.nav||loc.ja)}</div>`;}
function renderTransportBudget(){const b=TRANSPORT_BUDGET;
 const totalMin=b.days.reduce((s,x)=>s+x[0],0),totalMax=b.days.reduce((s,x)=>s+x[1],0);
 const fmt=n=>'¥'+Number(n).toLocaleString('ja-JP');
 return `<details class="card quiet-details budget-card" id="transport-budget"><summary>日本交通預算 <span class="mini-note">建議 ${fmt(b.recommended)}／人</span></summary><div class="details-content"><div class="statrow"><div class="statbox"><span class="eyelabel">建議預算</span><div class="big mono">${fmt(b.recommended)}</div></div><div class="statbox"><span class="eyelabel">備用上限</span><div class="big mono">${fmt(b.cap)}</div></div></div><p class="hint">每日預估加總：${fmt(totalMin)}–${fmt(totalMax)}。以下均為日本境內、每人日圓交通費。</p><div class="budget-lines">${b.days.map((v,i)=>`<div class="budget-line"><span>${displayDay(i)}</span><strong>${fmt(v[0])}–${fmt(v[1])}</strong></div>`).join('')}</div><p class="hint">${esc(b.footnote)}</p><p class="mini-note">${esc(b.source)}。預算與記帳完全獨立，不計入已付款費用。</p></div></details>`;
}
function renderMore(){const loc=LOCATIONS.find(x=>x.id===openLocation)||LOCATIONS[0];return `<div class="quicknav" style="margin-bottom:12px"><a class="btn secondary" href="#photo-gallery">跳至照片總覽</a><a class="btn ghost" href="#photo-backup">照片備份</a></div><div class="card"><h2>日文地址出示卡</h2><label>選擇地點</label><select id="location-picker">${LOCATIONS.map(l=>`<option value="${attr(l.id)}" ${l.id===openLocation?'selected':''}>${esc(l.name)}</option>`).join('')}</select><div class="subsection">${renderLocationCard(loc)}</div><p class="hint">地圖導航需要網路。車站出口位置以現場告示為準。</p></div>
 ${renderTransportBudget()}
 <div class="card"><h2>航班與飯店</h2><div class="line"><strong>11/15 CI220</strong><div class="muted">松山 T1 <strong>09:00 臺灣</strong> → 羽田 T3 <strong>12:50 日本</strong></div></div><div class="line"><strong>11/21 CI221</strong><div class="muted">羽田 T3 <strong>14:15 日本</strong> → 松山 T1 <strong>17:15 臺灣</strong></div></div><div class="line"><strong>Comfort Hotel Tokyo Kanda</strong><div class="muted">入住 11/15，退房 11/21；東京都千代田区神田東松下町11-2</div></div><button class="btn secondary" data-action="show-location" data-location="hotel">顯示飯店日文卡</button></div>
 <div class="card"><h2>技術日文速查</h2><p class="hint">詞彙為交流輔助參考，未經專業通譯逐詞校對。</p>${GLOSSARY.map(([zh,ja])=>`<div class="line"><div class="row between"><div class="grow"><span class="muted">${esc(zh)}</span><div><strong>${esc(ja)}</strong></div></div><button class="btn ghost smallbtn" data-action="copy" data-value="${attr(ja)}">複製</button></div></div>`).join('')}</div>
 <div class="card"><h2>緊急聯絡</h2><div class="actions"><a class="btn secondary" href="tel:110">日本警察 110</a><a class="btn secondary" href="tel:119">消防／救護 119</a></div><p class="muted">如需醫療或當地協助，可詢問飯店人員。實際報警請直接撥號。</p></div>
 <div class="card"><h2>本機資料、備份與還原</h2><div class="notice info">行程依 2026/11/13 V2.8 更新，正式集合依 11/10 通知；餐廳 23 間與伴手禮購物地點 7 處依專案資料庫清單整理。東京大學與戶田建設提問依最新《日本參訪說明》更新。<br>資料儲存在本機 Safari／主畫面 App，<strong>清除網站資料可能遺失紀錄</strong>，請自行匯出備份。</div><p class="muted">目前資料版本：${esc(db.seedRev)}；${db.events.length} 筆行程、${db.expenses.length} 筆費用。</p><div class="actions"><button class="btn secondary" data-action="export">資料 JSON（不含照片）</button><button class="btn secondary" data-action="import">匯入備份</button><button class="btn secondary" data-action="export-csv">費用 CSV</button>${safeLocalRead(OLD_ARCHIVE)?'<button class="btn ghost" data-action="export-legacy">下載舊版原始備份</button>':''}</div><input id="import-input" class="hidden-input" type="file" accept=".zip,.json,application/zip,application/json"><p class="hint">JSON 只備份文字資料，照片請使用完整 ZIP 備份。匯入會先詢問是否覆蓋。</p></div>
 <div class="card" id="photo-gallery"><h2>照片總覽</h2><p class="muted">照片保存在這支 iPhone 的瀏覽器資料庫，可離線檢視。報帳單據請同時保留 iPhone 原始相片；本 App 不是唯一正本。點照片可編輯備註、分享或刪除。</p><div class="photo-album" data-photo-album>載入照片中……</div></div>
 <div class="card" id="photo-backup"><h2>照片備份</h2><p class="muted">「完整 ZIP 備份」同時包含行程、筆記、費用和照片，可保存至 iPhone「檔案」App。舊版 JSON 備份<strong>不包含照片</strong>。</p><div class="actions"><button class="btn" data-action="export-full">完整備份（含照片 ZIP）</button><button class="btn secondary" data-action="import">還原 ZIP／JSON 備份</button></div><p class="hint">照片採本機儲存，資料不會自動傳到 GitHub；Safari 清除網站資料、移除網頁 App 或裝置故障可能造成照片遺失。建議每天匯出完整備份。</p></div>
 <div class="card"><h2>iPhone 安裝／離線</h2><p class="muted">1. 將程式部署在 HTTPS（例如 GitHub Pages）。<br>2. 以 Safari 開啟網址 → 分享 → 加入主畫面。<br>3. 連網開啟一次，確認完成快取後開啟飛航模式測試。<br>4. 行程、筆記、地址卡可離線查看；地圖及即時列車資訊需要網路。</p><p class="hint">iPhone 背景通知不保證會執行。首頁倒數僅在使用 App 時更新；日曆提醒需自行匯入並確認已加入 Apple 行事曆。</p><div class="actions"><button class="btn secondary" data-action="check-update">檢查網站更新</button><button class="btn danger" data-action="reset">清除個人資料並重設</button></div></div>
 <div class="footer-note">自由活動、餐廳及伴手禮資訊依 2026/11/12 的行程和店家資訊整理預載，不代表所有候選景點已訂位或最新實況。</div>`;}
function chooseDay(i){selectedDay=Math.min(6,Math.max(0,Number(i)||0));eventEditor=null;questionEditor=null;editingTravel=false;editingMeal=null;foodFilter='all';render();window.scrollTo({top:0,behavior:'auto'});}
function chooseTab(t){if(!['home','day','ask','shop','cost','more'].includes(t))return;tab=t;eventEditor=null;questionEditor=null;editingTravel=false;editingMeal=null;foodFilter='all';render();window.scrollTo({top:0,behavior:'auto'});}
function oneQuestion(id){return (db.questions[selectedDay]||[]).find(x=>x.id===id)}
async function copyText(value){try{await navigator.clipboard.writeText(value);toast('已複製')}catch{window.prompt('請長按複製以下內容',value)}}
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
async function shareOrDownload(blob,filename){const file=new File([blob],filename,{type:blob.type});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:filename});toast('已開啟 iPhone 分享選單');return}catch(e){if(e.name==='AbortError')return}}
 downloadBlob(blob,filename);toast('已建立檔案，請存到 iPhone「檔案」App');}
async function exportBackup(legacy=false){const obj=legacy?safeLocalRead(OLD_ARCHIVE):{app:'tokyo-visit-2026',schema:2,seed:SEED_REV,exportedAt:new Date().toISOString(),data:db};if(!obj){toast('沒有舊版資料可匯出');return}const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});await shareOrDownload(blob,(legacy?'東京參訪_舊版原始備份_':'東京參訪_V2.7_文字備份_')+new Date().toISOString().slice(0,10)+'.json');}
async function exportFullBackup(){try{toast('正在建立含照片 ZIP 備份，請勿離開本頁');const {blob,count}=await PhotoVault.exportBundle(db);await shareOrDownload(blob,'東京參訪_V2.7_完整照片備份_'+new Date().toISOString().slice(0,10)+'.zip');toast('已建立完整備份，含 '+count+' 張照片；請確認已存到檔案 App');}catch(e){toast('照片備份失敗：'+e.message)}}
async function importBackup(file){if(!file)return;try{
 if(file.name.toLowerCase().endsWith('.zip')){
  const result=await PhotoVault.unpack(file);const imported=normalize(result.data);
  if(!confirm('還原此 ZIP 將覆蓋本機的行程、筆記、清單、費用及所有照片（'+result.photos.length+' 張）。確定繼續？'))return;
  await PhotoVault.replaceAll(result.photos);db=imported.seedRev===SEED_REV?imported:refreshSeed(imported);if(!save())throw new Error('文字資料儲存失敗');render();toast('完整備份已還原，包含 '+result.photos.length+' 張照片');return;
 }
 const raw=JSON.parse(await file.text());let imported;
 if(raw.app==='tokyo-visit-2026'&&raw.data){if(raw.schema===2||raw.data.schema===2)imported=normalize(raw.data);else if(Array.isArray(raw.data.events))imported=legacyUpgrade(raw.data)}else if(raw.schema===2&&Array.isArray(raw.events))imported=normalize(raw);else if(raw.events&&raw.shopping&&raw.expenses)imported=legacyUpgrade(raw);
 if(!imported)throw Error('檔案格式不符');if(!confirm('匯入 JSON 將覆蓋現有文字資料，但不會還原或刪除已儲存的照片。確定繼續？'))return;
 db=imported.seedRev===SEED_REV?imported:refreshSeed(imported);save();render();toast('文字資料已還原，照片保留原狀');
 }catch(e){toast('匯入失敗：'+e.message)}}
const csvCell=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
function exportCsv(){const rows=[['日期','用途','類別','日圓金額','付款方式'],...db.expenses.map(x=>[TRIP_DATES[Number(x.day)]||'',x.title,x.type,x.amount,x.method])];const str='\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');downloadBlob(new Blob([str],{type:'text/csv;charset=utf-8'}),'東京參訪_費用明細.csv');toast('已建立 Excel 可開啟的 CSV');}
function icsEscape(s){return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsDate(d,t){return TRIP_DATES[d].replace(/-/g,'')+'T'+t.replace(':','')+'00'}
function exportCalendar(day){const m=db.meetings[day],e=getEvent(m?.eventId);if(!m||!e)return;const tz='BEGIN:VTIMEZONE\r\nTZID:Asia/Tokyo\r\nBEGIN:STANDARD\r\nDTSTART:19700101T000000\r\nTZOFFSETFROM:+0900\r\nTZOFFSETTO:+0900\r\nTZNAME:JST\r\nEND:STANDARD\r\nEND:VTIMEZONE\r\n';const dtstamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const line=(tag,time,title,desc)=>`BEGIN:VEVENT\r\nUID:${TRIP_DATES[day]}-${tag}@tokyo-visit-pwa\r\nDTSTAMP:${dtstamp}\r\nDTSTART;TZID=Asia/Tokyo:${icsDate(day,time)}\r\nDURATION:PT10M\r\nSUMMARY:${icsEscape(title)}\r\nDESCRIPTION:${icsEscape(desc)}\r\nBEGIN:VALARM\r\nTRIGGER:-PT10M\r\nACTION:DISPLAY\r\nDESCRIPTION:${icsEscape(title)}\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
 let s='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Tokyo Visit PWA//ZH-Hant//\r\nCALSCALE:GREGORIAN\r\n'+tz+line('meet',e.time,'正式集合：'+e.title,e.place+'；'+(m.note||''));if(m.depart)s+=line('leave',m.depart,'最晚出發：'+e.title,m.origin+'；'+m.route);s+='END:VCALENDAR\r\n';downloadBlob(new Blob([s],{type:'text/calendar;charset=utf-8'}),`東京參訪_${TRIP_DATES[day]}_提醒.ics`);toast('已建立日曆檔。請確認已匯入 iPhone 行事曆。');}
function onClick(ev){const b=ev.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
 if(a==='choose-day'){chooseDay(b.dataset.day);return}
 if(a==='go-day'){selectedDay=Number(b.dataset.day);chooseTab('day');return}
 if(a==='go-food'){selectedDay=Number(b.dataset.day);chooseTab('day');document.getElementById('food-spots')?.scrollIntoView({block:'start',behavior:'instant'});return}
 if(a==='tab'){chooseTab(b.dataset.tab);return}
 if(a==='photo-album'){chooseTab('more');requestAnimationFrame(()=>$('#photo-gallery')?.scrollIntoView({block:'start'}));return}
 if(a==='edit-event'){eventEditor=id;render();$('#event-editor')?.scrollIntoView({block:'start'});return}
 if(a==='cancel-event'){eventEditor=null;render();return}
 if(a==='delete-event'){if(!confirm('確定刪除這筆行程？'))return;const e=getEvent(id);if(!e)return;db.events=db.events.filter(x=>x.id!==id);if(DEFAULT_EVENTS.some(x=>x.id===id))db.deletedEventIds.push(id);save();render();return}
 if(a==='edit-depart'){const d=Number(b.dataset.day);const wasOpen=(tab==='day'&&selectedDay===d&&editingTravel===d);selectedDay=d;chooseTab('day');editingTravel=wasOpen?false:d;render();return}
 if(a==='cancel-edit-travel'){editingTravel=false;render();return}
 if(a==='calendar'){exportCalendar(Number(b.dataset.day));return}
 if(a==='edit-question'){questionEditor=id;render();return}
 if(a==='cancel-question'){questionEditor=null;render();return}
 if(a==='delete-question'){if(!confirm('確定刪除這個問題及已填寫的回答？'))return;db.questions[selectedDay]=db.questions[selectedDay].filter(x=>x.id!==id);if(Object.values(DEFAULT_QUESTIONS).flat().some(x=>x.id===id))db.deletedQuestionIds.push(id);save();render();return}
 if(a==='food-filter'){foodFilter=['all','saved','custom'].includes(b.dataset.value)?b.dataset.value:'all';editingMeal=null;render();requestAnimationFrame(()=>document.getElementById('food-spots')?.scrollIntoView({block:'start'}));return}
 if(a==='toggle-food'){db.foodSaved??=[];db.foodSaved=db.foodSaved.includes(id)?db.foodSaved.filter(x=>x!==id):[...db.foodSaved,id];save();render();return}
 if(a==='edit-meal'){foodFilter='custom';editingMeal=id;render();requestAnimationFrame(()=>document.getElementById('food-spots')?.scrollIntoView({block:'start'}));return}
 if(a==='cancel-meal'){editingMeal=null;render();return}
 if(a==='delete-meal'){if(!confirm('刪除這個自訂餐廳候選？已附的照片不會自動刪除，可到照片總覽管理。'))return;db.meals[selectedDay]=db.meals[selectedDay].filter(x=>x.id!==id);db.foodSaved=db.foodSaved.filter(x=>x!==id);if(String(id).match(/^meal-\d+-\d+$/))db.deletedMealIds.push(id);save();render();return}
 if(a==='add-shop'||a==='add-goal'||a==='edit-shop'){const old=db.shopping.find(x=>x.id===id);const text=prompt(a==='add-goal'?'新增伴手禮採買目標':a==='add-shop'?'新增一般購物／旅行待辦':'修改內容',old?.text||'');if(text?.trim()){if(old)old.text=text.trim();else db.shopping.push({id:makeId('shop'),text:text.trim(),done:false,category:a==='add-goal'?'gift':'task'});save();render()}return}
 if(a==='toggle-shop-category'){const item=db.shopping.find(x=>x.id===id);if(item){item.category=isGiftGoal(item)?'task':'gift';save();render()}return}
 if(a==='delete-shop'){if(!confirm('確定刪除這項清單？'))return;db.shopping=db.shopping.filter(x=>x.id!==id);save();render();return}
 if(a==='delete-cost'){if(!confirm('刪除費用紀錄？關聯照片會保留在照片總覽，必要時請自行刪除。'))return;db.expenses=db.expenses.filter(x=>x.id!==id);save();render();return}
 if(a==='copy'){copyText(b.dataset.value||'');return}
 if(a==='show-location'){openLocation=b.dataset.location||'hotel';chooseTab('more');return}
 if(a==='add-photo'||a==='camera-photo'){photoLink=b.dataset.photoLink||'';if(photoLink)document.getElementById(a==='camera-photo'?'photo-camera':'photo-input').click();return}
 if(a==='photo-open'){PhotoVault.show(id).catch(e=>toast('照片開啟失敗：'+e.message));return}
 if(a==='export-full'){exportFullBackup();return}
 if(a==='export'){exportBackup();return}
 if(a==='export-legacy'){exportBackup(true);return}
 if(a==='import'){$('#import-input')?.click();return}
 if(a==='export-csv'){exportCsv();return}
 if(a==='reset'){if(!confirm('確定重設全部行程、筆記、清單、記帳與照片？此動作無法復原，請先匯出含照片的完整 ZIP 備份。'))return;PhotoVault.replaceAll([]).then(()=>{db=baseData();save();render();toast('已重設行程與照片')}).catch(e=>toast('照片清除失敗：'+e.message));return}
 if(a==='check-update'){if('serviceWorker'in navigator){navigator.serviceWorker.getRegistration().then(r=>r?.update()).then(()=>toast('已送出程式更新檢查')).catch(()=>toast('無法檢查更新'))}else toast('目前瀏覽器未啟用離線服務');return}
}
function onSubmit(ev){const f=ev.target;if(!f.matches('form'))return;ev.preventDefault();const o=Object.fromEntries(new FormData(f));
 if(f.id==='event-form'){if(!o.title.trim())return;const id=f.dataset.id;const old=id==='new'?null:getEvent(id);const e={...(old||{}),id:old?.id||makeId('event'),day:selectedDay,time:o.time,end:o.end||'',title:o.title.trim(),place:o.place.trim(),kind:o.kind,status:o.status,timezone:o.timezone,nav:o.nav.trim(),detail:o.detail,edited:true};e.sortTime=e.timezone==='Asia/Taipei'?convertTaiwanToJst(e.time):e.time;if(old)Object.assign(old,e);else db.events.push(e);eventEditor=null;save();render();toast('行程已儲存');return}
 if(f.id==='travel-form'){const day=Number(f.dataset.day);db.meetings[day]={...db.meetings[day],depart:o.depart||'',origin:o.origin||'',route:o.route||'',note:o.note||''};editingTravel=false;save();render();toast('出發資訊已儲存');return}
 if(f.id==='question-form'){const old=oneQuestion(f.dataset.id);if(!o.text.trim())return;if(old){old.text=o.text.trim();old.title='自訂問題';old.purpose='';old.edited=true}else(db.questions[selectedDay]??=[]).push({id:makeId('q'),text:o.text.trim(),asked:false,answer:'',followup:'',edited:true});questionEditor=null;save();render();return}
 if(f.id==='meal-form'){if(!o.area.trim()||!o.name.trim())return;const old=(db.meals[selectedDay]||[]).find(x=>x.id===f.dataset.id);if(old){old.area=o.area.trim();old.name=o.name.trim();old.edited=true}else(db.meals[selectedDay]??=[]).push({id:makeId('meal'),area:o.area.trim(),name:o.name.trim(),edited:true});editingMeal=null;save();render();return}
 if(f.id==='cost-form'){const amount=Number(o.amount);if(!Number.isSafeInteger(amount)||amount<=0){toast('金額須為正整數日圓');return}db.expenses.push({id:makeId('cost'),day:Number(o.day),type:o.type,method:o.method,amount,title:o.title.trim()});save();render();toast('已記錄費用');return}
}
function convertTaiwanToJst(t){let h=Number(t.slice(0,2));return String((h+1)%24).padStart(2,'0')+t.slice(2)}
function onInput(ev){const el=ev.target;if(el.matches('[data-note]')){db.notes[el.dataset.note]=el.value;save({silent:true});return}if(el.matches('[data-qfield]')){const q=oneQuestion(el.dataset.qid);if(q){q[el.dataset.qfield]=el.value;q.edited=true;save({silent:true})}return}}
function onChange(ev){const el=ev.target;if(el.matches('[data-asked]')){const q=oneQuestion(el.dataset.asked);if(q){q.asked=el.checked;q.edited=true;save({silent:true})}return}if(el.matches('[data-giftid]')){db.giftChecked??=[];db.giftChecked=el.checked?[...new Set([...db.giftChecked,el.dataset.giftid])]:db.giftChecked.filter(x=>x!==el.dataset.giftid);save();const label=el.closest('label')?.querySelector('span');if(label){const isPlace=el.dataset.giftid.startsWith('giftplace-');label.textContent=el.checked?(isPlace?'✓ 已逛過此地點':'✓ 已購入'):(isPlace?'標記已逛過此地點':'標記已購入')}return}if(el.matches('[data-shopid]')){const o=db.shopping.find(x=>x.id===el.dataset.shopid);if(o){o.done=el.checked;save();render()}return}if(el.id==='location-picker'){openLocation=el.value;render();return}if(el.id==='import-input'){importBackup(el.files[0]);el.value='';return}}
let swRegistration=null;
async function installServiceWorker(){if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;try{const reg=await navigator.serviceWorker.register('./sw.js');swRegistration=reg;const show=()=>{$('#update-banner').classList.remove('hidden');updatingWorker=reg.waiting};if(reg.waiting&&navigator.serviceWorker.controller)show();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)show()})});navigator.serviceWorker.addEventListener('controllerchange',()=>{location.reload()});$('#update-now').addEventListener('click',()=>{if(updatingWorker){updatingWorker.postMessage({type:'SKIP_WAITING'})}else location.reload()});}catch(e){console.warn('SW failed',e)}}
async function pickedPhotos(el){const files=Array.from(el.files||[]),link=photoLink;el.value='';if(!link||!files.length)return;try{toast('正在處理 '+files.length+' 張照片……');const n=await PhotoVault.addFiles(link,files);render();toast('已離線保存 '+n+' 張照片；請記得匯出完整 ZIP 備份');}catch(e){render();toast('照片儲存失敗：'+e.message)}}
function start(){initData();selectedDay=Math.max(0,dayIndex(japanNow().date));if(selectedDay<0)selectedDay=0;render();$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)chooseTab(b.dataset.tab)});$('#view').addEventListener('click',onClick);$('#days').addEventListener('click',onClick);$('#view').addEventListener('submit',onSubmit);$('#view').addEventListener('input',onInput);$('#view').addEventListener('change',onChange);for(const photoInput of ['photo-input','photo-camera'])document.getElementById(photoInput).addEventListener('change',e=>pickedPhotos(e.target));window.addEventListener('online',render);window.addEventListener('offline',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&tab==='home')render()});setInterval(()=>{if(tab==='home'&&!document.hidden)render()},60000);installServiceWorker();if(db.legacyImported&&!sessionStorage.getItem('tokyo-v2-legacy-notice')){sessionStorage.setItem('tokyo-v2-legacy-notice','1');setTimeout(()=>toast('已保留舊版原始備份並移入個人資料；請檢查舊版自訂行程'),600)}}
start();
