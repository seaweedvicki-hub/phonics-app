self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('phonics-app').then(cache => {
      return cache.addAll([
        './',
        './index.html'
      ]);
    })
  );
});