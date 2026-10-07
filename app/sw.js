/* LucidRank web: offline app shell. Cache-first for our own files; a new build = new cache name. */
const CACHE='lucidrank-app-0.1.1-6b61f38e7e';
const PRECACHE=[
 "./",
 "css/app.css",
 "css/pwa.css",
 "icons/apple-touch-icon.png",
 "icons/favicon-32.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-192.png",
 "icons/maskable-512.png",
 "js/checkin.js",
 "js/core.js",
 "js/i18n.js",
 "js/lineups-data.js",
 "js/lineups.js",
 "js/main.js",
 "js/pwa-adapter.js",
 "js/pwa-i18n.js",
 "js/pwa.js",
 "js/stats.js",
 "manifest.webmanifest"
];
// a redirected response can't answer a navigation; rebuild it as a plain one
function clean(r){ return r.redirected?r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})):r; }
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lucidrank-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname)) return;
  if(req.mode==='navigate'){
    // the shell is cached under './' (hosts like Cloudflare Pages redirect index.html -> ./)
    e.respondWith(caches.match('./').then(r=>r?clean(r):fetch(req)));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{
    if(res.ok&&res.type==='basic'){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
    return res;
  })));
});
