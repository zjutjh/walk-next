/// <reference lib="webworker" />

const CACHE = "jh-walk-cache-v1";
const META = "jh-walk-meta-v1";
const TTL = 7 * 24 * 60 * 60 * 1000;
const open = () => caches.open(CACHE);
const openMeta = () => caches.open(META);

const stale = (r) =>
  openMeta()
    .then((m) => m.match(r.url))
    .then((r) => r.json())
    .then((t) => Date.now() - t >= TTL)
    .catch(() => true);

const touch = (r) => openMeta().then((m) => m.put(r.url, new Response(Date.now())));

const load = (r) =>
  fetch(r).then((res) => {
    if (res.ok) {
      const clone = res.clone();
      open().then((c) => c.put(r, clone).then(() => touch(r)));
    }
    return res;
  });

const fromCache = (r) =>
  caches.match(r).then((c) => {
    if (!c) return load(r);
    return stale(r).then((s) => (s ? caches.delete(r.url).then(() => load(r)) : c));
  });

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
      .then((ks) =>
        Promise.all(ks.filter((k) => k !== CACHE && k !== META).map((k) => caches.delete(k)))
      )
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

  e.respondWith(fromCache(r));
});
