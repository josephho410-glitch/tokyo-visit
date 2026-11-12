/* Offline shell, network-first updates; never cache arbitrary external sites. */
const CACHE='tokyo-visit-v2.3-20261112-r3';
const ASSETS=['./','./index.html','./styles.css','./data.js','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('tokyo-visit-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{const response=await fetch(req);if(response.ok&&url.origin===self.location.origin)cache.put(req,response.clone()).catch(()=>{});return response}
    catch{
      const cached=await cache.match(req,{ignoreSearch:true});if(cached)return cached;
      if(req.mode==='navigate'){const home=await cache.match(new URL('./index.html',self.registration.scope).href);if(home)return home}
      return new Response('離線且尚未快取此資源',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})
    }
  })());
});
