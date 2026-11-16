// ========================================
// LA PAZ TE ACERCA - JavaScript v11.3
// Regla de oro: el NÚMERO es el héroe
// 
// Cambios v11.3:
// - Nomenclatura: gratuito / basico / completo
// - ordenPorPlan actualizado
// 
// Cambios v11.2:
// - Nav ordenado (flex-wrap)
// 
// Cambios v11.0:
// - Toast público
// - Fix WhatsApp 591
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Verifica La Paz - JavaScript v11.3 cargado');
    
    initHeader();
    initMenuHamburguesa();
    initFadeInAnimations();
    initStaggerAnimations();
    initSmoothScroll();
    initLazyLoading();
    initPrevencionClicksDobles();
    initBackToTop();
    initMobileShowcase();
    initFiltrosEnVivo();
    initToastDeExito();
    cargarDestacados();
    
    console.log('✅ Todos los módulos inicializados');
});

// ========================================
// UTILIDADES
// ========================================

function normalizarTexto(texto) {
    if (!texto) return '';
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/\s+/g, " ")
        .trim();
}

function escaparHTML(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

function getCategoriaClass(categoria) {
    const classes = {
        'Salud y Bienestar': 'category-salud',
        'Mantenimiento del Hogar': 'category-hogar',
        'Materiales de Construcción': 'category-construccion',
        'Talleres Automotrices': 'category-auto',
        'Tecnología y Redes': 'category-tecnologia',
        'Servicios de Despedida': 'category-funeraria',
        'Servicios para Eventos': 'category-eventos',
        'Imagen y Cuidado Personal': 'category-imagen'
    };
    return classes[categoria] || '';
}

function getColorVariable(categoria) {
    const colors = {
        'Salud y Bienestar': 'var(--color-salud, #0D9488)',
        'Mantenimiento del Hogar': 'var(--color-hogar, #EA580C)',
        'Materiales de Construcción': 'var(--color-construccion, #C2410C)',
        'Talleres Automotrices': 'var(--color-auto, #1D4ED8)',
        'Tecnología y Redes': 'var(--color-tecnologia, #0891B2)',
        'Servicios de Despedida': 'var(--color-funeraria, #475569)',
        'Servicios para Eventos': 'var(--color-eventos, #8B5CF6)',
        'Imagen y Cuidado Personal': 'var(--color-imagen, #7C3AED)'
    };
    return colors[categoria] || '#2563EB';
}

// ========================================
// BADGES DE PLAN v11.3
// ========================================

function getPlanBadge(tipo_plan) {
    const badges = {
        'gratuito': '<span class="badge-nivel nivel-gratuito"><i class="fas fa-circle"></i> Gratuito</span>',
        'basico': '<span class="badge-nivel nivel-basico"><i class="fas fa-star"></i> Básico</span>',
        'completo': '<span class="badge-nivel nivel-completo"><i class="fas fa-crown"></i> Completo</span>'
    };
    return badges[tipo_plan] || '';
}

// Fix WhatsApp 591 duplicado
function buildWhatsLink(raw, msg) {
    const n = String(raw || '').replace(/\D/g, '');
    if (n.length < 8) return '#';
    const full = n.startsWith('591') ? n : '591' + n;
    return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
}

// ========================================
// CACHÉ DE DATOS
// ========================================

const cacheProveedores = { datos: null, tiempo: 0 };

async function obtenerProveedores() {
    const ahora = Date.now();
    if (cacheProveedores.datos && ahora - cacheProveedores.tiempo < 60000) {
        return cacheProveedores.datos;
    }

    try {
        const response = await fetch('data/proveedores.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('No se pudo cargar el archivo de datos');

        const raw = await response.json();
        const lista = Array.isArray(raw) ? raw : (raw.proveedores || []);

        cacheProveedores.datos = lista.map(p =>
            Object.fromEntries(
                Object.entries(p).map(([k, v]) => [k, typeof v === 'string' ? escaparHTML(v) : v])
            )
        );
        cacheProveedores.tiempo = ahora;
        return cacheProveedores.datos;
    } catch (error) {
        console.error('Error obteniendo proveedores:', error);
        return [];
    }
}

// ========================================
// CARGAR PROVEEDORES EN CONTENEDOR
// ========================================

async function cargarProveedoresEnContenedor(contenedorId, categoria, palabraClave = null) {
    const container = document.getElementById(contenedorId);
    if (!container) return;
    
    try {
        const todos = await obtenerProveedores();
        
        // v11.3: orden de prioridad
        const ordenPorPlan = { 'completo': 0, 'basico': 1, 'gratuito': 2 };
        todos.sort((a, b) => (ordenPorPlan[a.tipo_plan] || 2) - (ordenPorPlan[b.tipo_plan] || 2));
        
        const catNormal = normalizarTexto(categoria);
        let filtrados = todos.filter(p => normalizarTexto(p.categoria) === catNormal);
        
        if (palabraClave) {
            const clave = normalizarTexto(palabraClave);
            
            let porSubcategoria = filtrados.filter(p =>
                normalizarTexto(p.subcategoria).includes(clave)
            );
            
            if (porSubcategoria.length > 0) {
                filtrados = porSubcategoria;
            } else {
                filtrados = filtrados.filter(p => {
                    const textoBusqueda = normalizarTexto(`${p.subcategoria} ${p.nombre} ${p.descripcion}`);
                    return textoBusqueda.includes(clave);
                });
            }
        }
        
        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="no-data fade-in visible" style="text-align:center; padding: 2rem; color: #666; grid-column: 1/-1;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #cbd5e1;"></i>
                    <p>Próximamente agregaremos más proveedores de esta sección.</p>
                    <a href="${buildWhatsLink('76536286', 'Hola, estoy buscando un proveedor')}" 
                       class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer" style="margin-top:0.5rem;">
                       <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
                </div>`;
            return;
        }
        
        container.innerHTML = filtrados.map(p => generarTarjetaProveedor(p)).join('');
        
        if (window.fadeObserver) {
            container.querySelectorAll('.fade-in').forEach(el => window.fadeObserver.observe(el));
        }
    } catch (error) {
        console.error(`Error cargando proveedores en ${contenedorId}:`, error);
        container.innerHTML = `
            <div class="no-data fade-in visible" style="text-align:center; padding: 2rem; color: #ef4444; grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los proveedores. <button onclick="location.reload()" class="btn btn-outline btn-sm" style="margin-top:0.5rem;">Reintentar</button></p>
            </div>`;
    }
}

function generarTarjetaProveedor(p) {
    const whatsappLink = buildWhatsLink(p.whatsapp || p.telefono, 'Hola, vi tu perfil en La Paz te Acerca y me interesa tu servicio');
    const categoriaClass = getCategoriaClass(p.categoria);
    const colorVar = getColorVariable(p.categoria);
    const planBadge = getPlanBadge(p.tipo_plan);
    
    const imagenes = [p.imagen1, p.imagen2, p.imagen3, p.imagen4].filter(img => img && img.trim() !== '');
    const totalImagenes = imagenes.length;
    const esCompleto = p.tipo_plan === 'completo';
    
    let htmlImagenes = '';
    if (totalImagenes === 1) {
        htmlImagenes = `<div class="galeria-proveedor galeria-1"><img src="${imagenes[0]}" alt="${p.nombre}" class="img-galeria" loading="lazy"></div>`;
    } else if (totalImagenes === 2) {
        htmlImagenes = `<div class="galeria-proveedor galeria-2"><img src="${imagenes[0]}" alt="${p.nombre} 1" class="img-galeria" loading="lazy"><img src="${imagenes[1]}" alt="${p.nombre} 2" class="img-galeria" loading="lazy"></div>`;
    } else if (totalImagenes >= 3) {
        htmlImagenes = `<div class="galeria-proveedor galeria-3"><img src="${imagenes[0]}" alt="${p.nombre} 1" class="img-galeria img-principal" loading="lazy"><div class="galeria-secundarias"><img src="${imagenes[1]}" alt="${p.nombre} 2" class="img-galeria" loading="lazy"><img src="${imagenes[2]}" alt="${p.nombre} 3" class="img-galeria" loading="lazy"></div></div>`;
    }
    
    let html24h = '';
    if (p['24horas']) {
        html24h = `<span class="badge-24horas badge-24h-pulse"><i class="fas fa-moon"></i> Atención 24h</span><p class="aviso-24horas">⚠️ Te sugerimos llamar para confirmar disponibilidad en horarios nocturnos o festivos.</p>`;
    }
    
    let zonaBadge = '';
    if (p.direccion) {
        const dirLower = p.direccion.toLowerCase();
        if (dirLower.includes('el alto')) zonaBadge = '<span style="font-size:0.7rem; background:#e2e8f0; padding:2px 6px; border-radius:4px; margin-left:5px;">📍 El Alto</span>';
        else if (dirLower.includes('la paz')) zonaBadge = '<span style="font-size:0.7rem; background:#e2e8f0; padding:2px 6px; border-radius:4px; margin-left:5px;">📍 La Paz</span>';
    }

    return `
        <article class="category-card ${categoriaClass} ${esCompleto ? 'card-completo' : ''} fade-in" style="position: relative; border-left: 4px solid ${colorVar};">
            ${p.destacado == 1 ? '<div class="featured-badge" style="position:absolute; top:10px; right:10px; z-index:2;"><i class="fas fa-crown"></i> DESTACADO</div>' : ''}
            ${planBadge ? `<div style="position:absolute; top:10px; left:10px; z-index:2;">${planBadge}</div>` : ''}
            
            ${htmlImagenes}
            
            <div class="card-content-wrapper">
                <h3 style="margin-top: 0;">${p.nombre || 'Proveedor Verificado'} ${zonaBadge}</h3>
                <p class="category-subtitle" style="color: ${colorVar}; font-weight: 600;">${p.subcategoria || ''}</p>
                ${p.descripcion ? `<p style="color: #475569; font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.4;">${p.descripcion}</p>` : ''}
                
                ${html24h}
                
                <ul class="category-services" style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748b;">
                    ${p.direccion ? `<li style="margin-bottom: 0.3rem;"><i class="fas fa-map-marker-alt" style="width: 16px; color: #ef4444;"></i> ${p.direccion}</li>` : ''}
                    ${p.horario ? `<li style="margin-bottom: 0.3rem;"><i class="fas fa-clock" style="width: 16px; color: #3b82f6;"></i> ${p.horario}</li>` : ''}
                    ${p.precios ? `<li style="margin-bottom: 0.3rem;"><i class="fas fa-dollar-sign" style="width: 16px; color: #10b981;"></i> ${p.precios}</li>` : ''}
                </ul>
                
                ${p.audio_url ? `<div style="margin: 0.5rem 0;"><audio controls preload="metadata" style="width: 100%; height: 32px;"><source src="${p.audio_url}" type="audio/mpeg"></audio></div>` : ''}
                
                <div class="category-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    ${p.whatsapp || p.telefono ? `<a href="${whatsappLink}" class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center;"><i class="fab fa-whatsapp"></i> Contactar</a>` : ''}
                    ${p.telefono && !p.whatsapp ? `<a href="tel:${p.telefono}" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; border-color: ${colorVar}; color: ${colorVar};"><i class="fas fa-phone"></i> Llamar</a>` : ''}
                </div>
            </div>
        </article>
    `;
}

async function cargarDestacados() {
    const container = document.getElementById('destacados-container');
    if (!container) return;
    
    try {
        const proveedores = await obtenerProveedores();
        // v11.3: orden de prioridad
        const ordenPorPlan = { 'completo': 0, 'basico': 1, 'gratuito': 2 };
        const destacados = proveedores
            .filter(p => p.destacado === 1)
            .sort((a, b) => (ordenPorPlan[a.tipo_plan] || 2) - (ordenPorPlan[b.tipo_plan] || 2));
        
        if (destacados.length === 0) {
            container.innerHTML = `<div class="no-data fade-in visible" style="text-align:center; padding: 2rem; color: #666; grid-column: 1/-1;"><i class="fas fa-star" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #cbd5e1;"></i><p>Próximamente agregaremos proveedores destacados.</p></div>`;
            return;
        }
        
        container.innerHTML = destacados.map(p => generarTarjetaDestacada(p)).join('');
        if (window.fadeObserver) container.querySelectorAll('.fade-in').forEach(el => window.fadeObserver.observe(el));
    } catch (error) { console.error('Error cargando destacados:', error); }
}

function generarTarjetaDestacada(p) {
    const whatsappLink = buildWhatsLink(p.whatsapp || p.telefono, 'Hola, vi tu perfil destacado en La Paz te Acerca');
    const imagenes = [p.imagen1, p.imagen2, p.imagen3, p.imagen4].filter(img => img && img.trim() !== '');
    const totalImagenes = imagenes.length;
    
    let htmlImagen = '';
    if (totalImagenes === 1) htmlImagen = `<div class="galeria-proveedor galeria-1"><img src="${imagenes[0]}" alt="${p.nombre}" class="img-galeria" loading="lazy"></div>`;
    else if (totalImagenes === 2) htmlImagen = `<div class="galeria-proveedor galeria-2"><img src="${imagenes[0]}" alt="${p.nombre} 1" class="img-galeria" loading="lazy"><img src="${imagenes[1]}" alt="${p.nombre} 2" class="img-galeria" loading="lazy"></div>`;
    else if (totalImagenes >= 3) htmlImagen = `<div class="galeria-proveedor galeria-3"><img src="${imagenes[0]}" alt="${p.nombre} 1" class="img-galeria img-principal" loading="lazy"><div class="galeria-secundarias">${imagenes.slice(1, 4).map((img, idx) => `<img src="${img}" alt="${p.nombre} ${idx + 2}" class="img-galeria" loading="lazy">`).join('')}</div></div>`;
    
    return `
        <div class="destacado-card ${getCategoriaClass(p.categoria)} fade-in">
            <div class="destacado-badge"><i class="fas fa-crown"></i> DESTACADO</div>
            ${htmlImagen}
            <h4>${p.nombre}</h4>
            <p class="destacado-subtitle">${p.categoria} > ${p.subcategoria}</p>
            <p class="destacado-info"><i class="fas fa-map-marker-alt"></i> ${p.direccion || 'Sin dirección'}</p>
            <p class="destacado-info"><i class="fas fa-phone"></i> ${p.telefono || 'Sin teléfono'}</p>
            ${p.descripcion ? `<p style="font-size:0.85rem;color:#64748b;margin:0.5rem 0;line-height:1.4;">${p.descripcion}</p>` : ''}
            ${p.whatsapp || p.telefono ? `<div style="margin-top:0.75rem;"><a href="${whatsappLink}" class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer" style="width:100%;"><i class="fab fa-whatsapp"></i> Contactar</a></div>` : ''}
        </div>
    `;
}

// ========================================
// FILTROS EN VIVO
// ========================================

function initFiltrosEnVivo() {
    document.addEventListener('click', async function(e) {
        const chip = e.target.closest('.filtro-chip');
        if (!chip) return;
        
        e.preventDefault();
        
        const parent = chip.parentElement;
        if (parent) {
            parent.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('active'));
        }
        chip.classList.add('active');
        
        const contenedorId = chip.getAttribute('data-contenedor');
        const categoria = chip.getAttribute('data-categoria');
        const keyword = chip.getAttribute('data-keyword');
        
        const container = document.getElementById(contenedorId);
        if (!container) return;
        
        container.innerHTML = '<p class="text-center" style="padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Filtrando...</p>';
        
        await cargarProveedoresEnContenedor(contenedorId, categoria, keyword || null);
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ========================================
// TOAST PÚBLICO
// ========================================

function showToast(title, message, type = 'info', duration = 5000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${escaparHTML(title)}</div>
            <div class="toast-message">${escaparHTML(message)}</div>
        </div>
        <button class="toast-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        <div class="toast-progress" style="animation-duration:${duration}ms"></div>
    `;
    
    container.appendChild(toast);
    
    const cerrar = () => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    };
    
    toast.querySelector('.toast-close').addEventListener('click', cerrar);
    setTimeout(cerrar, duration);
}

function initToastDeExito() {
    const params = new URLSearchParams(location.search);
    if (params.get('exito')) {
        showToast('¡Mensaje enviado!', 'Te responderemos en menos de 2 horas.', 'success');
        history.replaceState(null, '', location.pathname);
    }
}

// ========================================
// INICIALIZADORES
// ========================================

function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.pageYOffset > 50);
    }, { passive: true });
}

function initMenuHamburguesa() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('navOverlay');
    
    if (!menuToggle || !nav) return;
    
    const toggleMenu = () => {
        const isActive = nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        if (overlay) overlay.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    };
    
    menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) toggleMenu();
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) toggleMenu();
    });
}

function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    fadeElements.forEach(el => fadeObserver.observe(el));
    window.fadeObserver = fadeObserver;
}

function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.categories-grid, .destacados-grid, .proveedores-grid, .testimonials-grid');
    staggerContainers.forEach(container => {
        const items = container.querySelectorAll('.fade-in');
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 80}ms`;
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 0;
                window.scrollTo({ top: target.offsetTop - headerHeight - 20, behavior: 'smooth' });
                history.pushState(null, null, href);
            }
        });
    });
}

function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

function initPrevencionClicksDobles() {
    document.querySelectorAll('.btn, button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.classList.contains('clicked') || this.disabled) {
                e.preventDefault();
                return;
            }
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 1000);
        });
    });
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    }, { passive: true });
    
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initMobileShowcase() {
    const showcase = document.getElementById('mobileShowcase');
    if (!showcase) return;
    
    window.addEventListener('scroll', () => {
        showcase.classList.toggle('visible', window.pageYOffset > 400);
    }, { passive: true });
}

// ========================================
// ACORDEÓN (única definición global)
// ========================================

function toggleAcordeon(header) {
    if (!header) return;
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    if (content) {
        content.classList.toggle('open');
    }
}

// ========================================
// LISTENERS GLOBALES
// ========================================

window.addEventListener('error', (e) => console.error('Error global:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Promesa rechazada:', e.reason));