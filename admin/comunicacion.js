// ========================================
// LA PAZ TE ACERCA — Plantillas de Comunicación v14.0
// ========================================
// Mensajes de WhatsApp para el ciclo de vida del proveedor:
//   1. invitacion        → Primer contacto (prospectar negocio)
//   2. seguimiento       → Consulta quincenal de verificación
//   3. avisoQueja        → Notificación de queja recibida (1 o 2)
//   4. bajaDefinitiva    → Retiro tras 3 quejas válidas
//   5. bienvenida        → Al activar un proveedor registrado
//
// Uso: copiar el texto y pegar en WhatsApp.
// Reemplazar [variables] antes de enviar.
// ========================================

const plantillasComunicacion = {

  // ---------- 1. INVITACIÓN (prospectar) ----------
  invitacion: `¡Hola! Le escribo de *La Paz te Acerca* (lapazteacerca.pages.dev), un directorio vecinal que conecta a ciudadanos de La Paz y El Alto con proveedores de confianza, sin intermediarios y sin comisiones.

🔎 ¿Cómo funciona?
Usted publica su servicio en la web. Cuando un vecino lo necesita, le escribe DIRECTAMENTE a SU número de WhatsApp. Nosotros solo somos el puente. Usted atiende, usted cobra, usted decide.

🎁 Invitación gratuita hasta fin de año:
• Publicación completa en el directorio (nombre, servicio, horario, fotos, WhatsApp).
• Sin costo. Sin compromiso.
• Si le sirve, en enero tendrá *2 meses de promoción destacada* gratis para que evalúe el resultado.

✅ Para registrarlo solo necesito:
1. Nombre del negocio
2. Tipo de servicio (ej: plomería, clínica, taller, barbería…)
3. Dirección aproximada (barrio / zona)
4. Su número de WhatsApp
5. Horario de atención
6. Fotos del local o trabajo (si tiene; si no, usamos imágenes de muestra mientras nos envía las suyas)

💡 Si está muy ocupado, solo respóndame este mensaje con un *audio* diciéndome el nombre de su negocio y a qué se dedica, y envíe *una foto* de su trabajo. Yo me encargo de armar el perfil profesional. Así de fácil.

📌 Compromiso de calidad (nuestro y suyo):
Para proteger a los buenos profesionales como usted, tenemos una regla simple: si un proveedor recibe 3 quejas válidas, se le retira del directorio. Así garantizamos que los vecinos confíen en nuestra recomendación y lleguen a usted con tranquilidad.

¿Le interesa? Solo responda este mensaje y en menos de 24 horas está publicado. 🚀

Saludos,
Equipo La Paz te Acerca
📞 WhatsApp: 76536286
🌐 lapazteacerca.pages.dev`,

  // ---------- 2. SEGUIMIENTO QUINCENAL ----------
  seguimiento: `¡Hola! 👋

Le escribo de *La Paz te Acerca* para una verificación rápida de rutina.

¿Sigue atendiendo con normalidad en *[NOMBRE_NEGOCIO]*?

• Si todo está bien, responda: *SÍ*
• Si cambió el horario, dirección o WhatsApp, dígame el nuevo dato y lo actualizamos.
• Si ya no desea seguir en el directorio, responda: *BAJA*

Esto nos ayuda a mantener la información al día para los vecinos. Solo toma 10 segundos. 🙏

— Equipo La Paz te Acerca`,

  // ---------- 3. AVISO DE QUEJA (1 o 2) ----------
  avisoQueja: `¡Hola! Le escribo de *La Paz te Acerca*.

Hemos recibido una *queja registrada* sobre su servicio:

📋 Motivo: [DESCRIPCIÓN_BREVE]
📅 Fecha: [FECHA]

Le pedimos que revise el caso y nos responda con su versión para mantener el registro equilibrado.

⚠️ Recuerde: a la *3ra queja válida*, el perfil se retira automáticamente del directorio. Hasta ahora lleva *[NÚMERO]* de 3.

Estamos aquí para resolver, no para sancionar. Responda cuando pueda. 🙏

— Equipo La Paz te Acerca`,

  // ---------- 4. BAJA DEFINITIVA (3 quejas) ----------
  bajaDefinitiva: `¡Hola! Le escribo de *La Paz te Acerca*.

Lamentamos informarle que el perfil de *[NOMBRE_NEGOCIO]* ha sido *retirado del directorio* tras alcanzar las 3 quejas válidas establecidas en nuestra política de calidad.

Esta medida protege la confianza de los vecinos y, a la vez, a los demás proveedores que cumplen bien.

Si considera que hubo un error en el registro, puede responder este mensaje y revisaremos el caso. Si en el futuro desea reincorporarse con un nuevo compromiso de servicio, estaremos disponibles.

Gracias por haber formado parte del directorio. 🙏

— Equipo La Paz te Acerca`,

  // ---------- 5. BIENVENIDA (al activar) ----------
  bienvenida: `¡Hola! 🎉

Su negocio *[NOMBRE_NEGOCIO]* ya está publicado en *La Paz te Acerca*:
🌐 lapazteacerca.pages.dev

¿Qué sigue?
• Los vecinos pueden encontrarlo por categoría o buscador.
• Le escriben directo a SU WhatsApp. Usted atiende, usted decide.
• Cada 15 días le enviaremos una consulta rápida para verificar que todo va bien.
• Si tiene fotos reales del local o trabajo, envíelas y reemplazamos las de muestra.

Su promoción gratuita está activa *hasta fin de año*. En enero, si le sirvió, tendrá *2 meses de destacado gratis*.

¡Bienvenido al directorio! 🚀

— Equipo La Paz te Acerca`

};

// ---------- HELPERS ----------
function obtenerPlantilla(nombre, reemplazos = {}) {
  let texto = plantillasComunicacion[nombre] || '';
  for (const [clave, valor] of Object.entries(reemplazos)) {
    texto = texto.replaceAll(`[${clave}]`, valor);
  }
  return texto;
}

function copiarPlantilla(nombre, reemplazos = {}) {
  const texto = obtenerPlantilla(nombre, reemplazos);
  navigator.clipboard.writeText(texto).then(() => {
    console.log(`✅ Plantilla "${nombre}" copiada al portapapeles`);
  });
}