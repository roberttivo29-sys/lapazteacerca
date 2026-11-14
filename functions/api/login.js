// ========================================
// LA PAZ TE ACERCA - Worker de Autenticación
// Valida usuario/contraseña contra Cloudflare Secrets
// ========================================

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await request.json();

    // Validar contra secrets de Cloudflare
    const validUser = env.ADMIN_USER || 'admin';
    const validPass = env.ADMIN_PASS;

    if (!validPass) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Contraseña de administrador no configurada. Contacta al desarrollador.' 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (username === validUser && password === validPass) {
      // Generar token de sesión simple (en producción usar JWT)
      const token = generateSessionToken(username);
      
      return new Response(
        JSON.stringify({
          success: true,
          token: token,
          user: username,
          expires: Date.now() + (2 * 60 * 60 * 1000) // 2 horas
        }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Usuario o contraseña incorrectos' 
        }),
        { status: 401, headers: corsHeaders }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'Error en el servidor: ' + error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Generar token simple (en producción usar JWT con firma)
function generateSessionToken(username) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${username}:${timestamp}:${random}`);
}

// Validar token (para usar en otros Workers)
export function validateToken(token) {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    
    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    // Token válido si tiene menos de 2 horas
    return (now - timestamp) < twoHours;
  } catch {
    return false;
  }
}