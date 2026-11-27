// ========================================
// LA PAZ TE ACERCA — Plantillas de Contenido v14.0 (Piloto)
// ========================================
// Este archivo NO se importa todavía en el admin.
// Se activa en el Paso B cuando modifiquemos admin/index.html.
//
// Estructura:
//   plantillasServicios[subcategoria] = [array de descripciones]
//   imagenesMuestra[subcategoria]     = [array de URLs de imágenes]
//
// Regla de oro de las descripciones:
//   - Lenguaje claro, sin tecnicismos
//   - Compromiso con el PROCESO, no con resultados mágicos
//   - Sin "garantía de por vida", sin "llego en 5 minutos"
//   - Protege al proveedor Y genera confianza en el cliente
// ========================================

// ---------- DESCRIPCIONES SUGERIDAS ----------
const plantillasServicios = {

  // === MANTENIMIENTO DEL HOGAR ===
  "Electricidad": [
    "Instalaciones y reparaciones eléctricas residenciales bajo estándares de seguridad. Diagnóstico responsable y presupuesto claro antes de iniciar cualquier trabajo.",
    "Atención de emergencias eléctricas y mantenimiento preventivo. Respuesta ágil, trabajo limpio y explicación detallada de la solución aplicada.",
    "Servicio profesional de electricidad para hogares y locales. Cambio de cableado, instalación de luminarias y tableros, con materiales de calidad y garantía sobre la mano de obra.",
    "Revisión, mantenimiento y reparación de sistemas eléctricos. Priorizamos la prevención de riesgos y ofrecemos soluciones duraderas con atención personalizada.",
    "Electricista con experiencia en instalaciones domiciliarias. Presupuestos transparentes, sin costos ocultos, y trabajo ordenado al finalizar."
  ],

  "Plomería": [
    "Destapes, reparaciones de fugas e instalaciones sanitarias. Presupuesto claro antes de trabajar y explicación de la solución aplicada.",
    "Servicio de plomería para emergencias en el hogar. Respuesta ágil, herramientas propias y trabajo limpio al finalizar.",
    "Instalación y reparación de tuberías, grifería y desagües. Materiales de calidad y garantía sobre la mano de obra realizada.",
    "Plomero con experiencia en viviendas y locales comerciales. Diagnóstico honesto: si no hay que cambiar algo, no se cobra.",
    "Atención de fugas, sifones, inodoros y duchas. Cotización por escrito antes de comenzar el trabajo."
  ],

  // === SALUD Y BIENESTAR ===
  "Laboratorios y Análisis": [
    "Análisis clínicos con resultados en 24 horas. Toma de muestras en laboratorio y a domicilio. Entrega de informes por WhatsApp.",
    "Laboratorio certificado con equipamiento moderno. Precios accesibles, atención sin largas esperas y convenios con seguros y empresas.",
    "Estudios de sangre, orina, heces y perfiles especializados. Bioseguridad garantizada y confidencialidad total de tus resultados.",
    "Servicio integral de laboratorio: desde análisis de rutina hasta estudios especializados. Resultados explicados por profesional.",
    "Toma de muestras a domicilio con entrega de resultados el mismo día. Atención personalizada y precios transparentes."
  ]

};

// ---------- IMÁGENES DE MUESTRA (Unsplash, uso libre) ----------
const imagenesMuestra = {

  "Electricidad": [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop"
  ],

  "Plomería": [
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1584622650114-93eb43884739?w=600&h=400&fit=crop"
  ],

  "Laboratorios y Análisis": [
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581093588401-fbb65a577770?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719471382-898dabaf3ead?w=600&h=400&fit=crop"
  ]

};

// ---------- HELPERS (se usarán en el Paso B) ----------
function obtenerPlantillas(subcategoria) {
  return plantillasServicios[subcategoria] || [];
}

function obtenerImagenesMuestra(subcategoria) {
  return imagenesMuestra[subcategoria] || [];
}

function tienePlantillas(subcategoria) {
  return plantillasServicios.hasOwnProperty(subcategoria);
}