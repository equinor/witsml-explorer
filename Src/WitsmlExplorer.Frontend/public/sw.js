try {
  const PRECACHE = "precache-v2";
  const RUNTIME = "runtime";

  // The install handler takes care of precaching the resources we always need.
  self.addEventListener("install", (event) => {
    console.log("installing sw");
    event.waitUntil(
      caches
        .open(PRECACHE)
        .then((cache) => cache.addAll(self.__precacheManifest || []))
        .then(self.skipWaiting())
    );
  });
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener("activate", (event) => {
    console.log("activate cache");
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith(PRECACHE))
              .filter((cacheName) => cacheName !== PRECACHE)
              .map((cacheToDelete) => caches.delete(cacheToDelete))
          );
        })
        .then(() => self.clients.claim())
    );
  });

  // The fetch handler serves responses for same-origin resources from a cache.
  // If no response is found, it populates the runtime cache with the response
  // from the network before returning it to the page.
  self.addEventListener("fetch", (event) => {
    // Skip cross-origin requests
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.open(RUNTIME).then((cache) => {
            return fetch(event.request, {}).then((response) => {
              // Put a copy of the response in the runtime cache.
              const responseToCache = new Response(response.body, {
                headers: response.headers
                // Add custom headers or other properties here...
              });
              return cache.put(event.request, responseToCache).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });
} catch (e) {
  console.log(e);
}
