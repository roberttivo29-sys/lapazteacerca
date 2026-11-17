// ========================================
// LA PAZ TE ACERCA - Service Worker v12.2.1
// Estrategia dual: Cache-First (estáticos) + Network-First (datos)
// 
// Fix v12.2.1:
// - Cache busting: Actualizado nombre de caché y URLs con ?v=12.2.1
// - Eliminado CACHE_NAME (código muerto)
// - Unificado event.waitUntil en activate
// - NO cachear /api/ ni /data/proveedores.json
// ========================================

const STATIC_CACHE = 'lapazteacerca-static-v12.2.1';
const DATA_CACHE = 'lapazteacerca-data-v12.2.1';

const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css?v=12.2.1',
    '/js/main.js',
    '/404.html'
];

// ========================================
// INSTALACIÓN
// ========================================
self.addEventListener('install', event => {
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll(urlsToCache).catch(err => {
                console.warn('SW: No se pudieron cachear todos los estáticos:', err);
            });
        })
    );
});

// ========================================
// ACTIVACIÓN (limpieza de cachés viejas)
// ========================================
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(
                    keys.filter(key => key !== STATIC_CACHE && key !== DATA_CACHE)
                        .map(key => {
                            console.log('SW: Eliminando caché vieja:', key);
                            return caches.delete(key);
                        })
                );
            })
        ])
    );
});

// ========================================
// FETCH (estrategia dual)
// ========================================
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // 1) API Y DATOS → Network-First SIN caché
    if (url.pathname.startsWith('/api/') || 
        url.pathname.includes('/data/proveedores.json')) {
        event.respondWith(networkFirstNoCache(event.request));
        return;
    }
    
    // 2) NAVEGACIÓN (HTML) → Network-First con fallback a caché
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // 3) ESTÁTICOS (CSS, JS, imágenes, fuentes) → Cache-First
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // 4) TODO LO DEMÁS → Cache-First con fallback a red
    event.respondWith(cacheFirst(event.request));
});

// ========================================
// Network-First SIN caché (para API)
// ========================================
async function networkFirstNoCache(request) {
    try {
        const response = await fetch(request, { cache: 'no-cache' });
        return response;
    } catch (error) {
        return new Response('Sin conexión y sin caché disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ========================================
// Network-First (para navegación)
// ========================================
async function networkFirst(request) {
    try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE).then(cache => {
                cache.put(request, responseClone);
            });
        }
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        return new Response('Sin conexión y sin caché disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ========================================
// Cache-First (para estáticos)
// ========================================
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
            });
        }
        return response;
    } catch (error) {
        return new Response('Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}