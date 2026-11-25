// ========================================
// LA PAZ TE ACERCA - Worker de Autenticación v13.0
// Valida usuario/contraseña con HMAC-SHA256
//
// Novedades v13.0:
// - FIX SEGURIDAD: Fail-closed en ADMIN_USER.
//   (Antes: si ADMIN_USER no estaba configurado, caía en 'admin' por defecto.
//    Ahora: si falta, error 500. No se permite login con credenciales predeterminadas.)
// - Se mantiene TODO el código original: CORS, OPTIONS, HMAC, validateToken export, etc.
// ========================================

export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { username, password } = await request.json();

        // FIX v13.0: Fail-closed. Sin || 'admin'. Si falta, error 500.
        const validUser = env.ADMIN_USER;
        const validPass = env.ADMIN_PASS;

        // SESSION_SECRET obligatorio
        const secret = env.SESSION_SECRET;
        if (!secret) {
            return new Response(
                JSON.stringify({ error: true, message: 'SESSION_SECRET no configurado en el servidor. Contacta al desarrollador.' }),
                { status: 500, headers: corsHeaders }
            );
        }

        if (!validUser) {
            return new Response(
                JSON.stringify({ error: true, message: 'Usuario de administrador no configurado.' }),
                { status: 500, headers: corsHeaders }
            );
        }

        if (!validPass) {
            return new Response(
                JSON.stringify({ error: true, message: 'Contraseña de administrador no configurada.' }),
                { status: 500, headers: corsHeaders }
            );
        }

        if (username === validUser && password === validPass) {
            const token = await generateSessionToken(username, secret);

            return new Response(
                JSON.stringify({
                    success: true,
                    token: token,
                    user: username,
                    expires: Date.now() + (2 * 60 * 60 * 1000)
                }),
                { status: 200, headers: corsHeaders }
            );
        } else {
            return new Response(
                JSON.stringify({ error: true, message: 'Usuario o contraseña incorrectos' }),
                { status: 401, headers: corsHeaders }
            );
        }
    } catch (error) {
        return new Response(
            JSON.stringify({ error: true, message: 'Error en el servidor: ' + error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// Generar token HMAC con exp real (login + 2h)
async function generateSessionToken(username, secret) {
    const exp = Date.now() + (2 * 60 * 60 * 1000); // 2 horas reales
    const payload = `${username}:${exp}`;
    const sig = await signHMAC(payload, secret);
    return btoa(`${payload}:${sig}`);
}

// Firmar con HMAC-SHA256
// FIX v12.2.2: primer argumento = 'raw' (formato de clave), no 'HMAC'
async function signHMAC(payload, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',                                          // ← FIX: formato de la clave
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },              // ← algoritmo
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Validar token HMAC (exp real)
export async function validateToken(token, secret) {
    if (!token) return false;
    try {
        const decoded = atob(token);
        const parts = decoded.split(':');
        if (parts.length !== 3) return false;

        const [user, exp, sig] = parts;
        const timestamp = parseInt(exp);
        const now = Date.now();

        if (now > timestamp) return false;

        const expectedSig = await signHMAC(`${user}:${exp}`, secret);
        return expectedSig === sig;
    } catch {
        return false;
    }
}