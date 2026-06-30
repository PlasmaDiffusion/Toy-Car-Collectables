// Caches car/category images (Cache API) so previously viewed listings keep
// their photos even when the image host or network is unreachable.
const IMAGE_CACHE = "toy-car-images-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("toy-car-images-") && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.destination !== "image") return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        // Stale-while-revalidate: refresh the cache in the background.
        fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
          })
          .catch(() => {});
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch (err) {
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        throw err;
      }
    })
  );
});
