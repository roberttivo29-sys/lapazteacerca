// ========================================
// LA PAZ TE ACERCA - API de Proveedores v12.2.3
// Estrategia: lee el JSON directamente del sitio (sin GitHub API)
// Fix v12.2.3: elimina dependencia del GITHUB_TOKEN para lectura
// ========================================

import { validateToken } from './login.js';

const SITE_URL = 'https://lapazteacerca.pages.dev';

// ========================================
// GET: lista todos los proveedores
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

  // Validar autenticación
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: true, message: 'No autorizado' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const token = authHeader.split(' ')[1];
  const secret = env.SESSION_SECRET;

  if (!secret) {
    return new Response(
      JSON.stringify({ error: true, message: 'SESSION_SECRET no configurado' }),
      { status: 500, headers: corsHeaders }
    );
  }

  const valid = await validateToken(token, secret);
  if (!valid) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token inválido o expirado' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    // Leer el JSON directamente del sitio (sin GitHub API)
    const response = await fetch(`${SITE_URL}/data/proveedores.json`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al leer proveedores.json`);
    }

    const proveedores = await response.json();

    return new Response(
      JSON.stringify({ proveedores: Array.isArray(proveedores) ? proveedores : [] }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: 'No se pudo cargar el archivo de proveedores: ' + error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================
// POST: agregar nuevo proveedor
// ========================================
export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Validar auth
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
    
    // Leer archivo actual
    const currentResponse = await fetch(`${SITE_URL}/data/proveedores.json`, { cache: 'no-store' });
    const currentData = await currentResponse.json();
    const proveedores = Array.isArray(currentData) ? currentData : [];

    // Verificar ID único
    if (proveedores.some(p => p.id === newProvider.id)) {
      return new Response(JSON.stringify({ error: true, message: `El ID ${newProvider.id} ya existe` }), { status: 409, headers: corsHeaders });
    }

    proveedores.push(newProvider);

    // Guardar vía GitHub API (aquí sí necesitamos el token)
    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado para escritura' }), { status: 500, headers: corsHeaders });
    }

    const content = btoa(JSON.stringify(proveedores, null, 2));
    const repoPath = 'data/proveedores.json';

    // Obtener SHA actual
    const shaResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}?ref=main`,
      { headers: { 'Authorization': `token ${githubToken}` } }
    );
    const shaData = await shaResponse.json();

    // Actualizar archivo
    const updateResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Agregar proveedor: ${newProvider.nombre}`,
          content: content,
          sha: shaData.sha,
          branch: 'main'
        })
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(err.message || 'Error al guardar en GitHub');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Proveedor agregado correctamente' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: 'Error: ' + error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================
// PUT: actualizar proveedor existente
// ========================================
export async function onRequestPut(context) {
  const { request, env, params } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Validar auth
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

    const currentResponse = await fetch(`${SITE_URL}/data/proveedores.json`, { cache: 'no-store' });
    const currentData = await currentResponse.json();
    const proveedores = Array.isArray(currentData) ? currentData : [];

    const index = proveedores.findIndex(p => p.id === providerId);
    if (index === -1) {
      return new Response(JSON.stringify({ error: true, message: `Proveedor con ID ${providerId} no encontrado` }), { status: 404, headers: corsHeaders });
    }

    proveedores[index] = { ...proveedores[index], ...updatedProvider, id: providerId };

    // Guardar vía GitHub API
    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }), { status: 500, headers: corsHeaders });
    }

    const content = btoa(JSON.stringify(proveedores, null, 2));
    const repoPath = 'data/proveedores.json';

    const shaResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}?ref=main`,
      { headers: { 'Authorization': `token ${githubToken}` } }
    );
    const shaData = await shaResponse.json();

    const updateResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Actualizar proveedor: ${updatedProvider.nombre}`,
          content: content,
          sha: shaData.sha,
          branch: 'main'
        })
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(err.message || 'Error al actualizar');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Proveedor actualizado' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: 'Error: ' + error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================
// DELETE: eliminar proveedor
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

    const currentResponse = await fetch(`${SITE_URL}/data/proveedores.json`, { cache: 'no-store' });
    const currentData = await currentResponse.json();
    let proveedores = Array.isArray(currentData) ? currentData : [];

    const filtered = proveedores.filter(p => p.id !== providerId);
    if (filtered.length === proveedores.length) {
      return new Response(JSON.stringify({ error: true, message: 'Proveedor no encontrado' }), { status: 404, headers: corsHeaders });
    }

    // Guardar vía GitHub API
    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({ error: true, message: 'GITHUB_TOKEN no configurado' }), { status: 500, headers: corsHeaders });
    }

    const content = btoa(JSON.stringify(filtered, null, 2));
    const repoPath = 'data/proveedores.json';

    const shaResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}?ref=main`,
      { headers: { 'Authorization': `token ${githubToken}` } }
    );
    const shaData = await shaResponse.json();

    const updateResponse = await fetch(
      `https://api.github.com/repos/roberttivo29-sys/lapazteacerca/contents/${repoPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Eliminar proveedor ID ${providerId}`,
          content: content,
          sha: shaData.sha,
          branch: 'main'
        })
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(err.message || 'Error al eliminar');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Proveedor eliminado' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: 'Error: ' + error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}