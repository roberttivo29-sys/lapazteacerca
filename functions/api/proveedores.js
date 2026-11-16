// ========================================
// LA PAZ TE ACERCA - Worker CRUD de Proveedores v11.0
// Lee y escribe en GitHub con codificación UTF-8 correcta
// ========================================

import { validateToken } from './login.js';

const REPO = 'roberttivo29-sys/lapazteacerca';
const BRANCH = 'main';
const FILE_PATH = 'data/proveedores.json';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar token de autenticación
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token de autenticación requerido' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const token = authHeader.substring(7);
  const secret = env.SESSION_SECRET || 'default-secret-change-me';
  
  if (!await validateToken(token, secret)) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token inválido o expirado' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const githubToken = env.GITHUB_TOKEN;
  if (!githubToken) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token de GitHub no configurado' }),
      { status: 500, headers: corsHeaders }
    );
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const providerId = pathParts[pathParts.length - 1];

  try {
    switch (request.method) {
      case 'GET':
        return await handleGet(githubToken);
      case 'POST':
        return await handlePost(request, githubToken);
      case 'PUT':
        return await handlePut(request, githubToken, providerId);
      case 'DELETE':
        return await handleDelete(githubToken, providerId);
      default:
        return new Response(
          JSON.stringify({ error: true, message: 'Método no permitido' }),
          { status: 405, headers: corsHeaders }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET: Obtener todos los proveedores
async function handleGet(githubToken) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('No se pudo cargar el archivo de proveedores');
  }

  const data = await response.json();
  const content = decodeBase64(data.content); // Fix UTF-8 v11.0
  const providers = JSON.parse(content);

  return new Response(
    JSON.stringify({ proveedores: providers }),
    { status: 200, headers: corsHeaders }
  );
}

// POST: Agregar nuevo proveedor
async function handlePost(request, githubToken) {
  const newProvider = await request.json();
  
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(decodeBase64(currentFile.content)); // Fix UTF-8
  
  if (providers.find(p => p.id === newProvider.id)) {
    throw new Error(`El ID ${newProvider.id} ya existe`);
  }
  
  providers.push(newProvider);
  await saveToGitHub(githubToken, providers, currentFile.sha, 'Agregar proveedor');
  
  return new Response(
    JSON.stringify({ success: true, message: 'Proveedor agregado' }),
    { status: 201, headers: corsHeaders }
  );
}

// PUT: Actualizar proveedor existente
async function handlePut(request, githubToken, providerId) {
  const updatedProvider = await request.json();
  
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(decodeBase64(currentFile.content)); // Fix UTF-8
  
  const index = providers.findIndex(p => p.id === parseInt(providerId));
  if (index === -1) {
    throw new Error(`Proveedor con ID ${providerId} no encontrado`);
  }
  
  providers[index] = updatedProvider;
  await saveToGitHub(githubToken, providers, currentFile.sha, 'Actualizar proveedor');
  
  return new Response(
    JSON.stringify({ success: true, message: 'Proveedor actualizado' }),
    { status: 200, headers: corsHeaders }
  );
}

// DELETE: Eliminar proveedor
async function handleDelete(githubToken, providerId) {
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(decodeBase64(currentFile.content)); // Fix UTF-8
  
  const filtered = providers.filter(p => p.id !== parseInt(providerId));
  
  if (filtered.length === providers.length) {
    throw new Error(`Proveedor con ID ${providerId} no encontrado`);
  }
  
  await saveToGitHub(githubToken, filtered, currentFile.sha, 'Eliminar proveedor');
  
  return new Response(
    JSON.stringify({ success: true, message: 'Proveedor eliminado' }),
    { status: 200, headers: corsHeaders }
  );
}

// Helper: Obtener archivo de GitHub
async function getGitHubFile(githubToken) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('No se pudo cargar el archivo');
  }

  return response.json();
}

// Helper: Guardar archivo en GitHub
async function saveToGitHub(githubToken, providers, sha, message) {
  const content = encodeBase64(JSON.stringify(providers, null, 2)); // Fix UTF-8 v11.0
  
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: content,
        sha: sha,
        branch: BRANCH
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al guardar en GitHub');
  }

  return response.json();
}

// Fix UTF-8 v11.0: Decodificar Base64 correctamente
function decodeBase64(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Fix UTF-8 v11.0: Codificar Base64 correctamente
function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}