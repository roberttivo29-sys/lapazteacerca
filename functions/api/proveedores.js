// ========================================
// LA PAZ TE ACERCA - API de Proveedores v12.2.4
// Fix: usa el origen dinámico de la request (sin hardcodear dominio)
// ========================================

import { validateToken } from './login.js';

// Helper: obtener el origen actual (funciona en preview, production y custom domain)
function getOrigin(request) {
  const url = new URL(request.url);
  return url.origin;
}

// Helper: leer el JSON del propio sitio
async function readProveedores(request) {
  const origin = getOrigin(request);
  const response = await fetch(`${origin}/data/proveedores.json`, {
    headers: { 'Cache-Control': 'no-cache' },
    cf: { cacheTtl: 0 }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al leer /data/proveedores.json`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : (data.proveedores || []);
}

// Helper: escribir en GitHub
async function writeProveedores(request, env, proveedores, message) {
  const githubToken = env.GITHUB_TOKEN;
  if (!githubToken) throw new Error('GITHUB_TOKEN no configurado');

  const owner = 'roberttivo29-sys';
  const repo = 'lapazteacerca';
  const path = 'data/proveedores.json';

  // Obtener SHA actual
  const shaRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`,
    { headers: { 'Authorization': `token ${githubToken}`, 'User-Agent': 'lapazteacerca' } }
  );
  if (!shaRes.ok) throw new Error(`No se pudo obtener SHA: ${shaRes.status}`);
  const shaData = await shaRes.json();

  // Codificar nuevo contenido
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(proveedores, null, 2))));

  const updateRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'lapazteacerca'
      },
      body: JSON.stringify({
        message,
        content,
        sha: shaData.sha,
        branch: 'main'
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.message || `Error GitHub: ${updateRes.status}`);
  }
  return updateRes.json();
}

// ========================================
// GET
// ========================================
export async function onRequestGet(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: true, message: 'No autorizado' }), { status: 401, headers: corsHeaders });
  }
  const token = authHeader.split(' ')[1];
  const secret = env.SESSION_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: true, message: 'SESSION_SECRET no configurado' }), { status: 500, headers: corsHeaders });
  }
  const valid = await validateToken(token, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: true, message: 'Token inválido' }), { status: 401, headers: corsHeaders });
  }

  try {
    const proveedores = await readProveedores(request);
    return new Response(JSON.stringify({ proveedores }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 500, headers: corsHeaders });
  }
}

// ========================================
// POST
// ========================================
export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: true, message: 'No autorizado' }), { status: 401, headers: corsHeaders });
  }
  const token = authHeader.split(' ')[1];
  const secret = env.SESSION_SECRET;
  const valid = await validateToken(token, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: true, message: 'Token inválido' }), { status: 401, headers: corsHeaders });
  }

  try {
    const newProvider = await request.json();
    const proveedores = await readProveedores(request);

    if (proveedores.some(p => p.id === newProvider.id)) {
      return new Response(JSON.stringify({ error: true, message: `El ID ${newProvider.id} ya existe` }), { status: 409, headers: corsHeaders });
    }

    proveedores.push(newProvider);
    await writeProveedores(request, env, proveedores, `Agregar proveedor: ${newProvider.nombre}`);

    return new Response(JSON.stringify({ success: true, message: 'Proveedor agregado' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 500, headers: corsHeaders });
  }
}

// ========================================
// PUT
// ========================================
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: true, message: 'No autorizado' }), { status: 401, headers: corsHeaders });
  }
  const token = authHeader.split(' ')[1];
  const secret = env.SESSION_SECRET;
  const valid = await validateToken(token, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: true, message: 'Token inválido' }), { status: 401, headers: corsHeaders });
  }

  try {
    const updatedProvider = await request.json();
    const providerId = parseInt(params.id);
    const proveedores = await readProveedores(request);

    const index = proveedores.findIndex(p => p.id === providerId);
    if (index === -1) {
      return new Response(JSON.stringify({ error: true, message: `Proveedor ${providerId} no encontrado` }), { status: 404, headers: corsHeaders });
    }

    proveedores[index] = { ...proveedores[index], ...updatedProvider, id: providerId };
    await writeProveedores(request, env, proveedores, `Actualizar proveedor: ${updatedProvider.nombre}`);

    return new Response(JSON.stringify({ success: true, message: 'Proveedor actualizado' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 500, headers: corsHeaders });
  }
}

// ========================================
// DELETE
// ========================================
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: true, message: 'No autorizado' }), { status: 401, headers: corsHeaders });
  }
  const token = authHeader.split(' ')[1];
  const secret = env.SESSION_SECRET;
  const valid = await validateToken(token, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: true, message: 'Token inválido' }), { status: 401, headers: corsHeaders });
  }

  try {
    const providerId = parseInt(params.id);
    const proveedores = await readProveedores(request);
    const filtered = proveedores.filter(p => p.id !== providerId);

    if (filtered.length === proveedores.length) {
      return new Response(JSON.stringify({ error: true, message: 'Proveedor no encontrado' }), { status: 404, headers: corsHeaders });
    }

    await writeProveedores(request, env, filtered, `Eliminar proveedor ID ${providerId}`);

    return new Response(JSON.stringify({ success: true, message: 'Proveedor eliminado' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 500, headers: corsHeaders });
  }
}