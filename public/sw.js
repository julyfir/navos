self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (!(url.origin === location.origin)) return;
  if (e.request.mode === "navigate") return; // 页面导航交给网络
  e.respondWith(
    caches.open("navos-v1").then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        });
        return cached || fetched;
      })
    )
  );
});