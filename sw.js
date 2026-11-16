// ========================================
// LA PAZ TE ACERCA - Service Worker v11.0
// Estrategia dual: Cache-First (estáticos) + Network-First (datos)
// 
// Cambios v11.0:
// - NO cachear /api/ (fix crítico de seguridad)
// - Eliminación de código muerto
// - Unificación de formato y comentarios
// ========================================

const CACHE_NAME = 'lapazteacerca-v11';
const STATIC_CACHE = 'lapazteacerca-static-v11';
const DATA_CACHE = 'lapazteacerca-data-v11';

// Archivos estáticos que se cachean en la instalación
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/404.html'
];

// ========================================
// INSTALACIÓN
// ========================================
self.addEventListener('install', event => {
    // Forzar activación inmediata (no esperar a que se cierren las pestañas viejas)
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
    // Tomar control inmediato de todas las pestañas
    event.waitUntil(clients.claim());
    
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => {
                    // Borrar cualquier caché que no sea la versión actual
                    return key !== STATIC_CACHE && key !== DATA_CACHE;
                }).map(key => {
                    console.log('SW: Eliminando caché vieja:', key);
                    return caches.delete(key);
                })
            );
        })
    );
});

// ========================================
// FETCH (estrategia dual)
// ========================================
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // 1) API Y DATOS → Network-First SIN caché
    // Fix crítico: nunca cachear respuestas autenticadas o datos sensibles
    if (url.pathname.startsWith('/api/') || 
        url.pathname.includes('/data/proveedores.json')) {
        event.respondWith(networkFirstNoCache(event.request));
        return;
    }
    
    // 2) NAVEGACIÓN (HTML) → Network-First con fallback a caché
    // Permite que las páginas nuevas se carguen sin esperar al SW
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // 3) ESTÁTICOS (CSS, JS, imágenes, fuentes) → Cache-First
    // Máxima velocidad para recursos que cambian poco
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // 4) TODO LO DEMÁS → Cache-First con fallback a red
    event.respondWith(cacheFirst(event.request));
});

// ========================================
// ESTRATEGIA: Network-First SIN caché (para API)
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
// ESTRATEGIA: Network-First (para navegación)
// ========================================
async function networkFirst(request) {
    try {
        const response = await fetch(request, { cache: 'no-cache' });
        // Si la respuesta es válida, la guardamos en caché para la próxima
        if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE).then(cache => {
                cache.put(request, responseClone);
            });
        }
        return response;
    } catch (error) {
        // Si falla la red, servimos desde caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        // Si no hay caché, retornamos error
        return new Response('Sin conexión y sin caché disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ========================================
// ESTRATEGIA: Cache-First (para estáticos)
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