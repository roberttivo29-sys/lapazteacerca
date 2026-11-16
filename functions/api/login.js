// ========================================
// LA PAZ TE ACERCA - Worker de Autenticación v11.0
// Valida usuario/contraseña con HMAC (fix crítico de seguridad)
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
      // Generar token HMAC seguro (fix v11.0)
      const token = await generateSessionToken(username, env.SESSION_SECRET || 'default-secret-change-me');
      
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

// Generar token HMAC seguro (fix v11.0)
async function generateSessionToken(username, secret) {
  const exp = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
  const payload = `${username}:${exp}`;
  const sig = await signHMAC(payload, secret);
  return btoa(`${payload}:${sig}`);
}

// Firmar con HMAC-SHA256
async function signHMAC(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'HMAC',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Validar token HMAC (para usar en otros Workers)
export async function validateToken(token, secret) {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    
    const [user, exp, sig] = parts;
    const timestamp = parseInt(exp);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    // Token válido si tiene menos de 2 horas y la firma coincide
    if ((now - timestamp) > twoHours) return false;
    
    const expectedSig = await signHMAC(`${user}:${exp}`, secret);
    return expectedSig === sig;
  } catch {
    return false;
  }
}