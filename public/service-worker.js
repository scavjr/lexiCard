const CACHE_NAME = "lexicard-v1";
const RUNTIME_CACHE = "lexicard-runtime-v1";
const API_CACHE = "lexicard-api-v1";

// Assets para fazer cache imediatamente após instalação
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Cache aberto:", CACHE_NAME);
        // Tentar fazer cache dos assets, ignorar erros
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.status === 200) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                console.log(
                  `[Service Worker] Não conseguiu fazer cache de: ${url}`,
                );
              }),
          ),
        );
      })
      .then(() => {
        console.log("[Service Worker] Assets em cache");
        // Force o novo SW a ativar imediatamente
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error("[Service Worker] Erro ao instalar:", err);
      }),
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Ativando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== API_CACHE
              );
            })
            .map((cacheName) => {
              console.log(
                "[Service Worker] Deletando cache antigo:",
                cacheName,
              );
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => {
        console.log("[Service Worker] Ativado e pronto");
        return self.clients.claim();
      }),
  );
});

// Estratégia de Cache para requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições fora de origem
  if (url.origin !== location.origin) {
    return;
  }

  // Requisições de API (Supabase)
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Assets estáticos
  if (
    request.method === "GET" &&
    (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/i) ||
      request.destination === "image" ||
      request.destination === "style" ||
      request.destination === "script")
  ) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // Fallback para navegação (HTML)
  event.respondWith(networkFirstNavigation(request));
});

// Cache First Strategy para Assets Estáticos
async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log("[Service Worker] Cache hit:", request.url);
    return cached;
  }

  try {
    console.log("[Service Worker] Fetching:", request.url);
    const response = await fetch(request);

    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[Service Worker] Fetch failed:", request.url, error);

    // Retornar uma imagem placeholder em caso de erro
    if (request.destination === "image") {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#999">Offline</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } },
      );
    }

    throw error;
  }
}

// Network First Strategy para Navegação
async function networkFirstNavigation(request) {
  try {
    console.log("[Service Worker] Network first (navigation):", request.url);
    const response = await fetch(request);

    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("[Service Worker] Network failed, trying cache:", request.url);

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Retornar página offline
    const cache = await caches.open(RUNTIME_CACHE);
    return (
      cache.match("/index.html") || new Response("Offline", { status: 503 })
    );
  }
}

// Network First Strategy para API
async function networkFirstAPI(request) {
  try {
    console.log("[Service Worker] Network first (API):", request.url);
    const response = await fetch(request);

    // Cache bem-sucedidas
    if (response.status === 200 && request.method === "GET") {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log(
      "[Service Worker] API network failed, trying cache:",
      request.url,
    );

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Retornar erro offline para APIs
    return new Response(
      JSON.stringify({ error: "Offline - API não disponível" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Background Sync (opcional - para sincronizar dados quando voltar online)
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-progress") {
    event.waitUntil(
      clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "SYNC_PROGRESS",
            message: "Sincronizando progresso...",
          });
        });
      }),
    );
  }
});

// Push Notifications (opcional - para notificar sobre lembretes)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Hora de estudar!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    tag: "lexicard-notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification("LexiCard", options));
});

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Se já tem uma janela aberta, focar nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Senão, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    }),
  );
});
