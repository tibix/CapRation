const CACHE_NAME = 'capration-pc-v1';
const ASSETS = [
  '/CapRation/CAPRation_PC.html',
  '/CapRation/manifest_pc.json',
  '/CapRation/icons/icon-192.png',
  '/CapRation/icons/icon-512.png'
];

// Installation : mise en cache des ressources
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', e => {
  // Ne pas intercepter les requêtes Firebase/Stripe/APIs externes
  const url = new URL(e.request.url);
  if (
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre à jour le cache avec la version réseau
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
