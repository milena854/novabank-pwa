const CACHE_NAME = 'nova-bank-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(ARQUIVOS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) {
            return nome.startsWith('nova-bank-') && nome !== CACHE_NAME;
          })
          .map(function (nome) {
            return caches.delete(nome);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Não intercepta chamadas externas do Google Apps Script.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.ok) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copia);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
