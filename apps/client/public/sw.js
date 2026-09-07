/// <reference lib="webworker" />

const CACHE = "jh-walk-cache-v1";
const open = () => caches.open(CACHE);

self.addEventListener("install", (e) => {
  e.waitUntil(
    open()
      .then((c) => c.add("/"))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (!r.url.startsWith("http") || r.url.includes("/api/") || r.method !== "GET") return;

  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r)
        .then((res) =>
          open()
            .then((c) => c.put("/", res.clone()))
            .then(() => res)
        )
        .catch(() => caches.match("/"))
    );
    return;
  }

  e.respondWith(
    caches.match(r).then((c) => {
      if (c) return c;
      return fetch(r).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          open().then((c) => c.put(r, clone));
        }
        return res;
      });
    })
  );
});
