const CACHE_NAME = "eyoblingua-b1-v7";
const APP_SHELL = ["./","./index.html","./lessons.html","./quiz.html","./profile.html","./style.css?v=7","./script.js?v=7","./manifest.json"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
 const request=event.request;
 if(request.method!=="GET" || new URL(request.url).origin!==self.location.origin) return;
 const url=new URL(request.url);
 const core=["index.html","lessons.html","quiz.html","profile.html","script.js","style.css","manifest.json"].some(name=>url.pathname.endsWith("/"+name));
 if(request.mode==="navigate" || core || url.pathname.endsWith("/")) {
  event.respondWith(fetch(request).then(response=>{if(response&&response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match("./index.html"))));
 } else event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
