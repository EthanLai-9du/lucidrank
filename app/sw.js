/* LucidRank web: offline app shell. Cache-first for our own files; a new build = new cache name. */
const CACHE='lucidrank-app-0.1.7d-20261013-ocr';
const PRECACHE=[
 "./",
 "css/app.css",
 "css/pwa.css",
 "css/urban.css",
 "css/native.css",
 "css/fonts.css",
 "fonts/display.woff2",
 "fonts/title-han.woff2",
 "fonts/smiley-han.woff2",
 "fonts/oxanium.woff2",
 "icons/brand.svg",
 "fonts/space.woff2",
 "fonts/han-sc.woff2",
 "fonts/han-tc.woff2",
 "js/urban.js",
 "images/urban-banner.svg",
 "icons/apple-touch-icon.png",
 "icons/favicon-32.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-192.png",
 "icons/maskable-512.png",
 "js/catalog.js",
 "js/library.js",
 "js/training.js",
 "js/ocr.js",
 "js/upgrade-i18n.js",
 "js/checkin.js",
 "js/health-i18n.js",
 "js/health-checkin.js",
 "js/core.js",
 "js/i18n.js",
 "js/lineups-data.js",
 "js/lineups.js",
 "js/main.js",
 "js/account.js",
 "js/tutorials.js",
 "data/tutorials.json",
 "js/developer.js",
 "css/developer.css",
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
  if(['localhost','127.0.0.1','[::1]'].includes(url.hostname)) return;
  if(url.origin!==location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname)) return;
  if(url.pathname.endsWith('/reset-password.html')||url.pathname.endsWith('/reset-password')||url.pathname.endsWith('/developer.html')||url.pathname.endsWith('/developer')) return;
  if(req.mode==='navigate'){
    // network-first so deploys aren't stuck behind an old shell; cache as fallback
    e.respondWith(fetch(req).then(res=>{
      if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>{ c.put('./', copy.clone()); c.put(req, copy); }); }
      return clean(res);
    }).catch(()=>caches.match('./').then(r=>r?clean(r):caches.match(req))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{
    if(res.ok&&res.type==='basic'){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
    return res;
  })));
});
