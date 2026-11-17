// ========================================
// LA PAZ TE ACERCA - Worker de Subida de Imágenes v12.0
// Sube imágenes a ImgBB usando la API key secreta
// ========================================

import { validateToken } from './login.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization',
  'Content-Type': 'application/json'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function onRequestPost(context) {
  const { request, env } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token requerido' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const token = authHeader.substring(7);
  const secret = env.SESSION_SECRET;
  
  if (!secret) {
    return new Response(
      JSON.stringify({ error: true, message: 'SESSION_SECRET no configurado' }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  if (!await validateToken(token, secret)) {
    return new Response(
      JSON.stringify({ error: true, message: 'Token inválido o expirado' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const imgbbApiKey = env.IMGBB_API_KEY;
  if (!imgbbApiKey) {
    return new Response(
      JSON.stringify({ error: true, message: 'API key de ImgBB no configurada' }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const numero = formData.get('numero') || '1';

    if (!file) {
      return new Response(
        JSON.stringify({ error: true, message: 'No se proporcionó imagen' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: true, message: 'Tipo de imagen no permitido. Use JPG, PNG o WebP' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: true, message: 'La imagen no puede superar los 5MB' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', file);
    imgbbFormData.append('key', imgbbApiKey);

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData
    });

    if (!imgbbResponse.ok) {
      const error = await imgbbResponse.json();
      throw new Error(error.error?.message || 'Error al subir a ImgBB');
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      throw new Error(imgbbData.error?.message || 'Error en ImgBB');
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: imgbbData.data.url,
        display_url: imgbbData.data.display_url,
        size: imgbbData.data.size,
        numero: numero
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}