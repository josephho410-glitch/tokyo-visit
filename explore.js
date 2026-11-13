'use strict';
const Explore=(function ExploreFactory(){
 const AREAS=[
  ['kanda','神田／飯店',35.6915,139.7711,['神田']],['akihabara','秋葉原',35.6984,139.7731,['秋葉原']],['tokyo','東京站／丸之內',35.6812,139.7671,['東京駅','東京站','丸の内','丸之內','八重洲','KITTE','GRANSTA','グランスタ','黒塀']],['komaba','駒場',35.6620,139.6848,['駒場','東大','コマニ']],['ryogoku','兩國',35.6959,139.7934,['両国','兩國']],['oshiage','押上／晴空塔',35.7101,139.8129,['押上','晴空塔','スカイツリー','ソラマチ']],['tsukiji','築地',35.6655,139.7707,['築地']],['daimon','大門／御成門',35.6574,139.7520,['大門','御成門','芝公園']],['harajuku','原宿',35.6702,139.7027,['原宿','表参道']],['ginza','銀座／新橋',35.6716,139.7636,['銀座','新橋']],['kenkyu','研究學園／筑波',36.0816,140.0831,['研究学園','研究學園','筑波','つくば']],['ueno','上野／御徒町',35.7077,139.7741,['上野','御徒町','アメ横','阿美橫']],['kunitachi','國立',35.6992,139.4461,['国立','國立']],['asakusa','淺草',35.7147,139.7967,['浅草','淺草','鷲神社']],['mitaka','三鷹',35.7025,139.5609,['三鷹']],['kichijoji','吉祥寺',35.7032,139.5797,['吉祥寺']],['tower','東京鐵塔／芝公園',35.6586,139.7454,['東京鐵塔','東京タワー','赤羽橋']],['roppongi','六本木',35.6631,139.7313,['六本木']],['azabudai','麻布台 Hills',35.6600,139.7406,['麻布台','虎ノ門5']],['haneda','羽田 T3',35.5441,139.7686,['羽田','江戸小路','機場 T3']]
 ];
 const SCHEDULE={
  0:[[0,'kanda'],[12,'haneda'],[15,'akihabara'],[18,'tokyo']],
  1:[[0,'kanda'],[9,'komaba'],[14,'ryogoku'],[16,'oshiage']],
  2:[[0,'kanda'],[8,'tsukiji'],[11,'daimon'],[17,'harajuku']],
  3:[[0,'kanda'],[7,'kenkyu'],[13,'kanda'],[15,'ueno']],
  4:[[0,'kanda'],[8,'kunitachi'],[16,'kanda'],[18,'asakusa']],
  5:[[0,'kanda'],[8,'mitaka'],[12,'kichijoji'],[15,'kanda'],[16,'tower'],[18,'roppongi']],
  6:[[0,'kanda'],[10,'haneda']]
 };
 const TOKYO_ORDER=['giftitem-audrey','gift-fujimi','giftitem-sabrina','giftitem-pista'];
 const GIFT_META={
  'giftitem-audrey':{name:'AUDREY／オードリー',product:'グレイシア（草莓花束餅乾）',area:'tokyo',floor:'B1',zone:'銀の鈴エリア',gate:'JR 改札內',official:'https://www.gransta.jp/mall/gransta_tokyo/audrey/',map:'https://www.gransta.jp/tw/',price:2224,pack:12,individuallyWrapped:true,storage:'常溫',shelf:'參考：製造日起 90 日；以實物標示為準',verified:'2026-11-13'},
  'gift-fujimi':{name:'富士見堂',product:'東京鈴せんべい',area:'tokyo',floor:'B1',zone:'銀の鈴エリア',gate:'JR 改札內',official:'https://www.gransta.jp/mall/gransta_tokyo/fujimidou/',map:'https://www.gransta.jp/tw/',price:1600,pack:20,individuallyWrapped:true,storage:'常溫',shelf:'參考：製造日起 75 日；以實物標示為準',verified:'2026-11-13'},
  'giftitem-sabrina':{name:'薫るバター Sabrina／サブリナ',product:'サブリナ（花朵奶油酥餅）',area:'tokyo',floor:'1F',zone:'中央通路エリア',gate:'JR 改札內',official:'https://www.gransta.jp/mall/gransta_tokyo/sabrina/',map:'https://www.gransta.jp/tw/',price:1144,pack:6,individuallyWrapped:true,storage:'常溫陰涼處',shelf:'參考：製造日起 45 日；以實物標示為準',verified:'2026-11-13'},
  'giftitem-pista':{name:'PISTA & TOKYO',product:'開心果夾心餅乾',area:'tokyo',floor:'1F',zone:'東京ギフトパレット（八重洲北口）',gate:'JR 改札外',official:'https://www.tokyoeki-1bangai.co.jp/shop/detail/?cd=000146',map:'https://www.tokyoeki-1bangai.co.jp/assets/pdf/floorMap_giftpalette.pdf',price:null,pack:null,individuallyWrapped:null,storage:'請確認商品包裝標示',shelf:'現場確認賞味期限',verified:'2026-11-13'},
  'giftitem-futaki':{name:'二木の菓子 第一営業所',product:'地方限定零食、米菓',area:'ueno',floor:'路面店',zone:'アメ横商店街',gate:'站外',official:'https://www.ueno-ameyoko.jp/shop/shop_7497/',map:'https://www.ueno-ameyoko.jp/shop/shop_7497/',price:null,pack:null,individuallyWrapped:null,storage:'依商品標示',shelf:'現場確認',verified:'2026-11-13',address:'東京都台東区上野4-1-8',hours:'參考 10:00–19:00'},
  'gift-tokichi':{name:'中村藤吉本店 麻布台店',product:'抹茶／焙茶／宇治茶',area:'azabudai',floor:'B1',zone:'麻布台 Hills Garden Plaza B',gate:'商場內（非 JR 閘門）',official:'https://tokichi.jp/pages/stores',map:'https://tokichi.jp/pages/azabudai-store-page',price:null,pack:null,individuallyWrapped:null,storage:'依商品標示',shelf:'現場確認',verified:'2026-11-13',address:'東京都港区虎ノ門5-9-1'}
 };
 let subTab='food',expandAll=false,searchText='',buying=null,gps=null,locErr='',customEditing=null,arrivalScreen=false;
 const defaults=()=>({locationMode:'schedule',manualArea:'kanda',buffer:30,cuisine:'all',budget:'all',solo:false,favorites:false,meal:false,nearOnly:true,foodStatus:{},goals:{},tasks:{},purchases:[],selectedGift:null,tokyoStage:'none'});
 function state(){if(!db.exploreState||typeof db.exploreState!=='object')db.exploreState=defaults();const s=db.exploreState;for(const [k,v] of Object.entries(defaults()))if(s[k]===undefined)s[k]=v;if(!Array.isArray(s.purchases))s.purchases=[];for(const k of ['foodStatus','goals','tasks'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};if(!['schedule','manual','gps'].includes(s.locationMode))s.locationMode='schedule';return s}
 function validArea(id){return AREAS.some(a=>a[0]===id)}
 function areaName(id){return AREAS.find(a=>a[0]===id)?.[1]||'未選擇'}
 function guessArea(j=japanNow()){
  let day=TRIP_DATES.indexOf(j.date);if(day<0)day=j.date<TRIP_DATES[0]?0:6;
  const s=SCHEDULE[day]||SCHEDULE[0];let x=s[0][1];
  for(const [hour,id] of s)if(j.hour>=hour)x=id;
  return x;
 }
 function hav(a,b,c,d){const r=Math.PI/180,x=(c-a)*r,y=(d-b)*r;const v=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v))}
 function gpsArea(){if(!gps)return null;return AREAS.slice().sort((a,b)=>hav(a[2],a[3],gps.lat,gps.lng)-hav(b[2],b[3],gps.lat,gps.lng))[0][0]}
 function currentArea(){const s=state();return s.locationMode==='manual'&&validArea(s.manualArea)?s.manualArea:s.locationMode==='gps'&&gps?gpsArea():guessArea()}
 function locationLabel(){const s=state();return s.locationMode==='gps'&&gps?'依本次 GPS 推估附近區域':s.locationMode==='manual'?'手動選擇':'依行程推測'}
 function setArea(id){if(!validArea(id))return false;const s=state();s.locationMode='manual';s.manualArea=id;gps=null;locErr='';save();return true}
 function getDay(){const j=japanNow(),i=TRIP_DATES.indexOf(j.date);return i<0?(j.date<TRIP_DATES[0]?0:6):i}
 function namesAsId(s){s=String(s||'');const priority=['kenkyu','azabudai','roppongi','tower','kunitachi','kichijoji','mitaka','daimon','ryogoku','oshiage','tsukiji','harajuku','ginza','ueno','komaba','asakusa','akihabara','haneda','tokyo','kanda'];
  for(const id of priority){const a=AREAS.find(v=>v[0]===id);if(a[4].some(x=>s.includes(x)))return id}
  return null;
 }
 function mealSegment(j=japanNow()){return j.hour>=10&&j.hour<15?'lunch':j.hour>=17&&j.hour<23?'dinner':j.hour<10?'breakfast':'off'}
 function category(s){const t=[s.name,s.food,s.cuisine,s.slot].join(' ');if(/ちゃんこ|相撲鍋|相撲火鍋/.test(t))return'chanko';if(/ラーメン|沾麵|つけ麺|拉麵/.test(t))return'ramen';if(/寿司|壽司|海鮮|刺身|まぐろ/.test(t))return'sushi';if(/とんかつ|炸豬排|定食|蕎麦|蕎麥|烤魚/.test(t))return'teishoku';if(/焼肉|燒肉|牛肉|米澤牛|豬肉丼|すき焼|壽喜燒|串燒|やきとり|相撲火鍋以外/.test(t))return'meat';if(/カレー|咖哩/.test(t))return'curry';return'other'}
 const CATEGORY=[['all','不限'],['ramen','拉麵／沾麵'],['sushi','壽司／海鮮'],['teishoku','炸豬排／定食'],['meat','燒肉／肉類'],['chanko','相撲火鍋'],['curry','咖哩'],['other','其他']];
 function compileFood(){
  const map=new Map();
  function add(p,day,custom=false,legacy=false){
   if(!p?.id)return;
   if(map.has(p.id)){const v=map.get(p.id);if(!v.days.includes(day))v.days.push(day);return}
   const area=namesAsId([p.area,p.addr,p.slot,p.name].join(' '));
   const timeText=String(p.slot||'');const meals=timeText.includes('午餐')?['lunch']:timeText.includes('晚餐')?['dinner']:[];
   map.set(p.id,{...p,days:[day],custom,legacy,areaId:area,cuisineId:category(p),mealTimes:meals,priceMin:Number.isFinite(p.priceMin)?p.priceMin:null,priceMax:Number.isFinite(p.priceMax)?p.priceMax:null,soloFriendly:typeof p.soloFriendly==='boolean'?p.soloFriendly:null});
  }
  for(const [day,items] of Object.entries(FOOD_SPOTS))for(const p of items)add(p,Number(day));
  for(const [day,items] of Object.entries(LEGACY_EXTRA_FOOD))for(const p of items)add(p,Number(day),false,true);
  for(const [day,items] of Object.entries(db.meals||{}))for(const p of items)add(p,Number(day),true);
  return [...map.values()];
 }
 function nextMeeting(){
  const now=japanWallTimestamp();
  return meetingList().map(m=>({...m,at:eventJapanTimestamp(m.event)})).filter(m=>Number.isFinite(m.at)&&m.at>=now).sort((a,b)=>a.at-b.at)[0]||null;
 }
 function meetingArea(m){return m?namesAsId((m.event?.place||'')+' '+(m.event?.title||'')):null}
 function mealSafety(m=nextMeeting()){if(!m)return null;const remain=Math.max(0,Math.ceil((m.at-japanWallTimestamp())/60000));return {...m,remain}}
 function rankFood(p,at=currentArea(),j=japanNow()){
  const s=state(),reasons=[],nowMeal=mealSegment(j),near=p.areaId===at,meeting=mealSafety();
  let score=0;if(near){score+=110;reasons.push('位於目前'+areaName(at)+'區域')}else if(p.areaId===null){score-=40}else score-=20;
  if(p.days.includes(getDay())){score+=9;reasons.push('符合當日候選動線')}
  if(p.mealTimes.includes(nowMeal)){score+=24;reasons.push(nowMeal==='lunch'?'午餐候選':'晚餐候選')}
  if(db.foodSaved.includes(p.id)){score+=22;reasons.push('已收藏')}
  if(p.soloFriendly===true){score+=5;reasons.push('已確認適合單人')}
  if(s.favorites&&db.foodSaved.includes(p.id))score+=40;
  if(s.solo&&p.soloFriendly===true)score+=16;
  if(s.meal&&p.mealTimes.includes(nowMeal))score+=16;
  if(meeting?.remain<=Math.max(s.buffer,20)+75){
    if(p.areaId===meetingArea(meeting)){score+=25;reasons.push('與即將集合的區域一致')}
    else if(p.areaId&&p.areaId!==meetingArea(meeting))score-=55;
  }
  const status=s.foodStatus[p.id]||'';
  if(status==='skip'||status==='closed')score-=230;
  return {...p,score,reasons:reasons.length?reasons:['候選店家；資料待確認'],near,foodState:status};
 }
 function matchesBudget(p,range){if(range==='all')return true;if(p.priceMin===null&&p.priceMax===null)return false;const [lo,hi]=range.split(':').map(Number);return (p.priceMin??p.priceMax)<=hi&&(p.priceMax??p.priceMin)>=lo}
 function getRecommendations({all=false,area=currentArea()}={}){
  const s=state(),arr=compileFood().map(p=>rankFood(p,area));
  const out=arr.filter(p=>(!s.nearOnly||p.areaId===area)&&(s.cuisine==='all'||p.cuisineId===s.cuisine)&&matchesBudget(p,s.budget));
  out.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'ja'));
  if(!all)return out.filter(x=>x.foodState!=='skip'&&x.foodState!=='closed').slice(0,3);
  return out;
 }
 function nav(q,app='google'){return mapsLink(q,app)}
 function link(url,title){return url?`<a class="btn secondary smallbtn" href="${attr(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a>`:''}
 function buttons(q){return `<div class="actions">${link(nav(q),'Google Maps')}${link(nav(q,'apple'),'Apple Maps')}</div>`}
 function restaurantCard(p){
  const s=state(),status=s.foodStatus[p.id]||'',saved=db.foodSaved.includes(p.id),rawHours=p.hours||null;
  const price=p.priceMin!==null||p.priceMax!==null?'參考 ¥'+[p.priceMin,p.priceMax].filter(x=>x!==null).join('–'):'待確認';
  const query=[p.addr,p.name].filter(Boolean).join(' ')||p.name;
  const reason=p.reasons.join(' · ');
  const states=[['want','想去'],['done','已用餐'],['skip','不想去'],['closed','沒營業／找不到']];
  return `<article class="card ex-restaurant"><div class="ex-cardhead"><strong>${esc(p.name)}</strong><span class="pill">${esc(CATEGORY.find(v=>v[0]===p.cuisineId)?.[1]||'其他')}</span></div>
  <div class="mini-note">${esc(p.area||areaName(p.areaId))}${p.legacy?' · 舊版候選':''}${p.custom?' · 自訂餐廳':''}</div>
  <p class="ex-reason">推薦原因：${esc(reason)}</p><div class="ex-facts"><span>餐點：${esc(p.food||p.name)}</span><span>參考價格：${esc(price)}</span><span>單人用餐：${p.soloFriendly===true?'已確認':p.soloFriendly===false?'資料顯示不適合':'待確認'}</span>
  <span>營業時間：${rawHours?'參考 '+esc(rawHours):'待確認（非即時）'}</span><span>最後點餐：${esc(p.lastOrder||'待確認')}</span>${p.station?`<span>最近車站：${esc(p.station)}</span>`:''}</div>
  <p class="mini-note ex-wrap">${esc(p.addr||'完整地址待確認；以地區及店名搜尋')}</p>${p.tip?`<p class="hint">${esc(p.tip)}</p>`:''}
  <div class="actions"><button class="btn smallbtn ${saved?'secondary':'ghost'}" data-action="toggle-food" data-id="${attr(p.id)}">${saved?'★ 已收藏':'☆ 收藏'}</button>${states.map(([code,label])=>`<button class="btn smallbtn ${status===code?'':'secondary'}" data-explore="food-status" data-id="${attr(p.id)}" data-value="${code}">${label}</button>`).join('')}</div>
  <div class="actions"><button class="btn secondary smallbtn" data-explore="food-plan" data-id="${attr(p.id)}">加入當日用餐計畫</button>${link(p.source,'店家資訊／來源')}</div>
  ${buttons(query)}${photoWidget('food:'+p.id)}</article>`;
 }
 function meetingBanner(){
  const m=mealSafety();if(!m)return'';
  const near=m.remain<=180;return `<div class="card ${near?'ex-warn':''}"><strong>下一場正式集合：${displayDay(m.day)} ${esc(m.event.time)}（日本時間）</strong><p class="compact-notice">${esc(m.event.place)} · 距離 ${countdown(m.remain)}</p><div class="hint">${near?'距離集合較近；優先考慮集合區域。':'請注意當天行程與集合時間。'} 預留用餐、候位及交通緩衝；沒有可靠步行及候位資料，無法保證來得及。</div><label>希望保留緩衝時間 <select data-explore-change="buffer">${[20,30,45].map(v=>`<option value="${v}" ${state().buffer===v?'selected':''}>${v} 分鐘</option>`).join('')}</select></label></div>`;
 }
 function locationCard(){
  const s=state(),area=currentArea(),j=japanNow();
  return `<div class="card ex-location"><div class="row between wrap"><div><div class="eyelabel">目前區域 · ${esc(locationLabel())}</div><div class="title">${esc(areaName(area))}</div></div><button class="btn ghost smallbtn" data-explore="reset-area">依行程推測</button></div>
  <div class="grid2"><div><label>手動選擇地區</label><select data-explore-change="manual-area">${AREAS.map(([id,name])=>`<option value="${id}" ${id===area?'selected':''}>${esc(name)}</option>`).join('')}</select></div><div><label>搜尋地區</label><input id="ex-area-query" list="ex-area-options" placeholder="例如：兩國、東京站" autocomplete="off"><datalist id="ex-area-options">${AREAS.map(x=>`<option value="${esc(x[1])}"></option>`).join('')}</datalist></div></div>
  <div class="actions"><button class="btn secondary smallbtn" data-explore="area-search">使用搜尋結果</button><button class="btn secondary smallbtn" data-explore="gps">使用目前位置</button></div>
  ${s.locationMode==='gps'&&gps?`<p class="hint">本次 GPS：${esc(new Date(gps.time).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tokyo'}))} 日本時間取得；僅用於推測區域，未儲存座標。</p>`:''}
  ${locErr?`<p class="hint">${esc(locErr)}；可改用手動選區。</p>`:''}</div>`;
 }
 function restaurants(){
  const s=state(),all=getRecommendations({all:true}),main=all.filter(p=>p.foodState!=='skip'&&p.foodState!=='closed'),shown=expandAll?all:main.slice(0,3);
  const missingPrice=s.budget!=='all'?compileFood().filter(p=>p.areaId===currentArea()&&p.priceMin===null&&p.priceMax===null).length:0;
  return `${meetingBanner()}<div class="card ex-filters"><h2>附近餐廳</h2><div class="grid2"><div><label>料理類型</label><select data-explore-change="cuisine">${CATEGORY.map(([id,label])=>`<option value="${id}" ${s.cuisine===id?'selected':''}>${label}</option>`).join('')}</select></div><div><label>預算（每人日圓）</label><select data-explore-change="budget">${[['all','不限'],['0:1500','¥1,500 以下'],['1500:2500','¥1,500–2,500'],['2500:4000','¥2,500–4,000'],['4000:999999','¥4,000 以上']].map(([a,b])=>`<option value="${a}" ${a===s.budget?'selected':''}>${b}</option>`).join('')}</select></div></div>
  <div class="ex-switches">${[['solo','優先單人用餐'],['favorites','優先收藏'],['meal','優先當下時段'],['nearOnly','只看目前區域']].map(([id,label])=>`<label><input type="checkbox" data-explore-change="${id}" ${s[id]?'checked':''}><span>${label}</span></label>`).join('')}</div>
  ${missingPrice?`<p class="hint">已有 ${missingPrice} 間附近店家因缺少可信價格而未納入本次預算篩選，切回「不限」可查看。</p>`:''}<div class="actions"><button class="btn secondary smallbtn" data-explore="new-meal">＋ 自行新增餐廳</button><button class="btn secondary smallbtn" data-explore="toggle-all">${expandAll?'僅看前三家':'查看全部候選（'+all.length+'）'}</button></div></div>
  ${customEditing?renderCustomForm():''}
  ${shown.length?shown.map(restaurantCard).join(''):'<div class="card"><strong>目前條件沒有符合資料的餐廳。</strong><p class="hint">可取消「只看附近」或預算限制；缺少價格的店家不會被當成符合預算。</p><button class="btn secondary" data-explore="show-alternatives">查看其他候選</button></div>'}
  ${main.length===0&&all.length===0?`<div class="card"><p>附近沒有預載資料。可切換區域或自行新增餐廳。</p></div>`:''}`;
 }
 function renderCustomForm(){
  const x=customEditing?.id?compileFood().find(p=>p.id===customEditing.id):null;
  return `<div class="card"><h3>${x?'編輯自訂餐廳':'新增自訂餐廳'}</h3><form id="ex-meal-form"><label>店名</label><input name="name" required value="${attr(x?.name||'')}"><label>地區</label><input name="area" required value="${attr(x?.area||areaName(currentArea()))}"><label>餐點／備註</label><textarea name="food">${esc(x?.food||'')}</textarea><div class="actions"><button class="btn" type="submit">儲存</button><button type="button" class="btn secondary" data-explore="cancel-meal">取消</button></div></form></div>`;
 }
function giftItems(){
 return GIFT_STORES.flatMap(place=>place.items.map(it=>{
  const meta=GIFT_META[it.id]||{},area=meta.area||namesAsId(place.area+' '+place.name)||null;
  return {...it,place,meta,areaId:area,nameJa:meta.name||it.name,product:meta.product||it.desc};
 }));
}
function targetGoals(){
 return db.shopping.filter(isGiftGoal).map(g=>{
  const custom=state().goals[g.id]||{};
  return {...g,recipient:custom.recipient||(g.id==='shop-3'?'公司同事':g.text),type:custom.type||'食品／其他',target:Object.prototype.hasOwnProperty.call(custom,'target')?custom.target:(g.id==='shop-3'?30:null),budget:custom.budget??null,deadline:custom.deadline||'2026-11-21',priority:custom.priority||'一般'};
 });
}
function giftTotals(id){
 const buys=state().purchases.filter(x=>x.goalId===id);
 return {pieces:buys.reduce((t,x)=>t+x.boxes*x.perBox,0),boxes:buys.reduce((t,x)=>t+x.boxes,0),spent:buys.reduce((t,x)=>t+Number(x.price||0),0)};
}
function goalCard(){
 return `<div class="card"><h2>伴手禮採買目標</h2>${targetGoals().map(g=>{
  const t=giftTotals(g.id),target=Number.isInteger(g.target)?g.target:null,remaining=target===null?null:Math.max(0,target-t.pieces);
  return `<section class="ex-goal"><div class="row between"><strong>${esc(g.text)}</strong><button class="btn ghost smallbtn" data-explore="edit-goal" data-id="${attr(g.id)}">設定目標</button></div>
  <div class="ex-count"><strong>${t.pieces} 份</strong><span>／${target===null?'份數未設定':target+' 份目標'}</span></div>
  <p class="mini-note">已買 ${t.boxes} 盒 · ${remaining===null?'未設定目標份數':remaining===0?'已達標':`還缺 ${remaining} 份`} · 實付已記錄 ¥${t.spent.toLocaleString('ja-JP')}</p>
  <p class="mini-note">對象：${esc(g.recipient)} · 預算：${g.budget===null?'待設定':'¥'+g.budget} · 期限：${esc(g.deadline)} · ${esc(g.priority)}</p>${g.done?'<span class="pill">舊購物清單已勾選（不代表份數已達標）</span>':''}
  ${state().editGoal===g.id?goalForm(g):''}</section>`;
 }).join('')}${!targetGoals().length?'<p class="hint">尚未設定採買目標，請在「收藏／購物清單」加入。</p>':''}</div>`;
}
function goalForm(g){
 return `<form id="ex-goal-form" data-id="${attr(g.id)}"><label>對象</label><input name="recipient" required value="${attr(g.recipient)}"><label>商品類型</label><input name="type" value="${attr(g.type)}"><div class="grid2"><div><label>需求份數</label><input name="target" type="number" min="1" step="1" value="${g.target??''}" placeholder="待確認"></div><div><label>採買預算（日圓）</label><input name="budget" type="number" min="0" step="1" value="${g.budget??''}" placeholder="可不填"></div></div><div class="grid2"><div><label>購買期限</label><input name="deadline" type="date" value="${attr(g.deadline)}"></div><div><label>優先級</label><select name="priority">${['高','一般','低'].map(v=>`<option ${v===g.priority?'selected':''}>${v}</option>`).join('')}</select></div></div><button class="btn" type="submit">儲存採買目標</button></form>`;
}
function itemById(id){return giftItems().find(x=>x.id===id)}
function route(){
 const items=giftItems();
 return [...TOKYO_ORDER.map(id=>items.find(x=>x.id===id)).filter(Boolean),...items.filter(x=>x.areaId==='tokyo'&&!TOKYO_ORDER.includes(x.id))];
}
function nextGift(id){
 const all=route().filter(i=>i.areaId==='tokyo'),n=all.findIndex(i=>i.id===id);
 return all.slice(n+1).concat(all.slice(0,n+1)).find(x=>!['bought','out','missing','skip'].includes(state().tasks[x.id]))||null;
}
function showGiftCard(it,{step=false}={}){
 const meta=it.meta,mark=state().tasks[it.id]||'not',bought=state().purchases.filter(x=>x.itemId===it.id);
 const visited=db.giftChecked.includes(it.place.id);
 const goal=targetGoals().find(g=>g.id==='shop-3'),remaining=goal&&Number.isInteger(goal.target)?Math.max(0,goal.target-giftTotals(goal.id).pieces):null;
 const suggested=remaining!==null&&meta.pack&&remaining>0?Math.ceil(remaining/meta.pack):null;
 const availability=it.areaId===currentArea()?'目前選擇區域':'其他區域';
 const place=meta.address||it.place.addr||'地址待確認',query=meta.address||place+' '+(meta.name||it.name);
 const price=meta.price!==undefined&&meta.price!==null?'參考 ¥'+meta.price.toLocaleString('ja-JP'):'參考價格待確認';
 const loc=[meta.floor||'樓層待確認',meta.zone||it.place.area||'區域待確認',meta.gate||it.place.gate||'閘門狀態待確認'].join(' · ');
 return `<article class="card ex-gift"><div class="row between wrap"><strong class="ex-title">${esc(it.nameJa)}</strong><span class="pill">${esc(availability)}</span></div>
 <p class="ex-product">${esc(it.product)}</p><div class="ex-facts"><span>位置：${esc(loc)}</span><span>參考價格：${esc(price)}</span><span>參考營業：${esc(meta.hours||it.place.hours||'待確認（非即時）')}</span><span>保存：${esc(meta.storage||'待確認')}</span><span>獨立包裝：${meta.individuallyWrapped===true?'商品資料已確認':meta.individuallyWrapped===false?'非獨立包裝':'待確認'}</span><span>賞味期限：${esc(meta.shelf||'以商品包裝標示為準')}</span></div>
 <p class="mini-note ex-wrap">所在地：${esc(place)}</p><p class="hint">${esc(it.note||it.place.tip||'請現場確認商品及數量。')} ${meta.pack?`已查到一款 ${meta.pack} 入包裝；實際購買規格仍需自行輸入。`:''}</p>
 ${suggested!==null?`<p class="ex-reason">若購買已核對的 ${meta.pack} 入規格，目前至少建議 ${suggested} 盒；實際盒數與每盒入數以現場商品為準。</p>`:''}
 ${meta.gate==='JR 改札內'?'<p class="hint">此店在 JR 閘門內，須確認是否可持車票或入場券進站；Google Maps 無法保證指到櫃位。</p>':''}
 ${it.place.days?`<p class="mini-note">建議路線：${esc(it.place.days)}</p>`:''}
 <div class="actions">${link(meta.official||it.place.source,'官方店家／商品資訊')}${link(meta.map||it.place.source,'官方樓層圖／位置')}</div>${buttons(query)}
 <div class="ex-state"><span class="mini-note">本次任務：${esc(({'not':'未前往','near':'已到附近','found':'已找到店家','out':'商品缺貨','missing':'找不到店家','bought':'已購買','skip':'略過'})[mark])}</span>${bought.length?`<span class="pill">紀錄 ${bought.reduce((n,x)=>n+x.boxes*x.perBox,0)} 份</span>`:''}${visited?'<span class="pill">舊版已逛過</span>':''}</div>
 <div class="actions">${[['near','已到附近'],['found','已找到'],['out','商品缺貨'],['missing','找不到店家'],['skip','略過']].map(([v,label])=>`<button class="btn smallbtn ${mark===v?'':'secondary'}" data-explore="gift-status" data-id="${attr(it.id)}" data-value="${v}">${label}</button>`).join('')}<button class="btn smallbtn" data-explore="buy-open" data-id="${attr(it.id)}">記錄購買</button></div>
 ${buying===it.id?buyForm(it):''}
 ${step?`<div class="actions"><button class="btn secondary smallbtn" data-explore="next-gift" data-id="${attr(it.id)}">下一家</button></div>`:''}
 ${db.giftChecked.includes(it.id)&&!bought.length?'<p class="hint">舊版標記「已購入」，但尚未有盒數與份數；需另行補記。</p>':''}
 ${bought.map(p=>`<div class="ex-mini-item"><span class="mini-note">已記：${p.boxes} 盒 × ${p.perBox} 份 = ${p.boxes*p.perBox} 份${p.price===null?'':' · ¥'+p.price}</span><button class="btn ghost smallbtn" data-explore="remove-purchase" data-id="${attr(p.id)}">撤銷此筆</button></div>`).join('')}${photoWidget('giftitem:'+it.id)}</article>`;
}
function buyForm(it){
 const goals=targetGoals();return `<form id="ex-purchase-form" data-id="${attr(it.id)}"><h3>確認實際購買</h3><div class="grid2"><div><label>買了幾盒</label><input type="number" name="boxes" min="1" max="999" step="1" required placeholder="例如：3"></div><div><label>每盒幾份（獨立包裝）</label><input type="number" name="perBox" min="1" max="999" step="1" required placeholder="例如：12"></div></div><label>實際支付日圓（可留空）</label><input type="number" name="price" min="0" step="1" placeholder="按購買總價填寫"><label>計入哪個採買目標</label><select name="goalId"><option value="">不計入任何目標</option>${goals.map(g=>`<option value="${attr(g.id)}" ${g.id==='shop-3'?'selected':''}>${esc(g.text)}</option>`).join('')}</select><p class="hint">系統以「盒數 × 每盒可獨立分送份數」計算。請依實際購買包裝輸入，不會假設各品牌相同入數；購物支出不會自動變成記帳紀錄。</p><div class="actions"><button class="btn" type="submit">確認購買</button><button class="btn secondary" type="button" data-explore="buy-cancel">取消</button></div></form>`;
}
function tokyoSummary(){
 const company=targetGoals().find(g=>g.id==='shop-3'),tot=company?giftTotals(company.id):{pieces:0};
 const remaining=company?.target===null?null:Math.max(0,(company?.target??0)-tot.pieces);
 const pending=route().filter(i=>i.areaId==='tokyo'&&!['bought','skip'].includes(state().tasks[i.id]));
 return `<div class="card ex-tokyo"><h2>東京站採買導覽</h2><p>優先：<strong>JR 閘門內 B1 銀之鈴區</strong>（AUDREY、富士見堂）→ <strong>閘門內 1F 中央通路</strong>（Sabrina）→ <strong>閘門外八重洲北口 1F</strong>（PISTA & TOKYO）。</p>
 <p class="hint">在閘門內採買時先完成同區店家，再前往其他樓層。是否能入站需看車票／入場券規定；官方樓層圖可離線前先截圖留存。</p>
 <div class="actions"><button class="btn" data-explore="tokyo-start">開始東京站採買／我已抵達</button><button class="btn secondary" data-explore="tokyo-leave">準備離開東京站</button></div>
 <p class="mini-note">公司禮物：${tot.pieces} 份${remaining===null?'（目標未設定）':remaining===0?'，已達標':`，還缺 ${remaining} 份`}；東京站仍有 ${pending.length} 個未完成／未略過候選。</p>
 ${state().tokyoStage==='leave'?`<div class="notice info"><strong>離站前確認</strong><p>尚未完成店家／商品：${pending.length?pending.slice(0,7).map(i=>esc(i.nameJa)).join('、'):'目前沒有未完成任務'}</p><p>${remaining===null?'尚未設定公司禮物份數目標':remaining===0?'公司禮物份數已達標':'公司禮物尚缺 '+remaining+' 份'}</p><button class="btn secondary smallbtn" data-explore="tokyo-defer">保留未完成任務，稍後補買</button></div>`:''}</div>`;
}
function giftPage(){
 const s=state(),area=currentArea(),items=giftItems();
 let recommended=area==='tokyo'?route():items.filter(i=>i.areaId===area);
 if(!recommended.length)recommended=items.filter(i=>i.areaId==='tokyo').slice(0,4);
 const active=s.selectedGift?itemById(s.selectedGift):null;
 const sorted=[...recommended].sort((a,b)=>(['bought','skip','out','missing'].includes(s.tasks[a.id])?1:0)-(['bought','skip','out','missing'].includes(s.tasks[b.id])?1:0));
 const first=active&&sorted.find(x=>x.id===active.id)?active:sorted[0];
 return `${goalCard()}${area==='tokyo'||s.tokyoStage!=='none'?tokyoSummary():''}
 <div class="card"><h2>${area==='tokyo'?'東京站商品任務':'附近伴手禮候選'}</h2><p class="hint">共有 ${items.length} 個保留原資料的商品候選，依區域選擇。舊版「已逛過／已購入」紀錄保留，但不直接算進購買份數。</p>
 <div class="actions"><button class="btn secondary smallbtn" data-explore="gift-all">查看全部商品候選</button>${area!=='tokyo'?'<button class="btn secondary smallbtn" data-explore="tokyo-start">切到東京站採買</button>':''}</div></div>
 ${first?showGiftCard(first,{step:true}):''}
 <details class="card quiet-details"><summary>其他同區候選（${Math.max(0,sorted.length-1)}）</summary><div class="details-content">${sorted.filter(x=>x.id!==first?.id).map(x=>`<div class="ex-mini-item"><strong>${esc(x.nameJa)}</strong><p class="mini-note">${esc(x.meta.floor||x.place.area)} · ${esc(x.meta.gate||x.place.gate)}</p><button class="btn secondary smallbtn" data-explore="gift-select" data-id="${attr(x.id)}">查看購物任務</button></div>`).join('')||'<p class="hint">沒有更多同區候選</p>'}</div></details>
 <details class="card quiet-details"><summary>全部七個原購物地點（保留原有勾選與照片）</summary><div class="details-content">${GIFT_STORES.map(p=>`<div class="ex-mini-item"><strong>${esc(p.name)}</strong><p class="mini-note">${esc(p.area)} · ${esc(p.gate)}</p><label><input type="checkbox" data-giftid="${attr(p.id)}" ${db.giftChecked.includes(p.id)?'checked':''}> 已逛過此地點（與是否購買分開）</label>${photoWidget('gift:'+p.id)}</div>`).join('')}</div></details>`;
}
function giftFullList(){return `<div class="card"><h3>全部商品候選（${giftItems().length}）</h3>${giftItems().map(it=>`<div class="ex-mini-item"><div class="row between wrap"><strong>${esc(it.nameJa)}</strong><span class="mini-note">${esc(it.place.name)}</span></div><p class="mini-note">${esc(it.product)}</p><button class="btn secondary smallbtn" data-explore="gift-select" data-id="${attr(it.id)}">查看店家／任務</button></div>`).join('')}</div>`}
function favoritesPage(){
 const saved=compileFood().filter(p=>db.foodSaved.includes(p.id)||state().foodStatus[p.id]==='want');
 const custom=compileFood().filter(p=>p.custom&&!saved.some(x=>x.id===p.id));
 const goals=db.shopping.filter(isGiftGoal),todo=db.shopping.filter(s=>!isGiftGoal(s));
 return `<div class="card"><h2>我的餐廳收藏（${saved.length}）</h2><p class="hint">包含其他日期和舊版收藏，保留既有餐廳 ID、照片及收藏。</p>${saved.map(p=>`<div class="ex-mini-item"><strong>${esc(p.name)}</strong><span class="mini-note"> ${esc(p.area||'區域未填')}</span><div class="actions"><button class="btn secondary smallbtn" data-explore="food-detail" data-id="${attr(p.id)}">查看資訊</button><button class="btn ghost smallbtn" data-action="toggle-food" data-id="${attr(p.id)}">取消收藏</button></div>${photoWidget('food:'+p.id)}</div>`).join('')||'<p>尚無收藏</p>'}</div>
 <div class="card"><h2>自行新增餐廳（${custom.length}）</h2>${custom.map(p=>`<div class="ex-mini-item"><strong>${esc(p.name)}</strong><p>${esc(p.area)}</p><button class="btn secondary smallbtn" data-explore="custom-edit" data-id="${attr(p.id)}">編輯</button>${photoWidget('food:'+p.id)}</div>`).join('')||'<p class="hint">尚無自行新增餐廳</p>'}<button class="btn secondary" data-explore="new-meal">＋ 新增餐廳</button>${customEditing?renderCustomForm():''}</div>
 <div class="card"><h2>原有伴手禮購物清單</h2><p class="hint">原勾選狀態保留。購物目標完成與「購買份數達標」分別計算。</p>${renderShoppingItems(goals)}<button class="btn secondary smallbtn" data-action="add-goal">＋ 新增採買目標</button></div>
 <div class="card"><h2>其他購物／旅行待辦</h2>${renderShoppingItems(todo)}<button class="btn secondary smallbtn" data-action="add-shop">＋ 新增待辦</button></div>
 ${targetGoals().length?goalCard():''}`;
}
function renderPage(){
 return `<div class="sectionhead"><h2>附近探索</h2><span class="pill">離線候選</span></div>${locationCard()}
 <div class="ex-subtabs" role="group" aria-label="探索分類">${[['food','附近餐廳'],['gifts','伴手禮採買'],['saved','我的收藏／購物清單']].map(([v,l])=>`<button type="button" class="btn ${v===subTab?'':'secondary'}" aria-pressed="${v===subTab}" data-explore="subtab" data-value="${v}">${l}</button>`).join('')}</div>
 ${subTab==='food'?restaurants():subTab==='gifts'?giftPage()+(state().giftAll?giftFullList():''):favoritesPage()}`;
}
function areaForDay(day){return ({0:'akihabara',1:'ryogoku',2:'daimon',3:'kenkyu',4:'kunitachi',5:'mitaka',6:'haneda'})[day]||'kanda'}
function dayHint(day){
 const area=day===getDay()?currentArea():areaForDay(day);
 const count=compileFood().filter(p=>p.days.includes(day)).length;
 const hasTokyo=(day===0||day===2||day===6);
 return `<div class="card" id="food-spots"><h2>當日沿途餐廳與採買探索</h2><p class="muted">資料庫保留原本 ${count} 間當日餐廳及自訂項目；可依現在所在地重新排序，不會更動正式參訪行程。</p><div class="actions"><button class="btn" data-explore="day-food" data-day="${day}" data-area="${attr(area)}">查看附近餐廳</button><button class="btn secondary" data-explore="day-gifts" data-day="${day}" data-area="${attr(area)}">查看伴手禮</button></div>${hasTokyo?'<p class="hint">若經過東京站，可開啟「開始東京站採買」，離開前再檢查未完成商品。</p>':''}</div>`;
}
function homeWidget(){
 const id=currentArea(),area=areaName(id),day=getDay(),j=japanNow();
 const nearby=compileFood().filter(p=>p.areaId===id);
 const pendingNearby=giftItems().filter(it=>it.areaId===id&&!['bought','skip'].includes(state().tasks[it.id]));
 const s=state(),company=targetGoals().find(g=>g.id==='shop-3'),stats=company?giftTotals(company.id):{pieces:0};
 const remain=company&&Number.isInteger(company.target)?Math.max(0,company.target-stats.pieces):null;
 const shoppingDay=(day===0||day===2||day===3||day===5||day===6);
 return `<div class="card ex-home"><div class="row between wrap"><div><div class="eyelabel">目前區域 · ${esc(locationLabel())}</div><h2>${esc(area)}</h2></div><button class="btn ghost smallbtn" data-explore="open-area">更改地區</button></div>
 ${nearby.length?`<p class="mini-note">附近候選：${nearby.slice(0,3).map(x=>esc(x.name)).join('、')}</p>`:''}<div class="actions"><button class="btn" data-explore="open-food">附近吃什麼？（${nearby.length}）</button><button class="btn secondary" data-explore="open-gifts">附近可以買什麼？</button></div>
 ${pendingNearby.length?`<p class="mini-note">附近未完成採買：${pendingNearby.slice(0,2).map(it=>esc(it.nameJa)).join('、')}${pendingNearby.length>2?' 等 '+pendingNearby.length+' 項':''}</p>`:''}
 ${shoppingDay?`<p class="hint">採買進度：公司禮物已記 ${stats.pieces} 份${remain===null?'（目標尚未設定）':remain===0?'，已達標':'、尚缺 '+remain+' 份'}。${day===0&&j.hour>=17?'今日有東京站伴手禮採買候選。':''}</p><button class="btn secondary smallbtn" data-explore="open-gifts">查看今天未完成任務</button>`:''}</div>`;
}
function open(type,area=null){
 if(area)setArea(area);
 subTab=type==='gift'?'gifts':type==='saved'?'saved':'food';
 chooseTab('shop');
}
function click(ev){
 const b=ev.target.closest?.('[data-explore]');if(!b)return false;
 const act=b.dataset.explore,id=b.dataset.id,v=b.dataset.value,s=state();let changed=true;
 if(act==='subtab'){subTab=v;expandAll=false;customEditing=null;buying=null}
 else if(act==='reset-area'){s.locationMode='schedule';gps=null;locErr=''}
 else if(act==='area-search'){const q=(document.getElementById('ex-area-query')?.value||'').trim().toLowerCase();if(!q){toast('請輸入地區名稱');return true}const a=AREAS.find(a=>a[1].toLowerCase().includes(q)||a[0]===q||a[4].some(alias=>alias.toLowerCase().includes(q)));if(!a){toast('無符合地區，請改用下拉選單');return true}setArea(a[0])}
 else if(act==='gps'){
  if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){locErr='目前不是 HTTPS，無法使用定位';render();return true}
  if(!navigator.geolocation){locErr='目前瀏覽器不支援定位';render();return true}
  locErr='正在請求單次 GPS 定位…';render();
  navigator.geolocation.getCurrentPosition(pos=>{
   const candidate={lat:pos.coords.latitude,lng:pos.coords.longitude,time:Date.now()};
   const near=AREAS.slice().sort((a,b)=>hav(a[2],a[3],candidate.lat,candidate.lng)-hav(b[2],b[3],candidate.lat,candidate.lng))[0];
   if(hav(near[2],near[3],candidate.lat,candidate.lng)>40){gps=null;locErr='座標不在本次東京行程區域附近，未切換地區';render();return}
   gps=candidate;s.locationMode='gps';locErr='';save();render();
  },e=>{locErr=e.code===1?'定位權限遭拒絕':e.code===2?'無法取得位置':'定位逾時';render()},{enableHighAccuracy:false,timeout:10000,maximumAge:0});
  return true;
 }
 else if(act==='toggle-all'){expandAll=!expandAll}
 else if(act==='show-alternatives'){s.nearOnly=false;s.budget='all';expandAll=true}
 else if(act==='food-status'){s.foodStatus[id]=s.foodStatus[id]===v?'':v}
 else if(act==='food-detail'){subTab='food';s.nearOnly=false;expandAll=true;s.favorites=true}
 else if(act==='food-plan'){
  const p=compileFood().find(x=>x.id===id);if(!p)return true;
  const day=getDay(),defaultTime=japanNow().time;
  const time=prompt('加入 '+displayDay(day)+' 用餐計畫，輸入日本時間（HH:MM；請自行留意集合）',defaultTime);
  if(time===null)return true;
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)){toast('請輸入 HH:MM 時間');return true}
  db.events.push({id:makeId('mealplan'),day,time,sortTime:time,title:'用餐候選：'+p.name,kind:'meal',place:p.addr||p.area||p.name,detail:'來自探索；未訂位。候位、移動時間請自行確認，不代表保證能趕上正式集合。',timezone:'Asia/Tokyo',status:'planned',edited:true});
  toast('已加入 '+displayDay(day)+' 的個人用餐計畫');save();
 }
 else if(act==='new-meal'){customEditing={day:getDay(),id:null};subTab='food'}
 else if(act==='custom-edit'){const p=compileFood().find(x=>x.id===id);customEditing={day:p?.days[0]??getDay(),id};subTab='food';s.nearOnly=false}
 else if(act==='cancel-meal'){customEditing=null}
 else if(act==='edit-goal'){s.editGoal=s.editGoal===id?null:id}
 else if(act==='gift-select'){const item=itemById(id);if(item?.areaId)setArea(item.areaId);s.selectedGift=id;subTab='gifts';buying=null}
 else if(act==='gift-status'){
  s.tasks[id]=v;if(v==='found'){const x=itemById(id);if(x&&!db.giftChecked.includes(x.place.id))db.giftChecked.push(x.place.id)}
  if(v==='out'||v==='missing'||v==='skip'){const n=nextGift(id);s.selectedGift=n?.id||id;buying=null}else s.selectedGift=id;
  subTab='gifts';
 }
 else if(act==='buy-open'){buying=id;s.selectedGift=id;subTab='gifts'}
 else if(act==='buy-cancel'){buying=null}
 else if(act==='next-gift'){s.selectedGift=nextGift(id)?.id||id;buying=null}
 else if(act==='tokyo-start'){setArea('tokyo');subTab='gifts';s.tokyoStage='shopping';const todo=route().find(x=>!['bought','out','missing','skip'].includes(s.tasks[x.id]));s.selectedGift=todo?.id||TOKYO_ORDER[0]}
 else if(act==='tokyo-leave'){s.tokyoStage='leave';subTab='gifts'}
 else if(act==='tokyo-defer'){s.tokyoStage='none'}
 else if(act==='gift-all'){s.giftAll=!s.giftAll}
 else if(act==='remove-purchase'){const p=s.purchases.find(x=>x.id===id);if(!p||!confirm('刪除這筆購買份數紀錄？'))return true;s.purchases=s.purchases.filter(x=>x.id!==id);if(!s.purchases.some(x=>x.itemId===p.itemId))s.tasks[p.itemId]='found'}
 else if(act==='day-food'||act==='day-gifts'){open(act==='day-food'?'food':'gift',b.dataset.area);return true}
 else if(act==='open-food'){open('food');return true}
 else if(act==='open-gifts'){open('gift');return true}
 else if(act==='open-area'){open('food');return true}
 else changed=false;
 if(changed){save();render()}return changed;
}
function change(ev){
 const el=ev.target,v=el.dataset.exploreChange;if(!v)return false;
 const s=state();
 if(v==='manual-area'){setArea(el.value)}
 else if(v==='buffer')s.buffer=[20,30,45].includes(Number(el.value))?Number(el.value):30;
 else if(v==='cuisine')s.cuisine=CATEGORY.some(x=>x[0]===el.value)?el.value:'all';
 else if(v==='budget')s.budget=['all','0:1500','1500:2500','2500:4000','4000:999999'].includes(el.value)?el.value:'all';
 else if(['solo','favorites','meal','nearOnly'].includes(v))s[v]=!!el.checked;
 else return false;
 save();render();return true;
}
function submit(ev){
 const f=ev.target;if(!['ex-goal-form','ex-purchase-form','ex-meal-form'].includes(f.id))return false;
 ev.preventDefault();const o=Object.fromEntries(new FormData(f)),s=state(),num=x=>x===''?null:Number(x);
 if(f.id==='ex-goal-form'){
  if(!db.shopping.some(x=>x.id===f.dataset.id))return true;
  const target=num(o.target),budget=num(o.budget);
  if((target!==null&&(!Number.isSafeInteger(target)||target<=0))||(budget!==null&&(!Number.isSafeInteger(budget)||budget<0))){toast('份數與金額必須是有效的整數');return true}
  s.goals[f.dataset.id]={recipient:String(o.recipient||'').trim(),type:String(o.type||'').trim(),target,budget,deadline:o.deadline||'2026-11-21',priority:['高','一般','低'].includes(o.priority)?o.priority:'一般'};
  s.editGoal=null;save();render();return true;
 }
 if(f.id==='ex-purchase-form'){
  const boxes=num(o.boxes),perBox=num(o.perBox),price=num(o.price);
  if(![boxes,perBox].every(x=>Number.isSafeInteger(x)&&x>0&&x<=999)||!Number.isSafeInteger(boxes*perBox)||price!==null&&(!Number.isSafeInteger(price)||price<0)){toast('請填入有效的盒數、每盒份數、實際總價');return true}
  const item=itemById(f.dataset.id);if(!item)return true;
  s.purchases.push({id:makeId('purchase'),itemId:item.id,boxes,perBox,price,goalId:db.shopping.some(g=>g.id===o.goalId)?o.goalId:null,createdAt:new Date().toISOString()});
  s.tasks[item.id]='bought';buying=null;s.selectedGift=item.id;
  if(!db.giftChecked.includes(item.id))db.giftChecked.push(item.id);
  if(!db.giftChecked.includes(item.place.id))db.giftChecked.push(item.place.id);
  save();render();toast(`已記錄 ${boxes} 盒 × ${perBox} 份 = ${boxes*perBox} 份`);return true;
 }
 if(f.id==='ex-meal-form'){
  const name=String(o.name||'').trim(),area=String(o.area||'').trim(),food=String(o.food||'').trim();
  if(!name||!area){toast('需填店名與地區');return true}
  const day=customEditing?.day??getDay(),id=customEditing?.id;
  const old=(db.meals[day]||[]).find(x=>x.id===id);
  if(old){old.name=name;old.area=area;old.food=food;old.edited=true}
  else (db.meals[day]??=[]).push({id:makeId('meal'),name,area,food,edited:true});
  customEditing=null;save();render();toast('自訂餐廳已儲存');return true;
 }
 return false;
}
 return {AREAS,GIFT_META,TOKYO_ORDER,defaults,state,validArea,areaName,guessArea,currentArea,locationLabel,setArea,compileFood,rankFood,getRecommendations,mealSegment,restaurantCard,restaurants,locationCard,meetingBanner,giftItems,targetGoals,giftTotals,goalCard,itemById,route,nextGift,showGiftCard,buyForm,tokyoSummary,giftPage,areaForDay,renderPage,dayHint,homeWidget,open,click,change,submit};
})();
