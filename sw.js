const CACHE_NAME = "eyoblingua-guided-path-v23";
const APP_SHELL = [
 "./","./index.html","./lessons.html","./quiz.html","./profile.html","./dashboard.js?v=23",
 "./vocabulary.html","./verbs.html","./practice.html","./skills.html","./grammar.html","./offline.html",
 "./style.css?v=23","./script.js?v=23","./vocabulary.js?v=23","./verbs.js?v=23",
 "./practice.js?v=23","./skills.js?v=23","./grammar.js?v=23","./manifest.json",
 "./icon.svg","./icon-192.png","./icon-512.png"
];
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 await Promise.all(APP_SHELL.map(async url=>{try{await cache.add(url)}catch(error){console.warn("Optional cache item skipped:",url,error)}}));
 await self.skipWaiting();
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith((async()=>{
   try{
    const response=await fetch(request);
    if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone()).catch(()=>{});}
    return response;
   }catch(error){
    return (await caches.match(request))||(await caches.match("./offline.html"))||(await caches.match("./index.html"));
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone()).catch(()=>{});}
   return response;
  }catch(error){
   return new Response("Offline resource unavailable",{status:503,headers:{"Content-Type":"text/plain"}});
  }
 })());
});
