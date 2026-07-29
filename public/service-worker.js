const CACHE = 'stockflow-v1'
const ASSETS = ['/', '/manifest.json', '/pwa-icon.svg', '/favicon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  if (e.request.method !== 'GET') return

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/build/')) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r }).catch(() => c.match(e.request))
      )
    )
    return
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    )
    return
  }
})
