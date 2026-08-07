// Service worker sin dependencias. Vite le pone hash a JS y CSS, así que no
// hace falta un precache manifest: alcanza con cachear lo que se pide.
const CACHE = "rutina-v1";
const ROOT = new URL(self.registration.scope).pathname;
const SHELL = [ROOT, ROOT + "manifest.webmanifest", ROOT + "favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;

  // El HTML se pide primero a la red para que un deploy nuevo se vea al toque;
  // sin red se sirve la última copia buena.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          void caches.open(CACHE).then((c) => c.put(ROOT, copy));
          return res;
        })
        .catch(() => caches.match(ROOT).then((hit) => hit ?? Response.error()))
    );
    return;
  }

  // El resto tiene hash en el nombre: si está cacheado, es el archivo correcto.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ??
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
