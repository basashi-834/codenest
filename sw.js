const CACHE = 'codenest-v6';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  // index.html は常に最新を取りに行く（取れなければキャッシュ）＝更新が反映されやすい
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(resp){
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put('./index.html', copy); }).catch(function(){});
        return resp;
      }).catch(function(){ return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(resp){
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
        return resp;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
