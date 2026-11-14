const SecretShopping=(function SecretFactory(){
 const KEY='tokyo-visit-secret-shopping-v1';
 const GROUPS=[
 {id:'anime',title:'A｜Keroro、鋼彈與動漫周邊',items:[
 ['k1','Keroro 軍曹扭蛋','ケロロ軍曹 ガシャポン','秋葉原 Bandai 官方扭蛋店','bandai'],
 ['k2','鋼彈扭蛋','ガンダム ガシャポン','秋葉原 Bandai 官方扭蛋店','bandai'],
 ['k3','Keroro 07 幼年期模型','ケロロ軍曹プラモコレクション 07 ちびケロ','秋葉原模型店／上野 Yamashiroya','surugaya,yamashiroya'],
 ['k11','Keroro 08 爆炸頭軍曹模型','ケロロ軍曹プラモコレクション 08 アフロ軍曹','秋葉原駿河屋模型館','surugaya'],
 ['k4','Keroro 一般娃娃、玩偶或吊飾','ケロロ軍曹 ぬいぐるみ／マスコット','上野 Yamashiroya、秋葉原動漫店','yamashiroya'],
 ['k5','Keroro 文具','ケロロ軍曹 文房具','上野 Yamashiroya','yamashiroya'],
 ['k6','Keroro 貼紙','ケロロ軍曹 ステッカー','上野 Yamashiroya、原宿角色商店','yamashiroya'],
 ['k7','Keroro 其他周邊','ケロロ軍曹 グッズ','秋葉原 DONKI、上野 Yamashiroya','donki,yamashiroya'],
 ['k8','鋼彈模型或一般周邊（非扭蛋）','ガンプラ／ガンダムグッズ','秋葉原模型店、上野 Yamashiroya','surugaya,yamashiroya'],
 ['k9','niko and ... × Keroro 娃娃','niko and ... ケロロ軍曹 ぬいぐるみ','niko and ... 店面／聯名商品通路，待確認',''],
 ['k10','tiny tiny × Keroro 聯名娃娃／商品','tiny tiny ケロロ軍曹 コラボ','新宿 tiny tiny LUMINE EST','tinytiny']
 ]},
 {id:'snacks',title:'B｜角色、零食與糖果',items:[
 ['s1','曬黑酷洛米娃娃／吊飾','日焼けクロミ マスコット','秋葉原 DONKI、Sanrio 商品店','donki'],
 ['s2','明治香菇造型巧克力','明治 きのこの山','DONKI、超市、便利商店','donki'],
 ['s3','明治竹筍造型巧克力','明治 たけのこの里','DONKI、超市、便利商店','donki'],
 ['s4','黃色包裝 Chupa Chups 酸糖','チュッパチャプス サワー バイツ／ゲッコー','便利商店、DONKI、進口糖果店','donki']
 ]},
 {id:'meds',title:'C｜藥品',items:[
 ['m1','粉紅色痘痘藥 24g','エプールアクネクリーム','DONKI 藥品區、藥妝店','donki'],
 ['m2','曼秀雷敦 AD 止癢乳膏','メンソレータムAD','DONKI、藥妝店','donki'],
 ['m3','小林製藥肩頸止痛滾珠 90mL','アンメルツヨコヨコA ロング','DONKI、藥妝店','donki']
 ]},
 {id:'clothes',title:'D｜UNIQLO 服飾',items:[
 ['u1','UNIQLO 女裝羅紋連帽上衣（長袖）｜灰色 S','フーデッドリブT／商品番号 488298','秋葉原 UNIQLO ヨドバシAkiba店','uniqlo']
 ]}];
 const SPECIAL={
 k3:'依參考照片尋找 07 ちびケロ；與新加的 08 アフロ軍曹 為兩件不同模型，不可相互替代。',
 k11:'指定 08 アフロ軍曹（爆炸頭軍曹）；數量待確認。與 07 ちびケロ 分開找、分開勾選，缺貨不可自行替換。',
 k4:'新增紅圈照片指定需求：Keroro 娃娃、吊飾依委託人原圖選款；照片未提供明確型號，不自行替換。',
 k5:'新增紅圈照片指定需求：Keroro 文具依委託人原圖比對紅圈位置，不確定型號先詢問。',
 k6:'新增紅圈照片指定需求：Keroro 貼紙依委託人原圖比對紅圈位置，不確定款式先詢問。',
 k7:'Keroro 小型周邊依紅圈照片比對，注意不要與娃娃、文具、貼紙重複代購。',
 u1:'UNIQLO 官方商品編號 488298；03 GRAY（灰色）、WOMEN S。數量暫定 1 件，尚待委託人最終確認；請先核對店面庫存。',
 k9:'可能與 tiny tiny 聯名是同一筆委託，請先確認避免重複購買。',
 k10:'請確認要買的是玩偶吊飾或連帽毯；兩者為不同商品。',
 s4:'日本 7-Eleven 2026/11/23 才開始陸續販售，晚於回臺日期；不保證買得到。',
 m1:'確定 2 條。以原照片、24g 和 JAN 4987754104139 核對；日文正確名稱是「エプール」。',
 m2:'只出現在參考圖片，尚未明確確認是否委託購買。',
 m3:'只出現在參考圖片，尚未明確確認是否委託購買。'
 };
 const SHOPS=[
 {id:'bandai',name:'Gashapon Bandai Official Shop 秋葉原店',date:'11/15 秋葉原',address:'東京都千代田区外神田1-15-9',hours:'參考 10:00–23:00',map:'https://maps.app.goo.gl/t99NUow8eKqmFFo56'},
 {id:'surugaya',name:'駿河屋 秋葉原プラモデル館',date:'11/15 秋葉原',address:'東京都千代田区外神田4-4-2',hours:'週日參考 10:00–21:00'},
 {id:'donki',name:'ドン・キホーテ 秋葉原店',date:'11/15 秋葉原',address:'東京都千代田区外神田4-3-3',hours:'參考 24 小時'},
 {id:'yamashiroya',name:'ヤマシロヤ Yamashiroya',date:'11/18 上野',address:'東京都台東区上野6-14-6',hours:'參考 10:00–21:30',map:'https://maps.app.goo.gl/xLkqrYq516yJ9v3c7'},
 {id:'tinytiny',name:'tiny tiny ルミネエスト新宿店',date:'新宿需另行安排',address:'東京都新宿区新宿3-38-1',hours:'週末參考 10:30–21:00；平日 11:00–21:00'},
 {id:'uniqlo',name:'ユニクロ ヨドバシAkiba店',date:'11/15 秋葉原',address:'東京都千代田区神田花岡町1-1 ヨドバシAkiba 7F',hours:'參考 9:30–22:00（官方店面資料）'}
 ];
 const ITEMS=GROUPS.flatMap(g=>g.items.map(a=>({id:a[0],name:a[1],ja:a[2],where:a[3],shops:a[4]?a[4].split(','):[],target:a[0]==='m1'?2:null,optional:['m2','m3'].includes(a[0]),caution:SPECIAL[a[0]]||''})));
 const MAP=new Map(ITEMS.map(x=>[x.id,x])),STATUSES=['todo','bought','missing','skip'];
 const SHOP_GROUPS=[
 {title:'11/15（日）｜秋葉原',shops:['bandai','surugaya','donki','uniqlo']},
 {title:'11/18（三）｜上野',shops:['yamashiroya']},
 {title:'另行安排｜新宿',shops:['tinytiny']}
 ];
 const storeItems=shop=>ITEMS.filter(item=>item.shops.includes(shop.id));
 const storeStats=shop=>{const items=storeItems(shop);return {done:items.filter(complete).length,total:items.length}};
 const unassignedItems=()=>ITEMS.filter(item=>!item.shops.length);

 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const initial=()=>({items:Object.fromEntries(ITEMS.map(x=>[x.id,{status:'todo',qty:null,note:''}])),shops:Object.fromEntries(SHOPS.map(x=>[x.id,false]))});
 function normalize(raw){
   const out=initial();if(!raw||typeof raw!=='object')return out;
   for(const x of ITEMS){const v=raw.items?.[x.id];if(!v||typeof v!=='object')continue;
     if(STATUSES.includes(v.status))out.items[x.id].status=v.status;
     if(v.qty!==''&&v.qty!==null&&v.qty!==undefined&&Number.isSafeInteger(Number(v.qty))&&Number(v.qty)>=0&&Number(v.qty)<=9999)out.items[x.id].qty=Number(v.qty);
     if(typeof v.note==='string')out.items[x.id].note=v.note.slice(0,2000);
   }
   for(const shop of SHOPS)out.shops[shop.id]=raw.shops?.[shop.id]===true;
   return out;
 }
 let state=(()=>{try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return initial()}})();
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{message('代購資料儲存失敗，請先匯出獨立備份');return false}};
 function message(t){const x=document.getElementById('toast');if(!x)return;x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),3500)}
 const complete=x=>state.items[x.id].status==='bought'&&(x.target===null||state.items[x.id].qty!==null&&state.items[x.id].qty>=x.target);
 const progress=()=>({bought:ITEMS.filter(complete).length,total:ITEMS.length,optional:ITEMS.filter(x=>x.optional).length});
 function stateLabel(x){
   const st=state.items[x.id];if(st.status==='missing')return'缺貨／找不到';
   if(st.status==='skip')return'暫不購買';
   if(st.status==='bought'&&x.target!==null&&!complete(x))return '尚未買齊 '+x.target+' 條';
   if(st.status==='bought')return'已購買';
   return x.optional?'待確認是否要買':'未購買';
 }
 function itemUI(x){
   const st=state.items[x.id];
   return `<div class="secret-item ${complete(x)?'secret-done':''}" data-secret-item="${e(x.id)}">
     <div class="secret-item-top"><label class="secret-item-check"><input type="checkbox" data-secret-bought="${e(x.id)}" ${st.status==='bought'?'checked':''}><span class="secret-item-names"><strong>${e(x.name)}</strong><small lang="ja">${e(x.ja)}</small></span></label>
     <span class="secret-state" data-secret-label="${e(x.id)}">${e(stateLabel(x))}</span></div>
     <p class="mini-note">需求：${x.target!==null?'2 條':x.id==='u1'?'灰色 S／暫定 1 件（數量待確認）':'數量待確認'}${x.optional?' · <strong>是否購買待確認</strong>':''}</p>
     <details class="secret-item-extra"><summary>指定店家、數量與備註</summary><div>
      <p class="muted">建議：${e(x.where)}</p>${x.caution?`<p class="hint">${e(x.caution)}</p>`:''}${x.id==='u1'?'<p><a class="btn secondary smallbtn" target="_blank" rel="noopener noreferrer" href="https://www.uniqlo.com/jp/ja/products/E488298-000/00">UNIQLO 官方商品／查看店面庫存</a></p>':''}
      <div class="grid2"><label>狀態<select data-secret-status="${e(x.id)}">${[['todo','未購買'],['bought','已購買'],['missing','缺貨／找不到'],['skip','暫不購買']].map(([v,t])=>`<option value="${v}" ${st.status===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>實際已買數量${x.target!==null?'（條）':''}<input type="number" min="0" max="9999" step="1" inputmode="numeric" data-secret-qty="${e(x.id)}" value="${st.qty===null?'':st.qty}" placeholder="尚未確認"></label></div>
      <label>備註<textarea data-secret-note="${e(x.id)}" rows="2" placeholder="例如款式、委託人、缺貨原因">${e(st.note)}</textarea></label>
     </div></details></div>`;
 }
function storeUI(shop,expanded=false){
   const matches=storeItems(shop).slice().sort((a,b)=>Number(complete(a))-Number(complete(b)));
   const stats=storeStats(shop);
   const url=shop.map||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(shop.name+' '+shop.address);
   return `<details class="card secret-group secret-shop" id="secret-shop-${e(shop.id)}" ${expanded?'open':''}>
     <summary><span class="secret-shop-label"><strong>${e(shop.name)}</strong><small>${e(shop.date)}</small></span>
      <span class="secret-shop-count" data-secret-shop-count="${e(shop.id)}">${stats.done}/${stats.total} 已買</span></summary>
     <div class="secret-group-list">
      <p class="mini-note secret-shop-address">${e(shop.address)}</p>
      <p class="mini-note">${e(shop.hours)}（僅供參考，非即時營業狀態）</p>
      <div class="secret-store-actions"><label><input type="checkbox" data-secret-shop="${e(shop.id)}" ${state.shops[shop.id]?'checked':''}> 已逛過這家店</label>
       <a class="btn secondary smallbtn" target="_blank" rel="noopener noreferrer" href="${e(url)}">Google Maps</a></div>
      <div class="secret-shop-hint">在這家店可找的代購品項（${matches.length}）。同一商品若在其他店也有候選，購買狀態會同步，總數只計一次。</div>
      ${matches.map(item=>itemUI(item)).join('')}
     </div></details>`;
 }
 function unassignedUI(){
   const noShop=unassignedItems();if(!noShop.length)return '';
   return `<details class="card secret-group secret-shop" id="secret-shop-other">
    <summary><span class="secret-shop-label"><strong>指定通路待確認</strong><small>尚未核對實際店面；不虛構地點</small></span>
     <span class="secret-shop-count">${noShop.filter(complete).length}/${noShop.length} 已買</span></summary>
    <div class="secret-group-list"><p class="hint">這些商品暫無可以確認的指定實體店，保留原本的建議通路。購買前先核對款式及是否重複委託。</p>
     ${noShop.map(item=>itemUI(item)).join('')}</div></details>`;
 }
function render(){
   const {bought,total,optional}=progress();
   return `<div class="sectionhead"><h2>絕密購買｜依店家採買</h2></div>
    <div class="card secret-summary"><div class="secret-summary-row"><strong data-secret-count>${bought}/${total} 項已買到</strong><span class="mini-note">其中 ${optional} 項是否購買待確認</span></div>
    <div class="secret-meter"><div data-secret-bar style="width:${Math.round(bought/total*100)}%"></div></div>
    <p class="hint">依實際要逛的店家分組；先開啟店家，直接勾選要找的商品。相同商品在多家店出現時共用同一筆進度，不會重複計入 ${ITEMS.length} 項。</p>
    <p class="mini-note">粉紅痘痘藥需買 2 條才算完成；其他數量待確認。曼秀雷敦 AD、アンメルツ仍待確認是否委託。</p></div>
    <div class="card secret-quick-card"><strong>快速找店</strong><div class="secret-shop-jumps">
      ${SHOPS.map(shop=>`<button type="button" class="btn secondary smallbtn" data-secret-jump="${e(shop.id)}">${e(shop.name.split(' ')[0])}</button>`).join('')}
      ${unassignedItems().length?'<button type="button" class="btn secondary smallbtn" data-secret-jump="other">通路待確認</button>':''}
     </div></div>
    ${SHOP_GROUPS.map(group=>`<section class="secret-area"><h3 class="secret-area-title">${e(group.title)}</h3>
      ${group.shops.map((id,index)=>storeUI(SHOPS.find(s=>s.id===id),group===SHOP_GROUPS[0]&&index===0)).join('')}
     </section>`).join('')}
    ${unassignedUI()}
    <div class="card"><h3>購買前特別核對</h3>
     <p class="hint">niko and ... 與 tiny tiny 的 Keroro 聯名需求可能重複，勿自行買兩份。</p>
     <p class="hint">粉紅痘痘藥：エプールアクネクリーム 24g，JAN 4987754104139，確定 2 條。</p>
     <p class="hint">黃色 Chupa Chups 酸糖：日本 7-Eleven 2026/11/23 才開始陸續販售，行程中不保證買得到。</p>
     <p class="hint">指定款缺貨時先詢問委託人；曼秀雷敦 AD、アンメルツ目前僅為參考圖片，非確定委託。</p></div>
    <div class="card"><h3>代購清單獨立備份</h3>
     <p class="hint">此清單與探索、原購物及記帳完全分開。勾選、數量與備註另存於本機，不包含在「工具」的行程／照片 ZIP；請自行備份下面的代購 JSON。</p>
     <div class="actions"><button class="btn secondary smallbtn" data-secret-action="copy">複製店家代購清單</button>
      <button class="btn secondary smallbtn" data-secret-action="export">匯出代購 JSON</button></div>
     <label>還原獨立代購 JSON <input type="file" accept=".json,application/json" data-secret-import></label>
     <p class="hint">GitHub 儲存庫公開，預載品項不是加密資訊；你的勾選與備註只存在本機。</p></div>`;
 }
function refresh(){
   const root=document.getElementById('view');if(!root)return;
   const p=progress(),count=root.querySelector('[data-secret-count]'),bar=root.querySelector('[data-secret-bar]');
   if(count)count.textContent=`${p.bought}/${p.total} 項已買到`;
   if(bar)bar.style.width=Math.round(p.bought/p.total*100)+'%';
   for(const shop of SHOPS){
     const st=storeStats(shop),c=root.querySelector('[data-secret-shop-count="'+shop.id+'"]');
     if(c)c.textContent=st.done+'/'+st.total+' 已買';
   }
   const other=root.querySelector('#secret-shop-other .secret-shop-count');
   if(other){const items=unassignedItems();other.textContent=items.filter(complete).length+'/'+items.length+' 已買'}
   for(const item of ITEMS){
     const v=state.items[item.id];
     root.querySelectorAll('[data-secret-item="'+item.id+'"]').forEach(node=>node.classList.toggle('secret-done',complete(item)));
     root.querySelectorAll('[data-secret-label="'+item.id+'"]').forEach(node=>node.textContent=stateLabel(item));
     root.querySelectorAll('[data-secret-bought="'+item.id+'"]').forEach(node=>node.checked=v.status==='bought');
     root.querySelectorAll('[data-secret-status="'+item.id+'"]').forEach(node=>node.value=v.status);
     root.querySelectorAll('[data-secret-qty="'+item.id+'"]').forEach(node=>{if(node!==document.activeElement)node.value=v.qty===null?'':String(v.qty)});
     root.querySelectorAll('[data-secret-note="'+item.id+'"]').forEach(node=>{if(node!==document.activeElement)node.value=v.note});
   }
 }
 function change(ev){
   const t=ev.target;let id;
   if(t.hasAttribute('data-secret-bought')){id=t.dataset.secretBought;if(MAP.has(id))state.items[id].status=t.checked?'bought':'todo'}
   else if(t.hasAttribute('data-secret-status')){id=t.dataset.secretStatus;if(MAP.has(id)&&STATUSES.includes(t.value))state.items[id].status=t.value}
   else if(t.hasAttribute('data-secret-qty')){id=t.dataset.secretQty;
     if(MAP.has(id)){const n=t.value===''?null:Number(t.value);if(n!==null&&(!Number.isSafeInteger(n)||n<0||n>9999)){message('購買數量須為 0～9999 的整數');return true}state.items[id].qty=n}}
   else if(t.hasAttribute('data-secret-note')){id=t.dataset.secretNote;if(MAP.has(id))state.items[id].note=String(t.value).slice(0,2000)}
   else if(t.hasAttribute('data-secret-shop')){id=t.dataset.secretShop;if(SHOPS.some(s=>s.id===id))state.shops[id]=!!t.checked}
   else if(t.hasAttribute('data-secret-import')){const f=t.files?.[0];t.value='';if(f)importBackup(f);return true}
   else return false;
   save();refresh();return true;
 }
function summaryText(){
   const line=x=>{const v=state.items[x.id];
     return (complete(x)?'[x] ':'[ ] ')+x.name+'｜'+x.ja+'｜需求：'+(x.target!==null?x.target+' 條':x.id==='u1'?'灰色 S／暫定 1 件（待確認）':'待確認')+'｜'+stateLabel(x)+'｜已買：'+(v.qty===null?'未記':v.qty)+(v.note?'｜備註：'+v.note:'');
   };
   const sections=SHOP_GROUPS.flatMap(group=>[
     group.title,...group.shops.map(id=>{const shop=SHOPS.find(s=>s.id===id);
       return '【'+shop.name+'】\n'+shop.address+'\n'+storeItems(shop).map(line).join('\n');
     })
   ]);
   const others=unassignedItems();if(others.length)sections.push('【指定通路待確認】\n'+others.map(line).join('\n'));
   return sections.join('\n\n')+'\n\n※ 各店出現的重複候選商品，完成狀態為共用同一筆。';
 }
 async function backup(){
   const blob=new Blob([JSON.stringify({kind:KEY,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json;charset=utf-8'});
   try{await shareOrDownload(blob,'東京代購_絕密購買_'+new Date().toISOString().slice(0,10)+'.json');message('請確認已將獨立代購備份儲存至檔案')}
   catch{message('匯出未完成，請重新操作')}
 }
 async function importBackup(file){
   try{const obj=JSON.parse(await file.text());if(obj.kind!==KEY||!obj.state?.items)throw Error('非本頁備份格式');
     if(!confirm('確定以備份覆蓋目前的代購勾選與備註？'))return;
     state=normalize(obj.state);if(save()){document.getElementById('view').innerHTML=render();message('代購清單已還原')}}
   catch(ex){message('還原失敗：'+ex.message)}
 }
 function click(ev){
   const jumper=ev.target.closest('[data-secret-jump]');
   if(jumper){
     const id=jumper.dataset.secretJump;
     if(id!=='other'&&!SHOPS.some(x=>x.id===id))return true;
     const el=document.getElementById('secret-shop-'+id);
     if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}
     return true;
   }
   const b=ev.target.closest('[data-secret-action]');if(!b)return false;
   if(b.dataset.secretAction==='copy')copyText(summaryText());
   else if(b.dataset.secretAction==='export')backup();
   return true
 }
 return {render,change,click,progress,summaryText,getState:()=>JSON.parse(JSON.stringify(state)),items:ITEMS,shops:SHOPS,normalize,storageKey:KEY};
})();