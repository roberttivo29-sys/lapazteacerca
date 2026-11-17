// ========================================
// LA PAZ TE ACERCA - API de Proveedores v12.2.6
// Lee directamente de GitHub API (sin loops)
// ========================================

import { validateToken } from './login.js';

const GITHUB_OWNER = 'roberttivo29-sys';
const GITHUB_REPO = 'lapazteacerca';
const GITHUB_PATH = 'data/proveedores.json';
const GITHUB_BRANCH = 'main';

// ========================================
// Helper: Leer proveedores desde GitHub
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
  const content = atob(data.content);
  const proveedores = JSON.parse(content);
  
  return Array.isArray(proveedores) ? proveedores : [];
}

// ========================================
// Helper: Guardar proveedores en GitHub
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
  
  // Codificar contenido en base64
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(proveedores, null, 2))));
  
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