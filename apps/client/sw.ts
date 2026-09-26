/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

// #region 缓存工具
const CACHE = "jh-walk-cache-v1";
const META = "jh-walk-meta-v1";
const SWEEP_KEY = "jh-walk-sweep-at";
const TTL = 30 * 24 * 60 * 60 * 1000;
const SWEEP_EVERY = 24 * 60 * 60 * 1000;
const open = () => caches.open(CACHE);
const openMeta = () => caches.open(META);

const touch = (url: string): Promise<void> =>
  openMeta()
    .then((m) => m.put(url, new Response(String(Date.now()))))
    .catch(() => undefined);

const age = (url: string): Promise<number> =>
  openMeta()
    .then((m) => m.match(url))
    .then((res) => res?.json() ?? 0)
    .catch(() => 0);

const load = (r: Request): Promise<Response> =>
  fetch(r).then((res) => {
    if (!res.ok) return res;
    const clone = res.clone();
    return open()
      .then((c) => c.put(r, clone))
      .then(() => touch(r.url))
      .then(() => res);
  });

const fromCache = (r: Request): Promise<Response> =>
  open().then((c) =>
    c.match(r).then((cached) => (cached ? touch(r.url).then(() => cached) : load(r)))
  );

const sweep = (): Promise<void> =>
  Promise.all([open(), openMeta()]).then(([c, m]) =>
    m
      .matchAll()
      .then((entries) =>
        Promise.all(
          entries.map((res) =>
            res
              .json()
              .catch(() => 0)
              .then((t) =>
                Date.now() - t < TTL
                  ? undefined
                  : Promise.all([c.delete(res.url), m.delete(res.url)]).catch(() => undefined)
              )
          )
        )
      )
      .then(() => touch(SWEEP_KEY))
  );

const maybeSweep = (): Promise<void> =>
  age(SWEEP_KEY)
    .then((t) => (Date.now() - t >= SWEEP_EVERY ? sweep() : undefined))
    .catch(() => undefined);
// #endregion

// #region 生命周期
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
// #endregion

// #region 请求拦截
sw.addEventListener("fetch", (e: FetchEvent) => {
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
    e.respondWith(nav.catch(() => caches.match("/").then((c) => c ?? fetch(r))));
    e.waitUntil(nav.catch(() => undefined).then(maybeSweep));
    return;
  }

  e.respondWith(fromCache(r));
});
// #endregion
