/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE = "jh-walk-cache-v1";
const META = "jh-walk-meta-v1";
const SWEEP_KEY = "jh-walk-sweep-at";
const TTL = 30 * 24 * 60 * 60 * 1000;
const SWEEP_EVERY = 24 * 60 * 60 * 1000;
const open = () => caches.open(CACHE);
const openMeta = () => caches.open(META);

const touch = (url) =>
  openMeta()
    .then((m) => m.put(url, new Response(Date.now())))
    .catch(() => {});

const age = (url) =>
  openMeta()
    .then((m) => m.match(url))
    .then((res) => res.json())
    .catch(() => 0);

const load = (r) =>
  fetch(r).then((res) => {
    if (!res.ok) return res;
    const clone = res.clone();
    return open()
      .then((c) => c.put(r, clone))
      .then(() => touch(r.url))
      .then(() => res);
  });

const fromCache = (r) =>
  open().then(async (c) => {
    const cached = await c.match(r);
    if (!cached) return load(r);
    await touch(r.url);
    return cached;
  });

const sweep = async () => {
  const [c, m] = await Promise.all([open(), openMeta()]);
  await Promise.all(
    (await m.matchAll()).map(async (res) => {
      if (Date.now() - (await res.json().catch(() => 0)) < TTL) return;
      await Promise.all([c.delete(res.url), m.delete(res.url)]).catch(() => {});
    })
  );
  await touch(SWEEP_KEY);
};

const maybeSweep = () =>
  age(SWEEP_KEY)
    .then((t) => Date.now() - t >= SWEEP_EVERY && sweep())
    .catch(() => {});

sw.addEventListener("install", (e) => {
  e.waitUntil(
    open()
      .then((c) => c.add("/"))
      .then(() => touch("/"))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(ks.filter((k) => k !== CACHE && k !== META).map((k) => caches.delete(k)))
      )
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener("fetch", (e) => {
  const r = e.request;
  if (
    !r.url.startsWith("http") ||
    r.url.includes("/api/") ||
    r.url.includes("/admin/") ||
    r.method !== "GET"
  )
    return;

  if (r.mode === "navigate") {
    const nav = fetch(r).then((res) =>
      open()
        .then((c) => c.put("/", res.clone()))
        .then(() => touch("/"))
        .then(() => res)
    );
    e.respondWith(nav.catch(() => caches.match("/")));
    e.waitUntil(nav.catch(() => undefined).then(maybeSweep));
    return;
  }

  e.respondWith(fromCache(r));
});
