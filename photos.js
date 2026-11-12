'use strict';
/* V2.6 photo vault: on-device IndexedDB blobs and self-contained, uncompressed ZIP backups.
   Nothing uploads to a server; the ZIP format uses stored entries for cross-platform readability. */
const PhotoVault = (()=>{
 const DB_NAME='tokyo-visit-photo-v1', TABLE='photos';
 const MAX_INPUT=30*1024*1024, MAX_ITEMS=150;
 let openPromise=null, lastUrls=[], hydrateNumber=0, modalUrl=null, currentPhoto=null;
 const encoder=new TextEncoder(), decoder=new TextDecoder();
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function dbOpen(){
  if(!('indexedDB' in window))return Promise.reject(new Error('目前瀏覽器不支援 IndexedDB'));
  if(!openPromise)openPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{const store=req.result.createObjectStore(TABLE,{keyPath:'id'});store.createIndex('link','link',{unique:false});};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error('無法開啟照片資料庫'));
  }).catch(e=>{openPromise=null;throw e});
  return openPromise;
 }
 async function all(){const db=await dbOpen();return new Promise((resolve,reject)=>{
  const req=db.transaction(TABLE,'readonly').objectStore(TABLE).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });}
 async function get(id){const db=await dbOpen();return new Promise((resolve,reject)=>{
  const req=db.transaction(TABLE,'readonly').objectStore(TABLE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
 });}
 async function write(record){const db=await dbOpen();return new Promise((resolve,reject)=>{
  const tx=db.transaction(TABLE,'readwrite');tx.objectStore(TABLE).put(record);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('相片儲存已中止'));
 });}
 async function remove(id){const db=await dbOpen();return new Promise((resolve,reject)=>{
  const tx=db.transaction(TABLE,'readwrite');tx.objectStore(TABLE).delete(id);
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });}
 async function replaceAll(photos){const db=await dbOpen();return new Promise((resolve,reject)=>{
  const tx=db.transaction(TABLE,'readwrite');const store=tx.objectStore(TABLE);store.clear();
  for(const rec of photos)store.put(rec);
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('照片還原失敗'));
 });}
 async function purgeLink(link){const rows=(await all()).filter(x=>x.link===link);for(const row of rows)await remove(row.id);}
 function loadImage(file){return new Promise((resolve,reject)=>{
  const u=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(u);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('這張照片的格式無法在此裝置解碼'))};
  img.src=u;
 });}
 async function convert(file,link){
  if(file.size>MAX_INPUT)throw new Error('單張照片超過 30 MB，請先縮小');
  if(!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))throw new Error('請選擇圖片檔');
  // Keep sufficient detail for receipts; the original is still kept in the iPhone Photos app.
  const maxEdge=link.startsWith('expense:')?2800:2000;
  let img;
  try{img=await loadImage(file)}catch(e){if(file.type==='image/jpeg'||file.type==='image/png')return {blob:file,mime:file.type,kept:true};throw e}
  const scale=Math.min(1,maxEdge/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('此裝置無法處理圖片');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('照片處理失敗')),'image/jpeg',link.startsWith('expense:')?0.9:0.83));
  canvas.width=canvas.height=0;
  return {blob,mime:'image/jpeg',kept:false};
 }
 async function addFiles(link,files){
  const current=await all();const chosen=Array.from(files||[]);
  if(current.length+chosen.length>MAX_ITEMS)throw new Error('最多儲存 '+MAX_ITEMS+' 張照片，請先匯出備份或刪除舊照片');
  let added=0;
  for(const file of chosen){
   const out=await convert(file,link);
   const record={id:'p-'+Date.now().toString(36)+'-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36),link,createdAt:new Date().toISOString(),name:file.name||'現場照片',caption:'',mime:out.mime,size:out.blob.size,blob:out.blob};
   await write(record);added++;
  }
  return added;
 }
 function clearUrls(){for(const url of lastUrls)URL.revokeObjectURL(url);lastUrls=[]}
 function card(rec){
  const a=document.createElement('button');a.type='button';a.className='photo-thumb';a.setAttribute('aria-label','檢視照片 '+(rec.caption||rec.name));
  a.dataset.action='photo-open';a.dataset.id=rec.id;
  const img=new Image();img.src=URL.createObjectURL(rec.blob);lastUrls.push(img.src);img.alt=rec.caption||rec.name||'照片';img.loading='lazy';a.append(img);
  return a;
 }
 async function hydrate(root){
  const token=++hydrateNumber;clearUrls();const spots=[...root.querySelectorAll('[data-photo-strip]')];const album=root.querySelector('[data-photo-album]');
  if(!spots.length&&!album)return;
  try{
   const photos=(await all()).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));if(token!==hydrateNumber)return;
   const byLink=new Map();for(const p of photos){if(!byLink.has(p.link))byLink.set(p.link,[]);byLink.get(p.link).push(p)}
   for(const spot of spots){const ls=byLink.get(spot.dataset.photoStrip)||[];spot.replaceChildren();
    if(!ls.length){const txt=document.createElement('span');txt.className='mini-note';txt.textContent='尚無照片';spot.append(txt)}
    else{for(const p of ls)spot.append(card(p));const t=document.createElement('span');t.className='photo-count';t.textContent=ls.length+' 張';spot.append(t)}
   }
   if(album){album.replaceChildren();if(!photos.length){album.textContent='尚未拍攝或選取照片。';album.classList.add('empty')}else{
    album.classList.remove('empty');for(const p of photos.slice().reverse()){
     const wrapper=document.createElement('div');wrapper.className='photo-album-card';wrapper.append(card(p));
     const caption=document.createElement('div');caption.className='mini-note';caption.textContent=(p.caption||p.name||'照片')+' · '+labelForLink(p.link);wrapper.append(caption);album.append(wrapper)
    }
   }}
  }catch(e){for(const spot of spots)spot.textContent='照片無法載入：'+e.message;if(album)album.textContent='照片無法載入：'+e.message;}
 }
 function labelForLink(link){
  const [type,id]=link.split(':');
  if(type==='expense'&&typeof db!=='undefined')return '費用：'+(db.expenses?.find(x=>x.id===id)?.title||'已刪除費用');
  if(type==='food'&&typeof FOOD_SPOTS!=='undefined')return '餐廳：'+(Object.values(FOOD_SPOTS).flat().find(x=>x.id===id)?.name||id);
  if(type==='gift'&&typeof GIFT_STORES!=='undefined')return '伴手禮：'+(GIFT_STORES.find(x=>x.id===id)?.name||id);
  if(type==='giftitem'&&typeof GIFT_STORES!=='undefined')return '商品：'+(GIFT_STORES.flatMap(x=>x.items).find(x=>x.id===id)?.name||id);
  if((type==='day'||type==='visit')&&/^\d$/.test(id))return (type==='day'?'行程備忘':'參訪筆記')+' 11/'+(15+Number(id));
  return link;
 }
 function modal(){let dlg=document.querySelector('#photo-dialog');if(dlg)return dlg;
  dlg=document.createElement('dialog');dlg.id='photo-dialog';dlg.className='photo-dialog';
  dlg.innerHTML='<div class="photo-dialog-inner"><div class="row between"><strong>照片檢視</strong><button type="button" class="btn secondary smallbtn" id="photo-close">關閉</button></div><img id="photo-full" alt="照片預覽"><div id="photo-caption" class="muted"></div><div class="actions"><button type="button" class="btn secondary smallbtn" id="photo-rename">編輯備註</button><button type="button" class="btn secondary smallbtn" id="photo-save">儲存／分享照片</button><button type="button" class="btn danger smallbtn" id="photo-delete">刪除照片</button></div></div>';
  document.body.append(dlg);
  dlg.querySelector('#photo-close').onclick=()=>dlg.close();
  dlg.addEventListener('close',()=>{if(modalUrl)URL.revokeObjectURL(modalUrl);modalUrl=null;currentPhoto=null});
  dlg.querySelector('#photo-rename').onclick=async()=>{if(!currentPhoto)return;const cap=prompt('照片備註（例如：11/16 東大午餐／車票報帳）',currentPhoto.caption||'');if(cap===null)return;currentPhoto.caption=cap.trim().slice(0,180);await write(currentPhoto);dlg.querySelector('#photo-caption').textContent=currentPhoto.caption||currentPhoto.name;window.render?.()};
  dlg.querySelector('#photo-save').onclick=async()=>{if(!currentPhoto)return;const name=(currentPhoto.caption||currentPhoto.name||'照片').replace(/[\\/:*?"<>|]/g,'_').slice(0,50)+(currentPhoto.mime==='image/png'?'.png':'.jpg');const file=new File([currentPhoto.blob],name,{type:currentPhoto.mime||'image/jpeg'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file]});return}catch(e){if(e.name==='AbortError')return}}const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000)};
  dlg.querySelector('#photo-delete').onclick=async()=>{if(!currentPhoto)return;if(!confirm('確定刪除此照片？這個動作無法復原。'))return;const id=currentPhoto.id;dlg.close();await remove(id);window.render?.()};
  return dlg;
 }
 async function show(id){const p=await get(id);if(!p)throw new Error('照片不存在');const dlg=modal();currentPhoto=p;if(modalUrl)URL.revokeObjectURL(modalUrl);modalUrl=URL.createObjectURL(p.blob);dlg.querySelector('#photo-full').src=modalUrl;dlg.querySelector('#photo-caption').textContent=p.caption||p.name;dlg.showModal()}
 // ISO-compliant, no-compression ZIP. It can be opened using iOS Files and the Windows ZIP reader.
 let crcTable=null;
 function crc32(data){if(!crcTable){crcTable=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crcTable[n]=c>>>0}}let crc=0xffffffff;for(const b of data)crc=crcTable[(crc^b)&255]^(crc>>>8);return(crc^0xffffffff)>>>0}
 function header(len){return new Uint8Array(len)}
 async function zipFiles(entries){
  const parts=[],centers=[];let pos=0;
  for(const [name,source] of entries){const bytes=source instanceof Uint8Array?source:new Uint8Array(await source.arrayBuffer());const fn=encoder.encode(name);if(fn.length>65535||bytes.length>0xffffffff)throw new Error('備份檔案太大');const crc=crc32(bytes),start=pos;
   const h=header(30),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(8,0,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,fn.length,true);parts.push(h,fn,bytes);pos+=30+fn.length+bytes.length;
   const c=header(46),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,fn.length,true);cv.setUint32(42,start,true);centers.push(c,fn);
  }
  const cdLen=centers.reduce((s,c)=>s+c.length,0),e=header(22),ev=new DataView(e.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,cdLen,true);ev.setUint32(16,pos,true);
  return new Blob([...parts,...centers,e],{type:'application/zip'});
 }
 async function exportBundle(data){const photos=await all();const manifest={app:'tokyo-visit-2026-with-photos',schema:3,exportedAt:new Date().toISOString(),data,photos:photos.map(p=>({id:p.id,link:p.link,createdAt:p.createdAt,name:p.name,caption:p.caption,mime:p.mime,size:p.size,path:'photos/'+p.id+(p.mime==='image/png'?'.png':'.jpg')}))};const files=[['data.json',encoder.encode(JSON.stringify(manifest,null,2))],...photos.map(p=>['photos/'+p.id+(p.mime==='image/png'?'.png':'.jpg'),p.blob])];return {blob:await zipFiles(files),count:photos.length};}
 async function unpack(file){const buffer=await file.arrayBuffer(),v=new DataView(buffer),bytes=new Uint8Array(buffer);let eocd=-1;
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--)if(v.getUint32(i,true)===0x06054b50){eocd=i;break}
  if(eocd<0)throw new Error('不是可辨識的 ZIP 備份');const count=v.getUint16(eocd+10,true),offset=v.getUint32(eocd+16,true),found=new Map();let at=offset;if(count>MAX_ITEMS+1)throw new Error('照片數量超出限制');
  for(let k=0;k<count;k++){
   if(at+46>buffer.byteLength||v.getUint32(at,true)!==0x02014b50)throw new Error('ZIP 目錄異常');
   const method=v.getUint16(at+10,true),crc=v.getUint32(at+16,true),size=v.getUint32(at+20,true),nameLen=v.getUint16(at+28,true),extra=v.getUint16(at+30,true),comment=v.getUint16(at+32,true),loc=v.getUint32(at+42,true);
   const name=decoder.decode(bytes.subarray(at+46,at+46+nameLen));if(method!==0)throw new Error('目前只支援本 App 匯出的未壓縮照片 ZIP');
   if(loc+30>buffer.byteLength||v.getUint32(loc,true)!==0x04034b50)throw new Error('ZIP 檔頭異常');const from=loc+30+v.getUint16(loc+26,true)+v.getUint16(loc+28,true),to=from+size;if(to>buffer.byteLength)throw new Error('ZIP 照片資料不完整');
   const contents=bytes.slice(from,to);if(crc32(contents)!==crc)throw new Error('ZIP 檔案校驗失敗：'+name);
   found.set(name,contents);at+=46+nameLen+extra+comment;
  }
  const data=found.get('data.json');if(!data)throw new Error('找不到 data.json');const manifest=JSON.parse(decoder.decode(data));if(manifest.app!=='tokyo-visit-2026-with-photos'||manifest.schema!==3||!Array.isArray(manifest.photos)||!manifest.data?.events)throw new Error('不是本 App 的完整備份');
  const result=manifest.photos.map(meta=>{const raw=found.get(meta.path);if(!raw)throw new Error('照片遺失：'+meta.id);if(!/^p-[a-z0-9-]+$/.test(meta.id))throw new Error('照片編號格式錯誤');return {...meta,blob:new Blob([raw],{type:meta.mime||'image/jpeg'}),size:raw.length}});
  if(result.length>MAX_ITEMS)throw new Error('照片數量超出限制');return {data:manifest.data,photos:result};
 }
 return {all,get,addFiles,hydrate,show,remove,purgeLink,replaceAll,exportBundle,unpack,MAX_ITEMS};
})();
