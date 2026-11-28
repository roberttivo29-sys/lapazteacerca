// ========================================
// LA PAZ TE ACERCA — Sistema de Invitaciones v14.1
// ========================================
// Plantillas de invitación para captar nuevos proveedores
// Estructura: 8 bases (una por categoría) + líneas variables por subcategoría
// Tono: Híbrido (corporativo + cercano)
// Oferta: Enero + Febrero GRATIS (lanzamiento diciembre)
// ========================================

const plantillasInvitacion = {
  // ============================================================
  // SALUD Y BIENESTAR
  // ============================================================
  "Salud y Bienestar": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu local o trabajo (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Clínicas y Urgencias": "Como clínica, los vecinos podrán contactarte directo ante emergencias y consultas médicas, sin pasar por terceros.",
      "Consultorios y Especialistas": "Como consultorio, aparecerás cuando los pacientes busquen especialistas en tu zona.",
      "Odontología": "Como consultorio dental, los pacientes te encontrarán cuando necesiten limpieza, ortodoncia o tratamientos.",
      "Laboratorios y Análisis": "Como laboratorio, los pacientes te contactarán directo para sus análisis clínicos.",
      "Veterinaria y Mascotas": "Como veterinario, los dueños de mascotas te encontrarán cuando necesiten atención para sus animales.",
      "Óptica y Audición": "Como óptica, los clientes te contactarán para exámenes de vista y compra de lentes.",
      "Ambulancias y Traslados": "Como servicio de ambulancia, las familias te contactarán en emergencias y traslados médicos.",
      "Fisioterapia y Rehabilitación": "Como fisioterapeuta, los pacientes te encontrarán cuando necesiten rehabilitación.",
      "Otros Servicios de Salud": "Como proveedor de salud, los vecinos te contactarán para sus necesidades médicas."
    }
  },

  // ============================================================
  // MANTENIMIENTO DEL HOGAR
  // ============================================================
  "Mantenimiento del Hogar": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu trabajo (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Plomería": "Como plomero, los vecinos te contactarán directo ante fugas y emergencias, sin intermediarios.",
      "Electricidad": "Como electricista, aparecerás cuando los vecinos busquen instalaciones o reparaciones eléctricas en tu zona.",
      "Albañilería y Reparaciones": "Como albañil, los propietarios te encontrarán cuando necesiten reparaciones o ampliaciones.",
      "Pintura y Acabados": "Como pintor, los vecinos verán tu trabajo con fotos reales antes de contactarte.",
      "Cerrajería": "Como cerrajero, te contactarán directo en emergencias de cerraduras, sin intermediarios.",
      "Carpintería": "Como carpintero, los clientes te encontrarán cuando necesiten muebles o reparaciones en madera.",
      "Limpieza y Fumigación": "Como servicio de limpieza, los hogares y oficinas te contactarán para mantenimiento.",
      "Jardinería y Paisajismo": "Como jardinero, los propietarios te encontrarán para el cuidado de sus áreas verdes.",
      "Instalación y Mantenimiento de Gas": "Como técnico en gas, las familias te contactarán para instalaciones seguras.",
      "Otros Oficios del Hogar": "Como proveedor de servicios para el hogar, los vecinos te contactarán para sus necesidades."
    }
  },

  // ============================================================
  // MATERIALES DE CONSTRUCCIÓN
  // ============================================================
  "Materiales de Construcción": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Productos que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu local (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Cemento, Estuco y Yeso": "Como distribuidor de cemento, los constructores te contactarán para sus obras.",
      "Áridos: Arena, Grava y Piedra": "Como proveedor de áridos, las obras te contactarán para sus materiales.",
      "Ladrillos, Bloques y Prefabricados": "Como fabricante de ladrillos, los albañiles te encontrarán para sus proyectos.",
      "Barracas de Madera y Cubiertas": "Como barraca de madera, los carpinteros y constructores te contactarán.",
      "Alquiler de Equipos y Maquinaria": "Como proveedor de maquinaria, las obras te contactarán para alquiler de equipos."
    }
  },

  // ============================================================
  // TALLERES AUTOMOTRICES
  // ============================================================
  "Talleres Automotrices": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del taller
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu taller (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Taller Mecánico General": "Como taller mecánico, los conductores te contactarán para reparaciones y mantenimiento.",
      "Frenos y Suspensión": "Como especialista en frenos, los conductores te encontrarán cuando necesiten seguridad en su vehículo.",
      "Muñonería (Alineación y Balanceo)": "Como muñonero, los conductores te contactarán para alineación y balanceo.",
      "Chapistería y Pintura": "Como chapista, los conductores te encontrarán cuando necesiten enderezado o pintura.",
      "Electricidad y Electromecánica": "Como electricista automotriz, los conductores te contactarán para fallas eléctricas.",
      "Grúas y Auxilio Vial": "Como servicio de grúa, los conductores te contactarán en emergencias las 24 horas.",
      "Lavado y Detallado": "Como servicio de lavado, los conductores te encontrarán para el cuidado de su vehículo.",
      "Repuestos y Accesorios": "Como vendedor de repuestos, los conductores y talleres te contactarán.",
      "Lubricentros y Cambio de Aceite": "Como lubricentro, los conductores te contactarán para cambio de aceite.",
      "Otros Servicios Automotrices": "Como proveedor automotriz, los conductores te encontrarán para sus necesidades."
    }
  },

  // ============================================================
  // TECNOLOGÍA Y REDES
  // ============================================================
  "Tecnología y Redes": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu local o trabajo (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Reparación de PC y Laptops": "Como técnico en computación, los vecinos te contactarán para reparaciones de PC y laptops.",
      "Reparación de Celulares y Tablets": "Como técnico en celulares, los vecinos te encontrarán cuando necesiten reparar sus dispositivos.",
      "Cámaras de Seguridad y CCTV": "Como instalador de cámaras, los hogares y negocios te contactarán para seguridad.",
      "Redes e Internet": "Como técnico en redes, los vecinos te contactarán para instalaciones de internet.",
      "Soporte Técnico a Domicilio": "Como técnico a domicilio, los vecinos te encontrarán para soporte en su hogar u oficina.",
      "Impresoras y Suministros de Oficina": "Como proveedor de impresoras, las oficinas te contactarán para mantenimiento.",
      "Videojuegos y Consolas": "Como técnico en consolas, los gamers te contactarán para reparaciones.",
      "Otros Servicios Tecnológicos": "Como proveedor tecnológico, los vecinos te encontrarán para sus necesidades."
    }
  },

  // ============================================================
  // SERVICIOS DE DESPEDIDA
  // ============================================================
  "Servicios de Despedida": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu local (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Funerarias y Velatorios": "Como funeraria, las familias te contactarán en momentos difíciles con respeto y transparencia.",
      "Cremación y Urnas": "Como servicio de cremación, las familias te encontrarán para honrar a sus seres queridos.",
      "Floristerías y Homenajes": "Como floristería, las familias te contactarán para homenajes y arreglos florales.",
      "Trámites y Gestoría Funeraria": "Como gestoría funeraria, las familias te contactarán para trámites en momentos difíciles."
    }
  },

  // ============================================================
  // SERVICIOS PARA EVENTOS
  // ============================================================
  "Servicios para Eventos": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu trabajo (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Filmación y Fotografía": "Como fotógrafo, los clientes te contactarán para bodas, quinceañeros y eventos.",
      "Sonido e Iluminación": "Como proveedor de sonido, los organizadores te contactarán para sus eventos.",
      "Bandas y Música en Vivo": "Como banda, los clientes te encontrarán para amenizar sus eventos.",
      "Locales y Salones de Eventos": "Como salón de eventos, los clientes te contactarán para sus celebraciones.",
      "Decoración y Mobiliario": "Como decorador, los clientes te encontrarán para hacer sus eventos inolvidables.",
      "Catering y Banquetes": "Como servicio de catering, los clientes te contactarán para sus eventos.",
      "Animación y Espectáculos": "Como animador, los clientes te encontrarán para hacer sus eventos especiales.",
      "Alquiler de Vestuario y Trajes": "Como proveedor de vestuario, los clientes te contactarán para sus eventos.",
      "Otros Servicios para Eventos": "Como proveedor de eventos, los clientes te encontrarán para sus celebraciones."
    }
  },

  // ============================================================
  // IMAGEN Y CUIDADO PERSONAL
  // ============================================================
  "Imagen y Cuidado Personal": {
    base: `Hola [NOMBRE], te saluda el equipo de La Paz te Acerca.

Somos el directorio de servicios verificados de La Paz y El Alto.
Nuestro objetivo es conectar a los vecinos con profesionales de confianza,
sin intermediarios ni comisiones.

🎁 OFERTA DE LANZAMIENTO (diciembre):
Registro gratuito durante enero y febrero. Sin costo, sin compromiso.

👉 [LINEA_VARIABLE] 👈

Para registrarte necesitamos:
1. Nombre del negocio
2. Servicios que ofreces
3. Dirección exacta
4. WhatsApp de contacto
5. Una foto de tu local o trabajo (opcional)

Si te interesa, responde con esos datos y lo publicamos esta semana.

Atentamente,
Equipo La Paz te Acerca`,

    lineas: {
      "Barberías": "Como barbero, los clientes te encontrarán para cortes y arreglo de barba.",
      "Salones de Belleza Unisex": "Como salón de belleza, los clientes te contactarán para cortes y tratamientos.",
      "Centros de Estética": "Como centro de estética, los clientes te encontrarán para tratamientos faciales y corporales.",
      "Maquillaje Profesional": "Como maquillador, los clientes te contactarán para bodas y eventos especiales.",
      "Spas y Masajes": "Como spa, los clientes te encontrarán para relajación y bienestar.",
      "Servicios a Domicilio": "Como proveedor a domicilio, los clientes te contactarán en la comodidad de su hogar."
    }
  }
};


// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Genera el mensaje de invitación completo
 * @param {string} categoria - Categoría del proveedor
 * @param {string} subcategoria - Subcategoría del proveedor
 * @param {string} nombreProveedor - Nombre del proveedor (opcional, para personalizar)
 * @returns {string} Mensaje completo listo para copiar
 */
function generarMensajeInvitacion(categoria, subcategoria, nombreProveedor = '') {
  const plantilla = plantillasInvitacion[categoria];
  
  if (!plantilla) {
    return 'Categoría no encontrada';
  }

  let mensaje = plantilla.base;

  // Reemplazar [NOMBRE] si se proporcionó
  if (nombreProveedor) {
    mensaje = mensaje.replace('[NOMBRE]', nombreProveedor);
  } else {
    mensaje = mensaje.replace('[NOMBRE]', '');
  }

  // Reemplazar [LINEA_VARIABLE] con la línea específica de la subcategoría
  const lineaVariable = plantilla.lineas[subcategoria] || '';
  mensaje = mensaje.replace('👉 [LINEA_VARIABLE] 👈', lineaVariable);

  return mensaje;
}


/**
 * Copia el mensaje al portapapeles
 * @param {string} mensaje - Mensaje a copiar
 * @returns {Promise<void>}
 */
async function copiarMensajeInvitacion(mensaje) {
  try {
    await navigator.clipboard.writeText(mensaje);
    return true;
  } catch (error) {
    console.error('Error al copiar:', error);
    return false;
  }
}


/**
 * Obtiene la lista de categorías disponibles
 * @returns {string[]} Array de categorías
 */
function obtenerCategoriasInvitacion() {
  return Object.keys(plantillasInvitacion);
}


/**
 * Obtiene las subcategorías de una categoría
 * @param {string} categoria - Categoría
 * @returns {string[]} Array de subcategorías
 */
function obtenerSubcategoriasInvitacion(categoria) {
  const plantilla = plantillasInvitacion[categoria];
  if (!plantilla) return [];
  return Object.keys(plantilla.lineas);
}


// ========================================
// EXPORTAR PARA USO GLOBAL
// ========================================
if (typeof window !== 'undefined') {
  window.generarMensajeInvitacion = generarMensajeInvitacion;
  window.copiarMensajeInvitacion = copiarMensajeInvitacion;
  window.obtenerCategoriasInvitacion = obtenerCategoriasInvitacion;
  window.obtenerSubcategoriasInvitacion = obtenerSubcategoriasInvitacion;
  window.plantillasInvitacion = plantillasInvitacion;
}