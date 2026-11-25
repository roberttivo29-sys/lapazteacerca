// ========================================
// LA PAZ TE ACERCA - API de Proveedores v13.0
// Lee directamente de GitHub API (sin loops)
//
// Novedades v13.0:
// - FIX CRÍTICO: Decodificación UTF-8 correcta en lectura (atob + TextDecoder).
// - FIX CRÍTICO: Codificación UTF-8 correcta en escritura (TextEncoder + btoa).
//   (Antes: "Clínica" → "ClÃ­nica" en cada guardado. Ahora: se preserva.)
// - NUEVO: validación de esquema antes de POST/PUT (reglas de plan, campos obligatorios).
// - Se mantiene TODO el código original: CORS, OPTIONS, User-Agent, console.error, etc.
// ========================================

import { validateToken } from './login.js';

const GITHUB_OWNER = 'roberttivo29-sys';
const GITHUB_REPO = 'lapazteacerca';
const GITHUB_PATH = 'data/proveedores.json';
const GITHUB_BRANCH = 'main';

// ========================================
// NUEVO v13.0: Validación de esquema
// ========================================
function validarProveedor(p) {
    const errores = [];

    if (!p.nombre || typeof p.nombre !== 'string' || p.nombre.trim().length === 0) {
        errores.push('El nombre es obligatorio');
    } else if (p.nombre.length > 120) {
        errores.push('El nombre no puede superar 120 caracteres');
    }

    const categoriasValidas = [
        'Salud y Bienestar',
        'Mantenimiento del Hogar',
        'Materiales de Construcción',
        'Talleres Automotrices',
        'Tecnología y Redes',
        'Servicios de Despedida',
        'Servicios para Eventos',
        'Imagen y Cuidado Personal'
    ];
    if (!p.categoria || !categoriasValidas.includes(p.categoria)) {
        errores.push('Categoría no válida');
    }

    if (!p.subcategoria || typeof p.subcategoria !== 'string' || p.subcategoria.trim().length === 0) {
        errores.push('La subcategoría es obligatoria');
    }

    const planesValidos = ['gratuito', 'basico', 'completo'];
    if (!p.tipo_plan || !planesValidos.includes(p.tipo_plan)) {
        errores.push('Plan de visibilidad no válido');
    }

    // Regla de negocio: imágenes máximas por plan
    const imagenesUsadas = [1, 2, 3, 4].filter(i => (p['imagen' + i] || '').trim().length > 0);
    const maxImagenes = p.tipo_plan === 'completo' ? 4 : (p.tipo_plan === 'basico' ? 2 : 0);
    if (imagenesUsadas.length > maxImagenes) {
        errores.push(`El plan ${p.tipo_plan} solo permite ${maxImagenes} imagen(es). Tienes ${imagenesUsadas.length}.`);
    }

    // Regla de negocio: destacado requiere plan de pago
    if (Number(p.destacado) === 1 && p.tipo_plan === 'gratuito') {
        errores.push('Solo los planes Básico o Completo pueden aparecer en Destacados');
    }

    // Validación de WhatsApp (si existe, debe ser numérico)
    if (p.whatsapp && String(p.whatsapp).trim() !== '') {
        const soloDigitos = String(p.whatsapp).replace(/\D/g, '');
        if (soloDigitos.length < 7 || soloDigitos.length > 12) {
            errores.push('El número de WhatsApp no parece válido');
        }
    }

    // Validación de audio_url (si existe, debe ser https)
    if (p.audio_url && String(p.audio_url).trim() !== '') {
        if (!/^https:\/\//.test(p.audio_url)) {
            errores.push('La URL de audio debe comenzar con https://');
        }
    }

    return errores.length > 0 ? errores : null;
}

// ========================================
// Helper: Leer proveedores desde GitHub
// FIX v13.0: Decodificación UTF-8 correcta
// ========================================
async function readProveedoresFromGitHub(githubToken) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'lapazteacerca-admin',
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // GitHub devuelve el contenido en base64
    // FIX v13.0: atob() devuelve string latin1. Convertir a bytes y decodificar como UTF-8.
    const raw = atob(data.content);
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const content = new TextDecoder('utf-8').decode(bytes);
    const proveedores = JSON.parse(content);

    return Array.isArray(proveedores) ? proveedores : [];
}

// ========================================
// Helper: Guardar proveedores en GitHub
// FIX v13.0: Codificación UTF-8 correcta (sin unescape deprecated)
// ========================================
async function writeProveedoresToGitHub(githubToken, proveedores, message) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    // Obtener SHA actual
    const shaResponse = await fetch(
        `${url}?ref=${GITHUB_BRANCH}`,
        {
            headers: {
                'Authorization': `token ${githubToken}`,
                'User-Agent': 'lapazteacerca-admin',
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );

    if (!shaResponse.ok) {
        throw new Error(`No se pudo obtener SHA: ${shaResponse.status}`);
    }

    const shaData = await shaResponse.json();

    // FIX v13.0: Codificar UTF-8 correctamente sin usar unescape() (deprecated)
    const jsonString = JSON.stringify(proveedores, null, 2);
    const jsonBytes = new TextEncoder().encode(jsonString);
    let bin = '';
    jsonBytes.forEach(b => bin += String.fromCharCode(b));
    const content = btoa(bin);

    // Actualizar archivo
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'lapazteacerca-admin'
        },
        body: JSON.stringify({
            message: message,
            content: content,
            sha: shaData.sha,
            branch: GITHUB_BRANCH
        })
    });

    if (!updateResponse.ok) {
        const err = await updateResponse.json().catch(() => ({}));
        throw new Error(err.message || `Error al guardar: ${updateResponse.status}`);
    }

    return updateResponse.json();
}

// ========================================
// Helper: Validar autenticación
// ========================================
async function validateAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Token de autenticación requerido', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const secret = env.SESSION_SECRET;

    if (!secret) {
        return { valid: false, error: 'SESSION_SECRET no configurado', status: 500 };
    }

    const valid = await validateToken(token, secret);
    if (!valid) {
        return { valid: false, error: 'Token inválido o expirado', status: 401 };
    }

    return { valid: true };
}

// ========================================
// GET: Listar proveedores
// ========================================
export async function onRequestGet(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Validar auth
    const auth = await validateAuth(request, env);
    if (!auth.valid) {
        return new Response(
            JSON.stringify({ error: true, message: auth.error }),
            { status: auth.status, headers: corsHeaders }
        );
    }

    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
        return new Response(
            JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }),
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const proveedores = await readProveedoresFromGitHub(githubToken);
        return new Response(
            JSON.stringify({ proveedores }),
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error reading proveedores:', error);
        return new Response(
            JSON.stringify({ error: true, message: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ========================================
// POST: Agregar proveedor
// ========================================
export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const auth = await validateAuth(request, env);
    if (!auth.valid) {
        return new Response(
            JSON.stringify({ error: true, message: auth.error }),
            { status: auth.status, headers: corsHeaders }
        );
    }

    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
        return new Response(
            JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }),
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const newProvider = await request.json();

        // NUEVO v13.0: Validación de esquema
        const errores = validarProveedor(newProvider);
        if (errores) {
            return new Response(
                JSON.stringify({ error: true, message: 'Datos inválidos', detalles: errores }),
                { status: 400, headers: corsHeaders }
            );
        }

        const proveedores = await readProveedoresFromGitHub(githubToken);

        // Verificar ID único
        if (proveedores.some(p => p.id === newProvider.id)) {
            return new Response(
                JSON.stringify({ error: true, message: `El ID ${newProvider.id} ya existe` }),
                { status: 409, headers: corsHeaders }
            );
        }

        proveedores.push(newProvider);
        await writeProveedoresToGitHub(githubToken, proveedores, `Agregar proveedor: ${newProvider.nombre}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Proveedor agregado correctamente' }),
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error adding provider:', error);
        return new Response(
            JSON.stringify({ error: true, message: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ========================================
// PUT: Actualizar proveedor
// ========================================
export async function onRequestPut(context) {
    const { request, env, params } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const auth = await validateAuth(request, env);
    if (!auth.valid) {
        return new Response(
            JSON.stringify({ error: true, message: auth.error }),
            { status: auth.status, headers: corsHeaders }
        );
    }

    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
        return new Response(
            JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }),
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const updatedProvider = await request.json();
        const providerId = parseInt(params.id);

        // NUEVO v13.0: Validación de esquema
        const errores = validarProveedor(updatedProvider);
        if (errores) {
            return new Response(
                JSON.stringify({ error: true, message: 'Datos inválidos', detalles: errores }),
                { status: 400, headers: corsHeaders }
            );
        }

        const proveedores = await readProveedoresFromGitHub(githubToken);

        const index = proveedores.findIndex(p => p.id === providerId);
        if (index === -1) {
            return new Response(
                JSON.stringify({ error: true, message: `Proveedor con ID ${providerId} no encontrado` }),
                { status: 404, headers: corsHeaders }
            );
        }

        proveedores[index] = { ...proveedores[index], ...updatedProvider, id: providerId };
        await writeProveedoresToGitHub(githubToken, proveedores, `Actualizar proveedor: ${updatedProvider.nombre}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Proveedor actualizado correctamente' }),
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error updating provider:', error);
        return new Response(
            JSON.stringify({ error: true, message: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ========================================
// DELETE: Eliminar proveedor
// ========================================
export async function onRequestDelete(context) {
    const { request, env, params } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const auth = await validateAuth(request, env);
    if (!auth.valid) {
        return new Response(
            JSON.stringify({ error: true, message: auth.error }),
            { status: auth.status, headers: corsHeaders }
        );
    }

    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
        return new Response(
            JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }),
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const providerId = parseInt(params.id);
        const proveedores = await readProveedoresFromGitHub(githubToken);
        const filtered = proveedores.filter(p => p.id !== providerId);

        if (filtered.length === proveedores.length) {
            return new Response(
                JSON.stringify({ error: true, message: 'Proveedor no encontrado' }),
                { status: 404, headers: corsHeaders }
            );
        }

        await writeProveedoresToGitHub(githubToken, filtered, `Eliminar proveedor ID ${providerId}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Proveedor eliminado correctamente' }),
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error deleting provider:', error);
        return new Response(
            JSON.stringify({ error: true, message: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}